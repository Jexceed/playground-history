import { createVoicePlayer, idleVoiceSnapshot } from "./voice-player";
export type { VoicePlaybackResult } from "./voice-player";

const player = createVoicePlayer((id) => {
  const audio = new Audio(`/audio/voice/zh-CN/xiaoxiao/${id}.mp3`);
  audio.preload = "auto";
  audio.volume = 0.96;
  return audio;
});

player.subscribe(() => {
  if (typeof document === "undefined") return;
  const { status, id } = player.getSnapshot();
  document.documentElement.dataset.voiceSource = `local-mp3-${status === "ended" ? "ready" : status}`;
  document.documentElement.dataset.voiceId = id ?? "";
});

export const subscribeVoice = player.subscribe;
export const getVoiceSnapshot = player.getSnapshot;
export const getServerVoiceSnapshot = () => idleVoiceSnapshot;
export const pauseVoice = player.pause;
export const resumeVoice = player.resume;
export const stopVoice = player.stop;

export function playVoiceSequence(ids: string[]) {
  if (typeof window === "undefined") return Promise.resolve("stopped" as const);
  return player.play(ids);
}

export function playVoice(id: string) {
  return playVoiceSequence([id]);
}
