type VoiceRef = { id: string };
type StepKind = { interaction?: { kind: string; rounds?:Array<{audio:{question:VoiceRef}}> } | null };
type SpokenStep = StepKind & { audio: { lead?: VoiceRef | null; transition: VoiceRef; intro: VoiceRef; question: VoiceRef } };

export function stepVoiceIds(step: SpokenStep): string[] {
  // Reading pages must tell the story, not only announce that a story follows.
  if (["look-listen", "history-lab"].includes(step.interaction?.kind ?? "")) return [step.audio.intro.id];
  if (step.interaction?.kind === "scene-find" && step.interaction.rounds?.[0]) return [step.audio.intro.id, step.interaction.rounds[0].audio.question.id];
  return step.audio.lead ? [step.audio.lead.id] : [step.audio.transition.id, step.audio.intro.id, step.audio.question.id];
}

export function canContinueStep(step: StepKind | null | undefined, solved: boolean): boolean {
  return Boolean(step && (solved || step.interaction?.kind === "look-listen"));
}
