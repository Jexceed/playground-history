export const PROGRESS_STORAGE_KEY = "little-history-progress-v2";
export const LEGACY_COMPLETED_KEY = "little-history-completed-chapters-v1";
export type SavedQuest = { chapterId: string; stepId: string; contentVersion: string; completedStepIds?: string[] };
export type LocalProgress = { schemaVersion: 2; completed: string[]; current: SavedQuest | null };
type ChapterIndex = Map<string, { gameplay: { steps: { id: string }[] } }>;
export function emptyProgress(): LocalProgress { return { schemaVersion: 2, completed: [], current: null }; }

export function parseProgress(raw: string | null, legacyRaw: string | null, chapters: ChapterIndex, contentVersion: string): LocalProgress {
  const progress = emptyProgress();
  let stored: unknown;
  try { stored = raw ? JSON.parse(raw) : null; } catch { stored = null; }
  const valid = stored && typeof stored === "object" && "schemaVersion" in stored && stored.schemaVersion === 2
    ? stored as Partial<LocalProgress> : null;
  let completed: unknown = valid?.completed;
  if (!Array.isArray(completed)) {
    try { completed = legacyRaw ? JSON.parse(legacyRaw) : []; } catch { completed = []; }
  }
  if (Array.isArray(completed)) progress.completed = [...new Set(completed.filter((id): id is string => typeof id === "string" && chapters.has(id)))];
  const current = valid?.current;
  if (current && typeof current.chapterId === "string" && typeof current.stepId === "string" && current.contentVersion === contentVersion
      && chapters.get(current.chapterId)?.gameplay.steps.some((step) => step.id === current.stepId)) {
    progress.current = { chapterId: current.chapterId, stepId: current.stepId, contentVersion };
    if ("completedStepIds" in current) {
      const steps = chapters.get(current.chapterId)!.gameplay.steps;
      progress.current.completedStepIds = steps.filter(step => Array.isArray(current.completedStepIds) && current.completedStepIds.includes(step.id)).map(step => step.id);
    }
  }
  return progress;
}

/** Records written before free navigation came from a strictly sequential flow. */
export function completedQuestSteps(saved: SavedQuest | null, steps: { id: string }[]): string[] {
  if (!saved) return [];
  if (saved.completedStepIds) return steps.filter(step => saved.completedStepIds!.includes(step.id)).map(step => step.id);
  const index = steps.findIndex(step => step.id === saved.stepId);
  return index > 0 ? steps.slice(0, index).map(step => step.id) : [];
}

export function recordCompletedStep(steps: { id: string }[], completed: string[], stepId: string): string[] {
  return steps.filter(step => step.id === stepId || completed.includes(step.id)).map(step => step.id);
}

/** Continue to the next unfinished step, wrapping around after an out-of-order visit. */
export function nextUnfinishedStep(steps: { id: string }[], completed: string[], currentIndex: number): number {
  const next = steps.findIndex((step, index) => index > currentIndex && !completed.includes(step.id));
  return next >= 0 ? next : steps.findIndex(step => !completed.includes(step.id));
}

export function exportProgress(progress:LocalProgress, contentVersion:string):string {
  return JSON.stringify({app:'小小历史旅行团',exportedAt:new Date().toISOString(),contentVersion,...progress},null,2)+'\n';
}

/** Import is additive: a malformed file never clears existing local progress. */
export function mergeProgressImport(raw:string, existing:LocalProgress, chapters:ChapterIndex, contentVersion:string):LocalProgress {
  if(new TextEncoder().encode(raw).byteLength>262144)throw new Error('学习记录文件过大。');
  let value:unknown;
  try{value=JSON.parse(raw.replace(/^\uFEFF/,''));}catch{throw new Error('这不是有效的学习记录文件。');}
  if(!value||typeof value!=='object'||!('schemaVersion' in value)||value.schemaVersion!==2||!('completed' in value)||!Array.isArray(value.completed)||!value.completed.every(id=>typeof id==='string'))throw new Error('请选择小小历史旅行团导出的学习记录。');
  const incoming=parseProgress(JSON.stringify(value),null,chapters,contentVersion);
  const current=incoming.current??existing.current;
  if(current&&incoming.current&&existing.current?.chapterId===current.chapterId&&existing.current.contentVersion===contentVersion
    &&(incoming.current.completedStepIds!==undefined||existing.current.completedStepIds!==undefined)){
    const steps=chapters.get(current.chapterId)!.gameplay.steps;
    const combined=new Set([...completedQuestSteps(existing.current,steps),...completedQuestSteps(incoming.current,steps)]);
    return {schemaVersion:2,completed:[...new Set([...existing.completed,...incoming.completed])],current:{...current,completedStepIds:steps.filter(step=>combined.has(step.id)).map(step=>step.id)}};
  }
  return {schemaVersion:2,completed:[...new Set([...existing.completed,...incoming.completed])],current};
}

/** Preserve the authored bank, presenting one stable distractor and one correct answer. */
export function listenOptions<T extends { id: string; correct: boolean }>(options: T[], seed: string): T[] {
  const correct = options.find((option) => option.correct);
  const wrong = options.filter((option) => !option.correct);
  if (!correct || !wrong.length) return options;
  let hash = 2166136261;
  for (const character of seed) hash = Math.imul(hash ^ character.codePointAt(0)!, 16777619) >>> 0;
  const distractor = wrong[(hash >>> 1) % wrong.length];
  return hash % 2 ? [correct, distractor] : [distractor, correct];
}
