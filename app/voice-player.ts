export type VoicePlaybackResult = "ended" | "stopped" | "blocked" | "error";
export type VoiceStatus = "idle" | "loading" | "playing" | "paused" | VoicePlaybackResult;
export type VoiceSnapshot = { status: VoiceStatus; id: string | null; index: number; total: number };
type VoiceAudio = Pick<HTMLAudioElement, "currentTime" | "play" | "pause" | "onended" | "onerror">;
type Session = { ids: string[]; index: number; paused: boolean; playAttempt: number; audio: VoiceAudio | null; resolve: (result: VoicePlaybackResult) => void };
export const idleVoiceSnapshot: VoiceSnapshot = { status: "idle", id: null, index: 0, total: 0 };

/** Each session owns a queue. A new request cancels both the clip and pending clips. */
export function createVoicePlayer(createAudio: (id: string) => VoiceAudio) {
  let snapshot: VoiceSnapshot = idleVoiceSnapshot;
  let active: Session | null = null;
  const listeners = new Set<() => void>();
  function publish(status: VoiceStatus, session: Session | null) {
    snapshot = { status, id: session?.ids[session.index] ?? null, index: session?.index ?? 0, total: session?.ids.length ?? 0 };
    listeners.forEach((listener) => listener());
  }
  function detach(audio: VoiceAudio | null) {
    if (audio) { audio.onended = null; audio.onerror = null; }
  }
  function finish(session: Session, result: VoicePlaybackResult) {
    if (active !== session) return;
    active = null;
    detach(session.audio);
    if (result !== "ended") session.audio?.pause();
    publish(result, session);
    session.resolve(result);
  }
  function startAudio(session: Session, audio: VoiceAudio) {
    if (active !== session || session.audio !== audio) return;
    const attempt = ++session.playAttempt;
    publish("loading", session);
    try {
      void audio.play().then(() => {
        if (active !== session || session.audio !== audio || attempt !== session.playAttempt) return;
        if (session.paused) { audio.pause(); publish("paused", session); }
        else publish("playing", session);
      }).catch((error: unknown) => {
        if (active !== session || session.audio !== audio || attempt !== session.playAttempt) return;
        if (session.paused && (error as { name?: string })?.name === "AbortError") return;
        finish(session, (error as { name?: string })?.name === "NotAllowedError" ? "blocked" : "error");
      });
    } catch { finish(session, "error"); }
  }
  function next(session: Session) {
    if (active !== session) return;
    detach(session.audio);
    let audio: VoiceAudio;
    try { audio = createAudio(session.ids[session.index]); }
    catch { finish(session, "error"); return; }
    session.audio = audio;
    audio.onended = () => {
      if (active !== session || session.audio !== audio) return;
      if (session.index === session.ids.length - 1) finish(session, "ended");
      else { session.index += 1; next(session); }
    };
    audio.onerror = () => { if (session.audio === audio) finish(session, "error"); };
    if (session.paused) publish("paused", session);
    else startAudio(session, audio);
  }
  function stop() {
    const session = active;
    if (!session) { if (snapshot.status !== "idle") publish("stopped", null); return; }
    finish(session, "stopped");
    try { if (session.audio) session.audio.currentTime = 0; } catch { /* Unloaded media may not be seekable. */ }
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    play(ids: string[]): Promise<VoicePlaybackResult> {
      stop();
      const queue = ids.filter(Boolean);
      if (!queue.length) { publish("stopped", null); return Promise.resolve("stopped"); }
      return new Promise((resolve) => {
        const session: Session = { ids: queue, index: 0, paused: false, playAttempt: 0, audio: null, resolve };
        active = session;
        next(session);
      });
    },
    pause() {
      if (!active?.audio) return false;
      active.paused = true;
      active.audio.pause();
      publish("paused", active);
      return true;
    },
    resume() {
      if (!active?.audio || !active.paused) return false;
      active.paused = false;
      startAudio(active, active.audio);
      return true;
    },
    stop,
  };
}
