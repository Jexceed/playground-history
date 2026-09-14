export const PROGRESS_STORAGE_KEY = "little-history-progress-v2";
export const LEGACY_COMPLETED_KEY = "little-history-completed-chapters-v1";
export type SavedQuest = { chapterId: string; stepId: string; contentVersion: string };
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
  }
  return progress;
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
