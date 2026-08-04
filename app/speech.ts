const voiceBase = "/audio/voice/zh-CN/xiaoxiao";

let activeAudio: HTMLAudioElement | null = null;

export async function playVoice(id: string) {
  stopVoice();
  if (typeof window === "undefined") return;

  const audio = new Audio(`${voiceBase}/${id}.mp3`);
  activeAudio = audio;
  audio.volume = 0.96;
  document.documentElement.dataset.voiceSource = "local-mp3";

  await new Promise<void>((resolve) => {
    audio.onended = () => resolve();
    audio.onerror = () => {
      document.documentElement.dataset.voiceSource = "local-mp3-error";
      resolve();
    };
    audio.play().catch(() => resolve());
  });

  if (activeAudio === audio) activeAudio = null;
}

export function stopVoice() {
  if (!activeAudio) return;
  activeAudio.pause();
  try {
    activeAudio.currentTime = 0;
  } catch {
    // The browser may block seeking before audio metadata is ready.
  }
  activeAudio = null;
}
