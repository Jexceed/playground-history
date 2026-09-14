import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createVoicePlayer } from "../app/voice-player.ts";
import { parseProgress, listenOptions } from "../app/quest-progress.ts";

const tick = () => new Promise((resolve) => setImmediate(resolve));
class FakeAudio {
  currentTime = 0;
  onended = null;
  onerror = null;
  plays = 0;
  pauses = 0;
  playResult = () => Promise.resolve();
  play() { this.plays += 1; return this.playResult(); }
  pause() { this.pauses += 1; }
  end() { this.onended?.(); }
}
function setup() {
  const created = [];
  const player = createVoicePlayer((id) => {
    const audio = new FakeAudio();
    created.push({ id, audio });
    return audio;
  });
  return { player, created };
}

test("pause and resume retain position and continue the remaining narration queue", async () => {
  const { player, created } = setup();
  const done = player.play(["story", "question"]);
  await tick();
  const audio = created[0].audio;
  audio.currentTime = 3.75;
  assert.equal(player.pause(), true);
  assert.equal(player.getSnapshot().status, "paused");
  assert.equal(audio.currentTime, 3.75);
  assert.equal(created.length, 1);
  assert.equal(player.resume(), true);
  await tick();
  assert.equal(audio.plays, 2);
  assert.equal(player.getSnapshot().status, "playing");
  assert.equal(audio.currentTime, 3.75);
  audio.end();
  assert.deepEqual(created.map((entry) => entry.id), ["story", "question"]);
  created[1].audio.end();
  assert.equal(await done, "ended");
});

test("a new answer or navigation cancels old callbacks and every queued clip", async () => {
  const { player, created } = setup();
  const old = player.play(["story", "old-question"]);
  const staleEnd = created[0].audio.onended;
  player.pause();
  const answer = player.play(["answer"]);
  assert.equal(await old, "stopped");
  staleEnd();
  await tick();
  assert.deepEqual(created.map((entry) => entry.id), ["story", "answer"]);
  assert.equal(player.getSnapshot().id, "answer");
  player.stop();
  assert.equal(await answer, "stopped");
  assert.equal(player.resume(), false);
});

test("a stale play rejection after a quick pause/resume cannot stop resumed audio", async () => {
  let rejectFirst;
  const audio = new FakeAudio();
  audio.playResult = () => audio.plays === 1 ? new Promise((_, reject) => { rejectFirst = reject; }) : Promise.resolve();
  const player = createVoicePlayer(() => audio);
  const done = player.play(["story"]);
  player.pause();
  player.resume();
  rejectFirst(Object.assign(new Error("paused during loading"), { name: "AbortError" }));
  await tick();
  assert.equal(player.getSnapshot().status, "playing");
  audio.end();
  assert.equal(await done, "ended");
});

test("media errors and autoplay blocks end the queue with a recoverable state", async () => {
  for (const [name, expected] of [["NotAllowedError", "blocked"], ["NotSupportedError", "error"]]) {
    let count = 0;
    const player = createVoicePlayer(() => {
      count += 1;
      const audio = new FakeAudio();
      audio.playResult = () => Promise.reject(Object.assign(new Error(name), { name }));
      return audio;
    });
    assert.equal(await player.play(["broken", "must-not-play"]), expected);
    assert.equal(player.getSnapshot().status, expected);
    assert.equal(count, 1);
  }
  const { player, created } = setup();
  const done = player.play(["one", "two"]);
  const oldError = created[0].audio.onerror;
  created[0].audio.end();
  oldError();
  await tick();
  assert.equal(player.getSnapshot().id, "two");
  created[1].audio.onerror();
  assert.equal(await done, "error");
});

test("a loading clip can remain paused until the user resumes it", async () => {
  let resolvePlay;
  const audio = new FakeAudio();
  audio.playResult = () => new Promise((resolve) => { resolvePlay = resolve; });
  const player = createVoicePlayer(() => audio);
  const done = player.play(["one"]);
  player.pause();
  resolvePlay();
  await tick();
  assert.equal(player.getSnapshot().status, "paused");
  player.stop();
  assert.equal(await done, "stopped");
});

const manifest = JSON.parse(readFileSync(new URL("../public/content/manifest.json", import.meta.url)));
const chapters = new Map(manifest.tracks.flatMap((track) => track.chapters.map((chapter) => [chapter.id, chapter])));
const first = chapters.values().next().value;

test("local progress restores valid steps and preserves legacy completion badges", () => {
  const completed = JSON.stringify([first.id, first.id, "removed-chapter", null]);
  assert.deepEqual(parseProgress(null, completed, chapters, "v2").completed, [first.id]);
  assert.deepEqual(parseProgress("broken", completed, chapters, "v2").completed, [first.id]);
  const current = { chapterId: first.id, stepId: "journey", contentVersion: "v2" };
  const raw = JSON.stringify({ schemaVersion: 2, completed: [first.id], current });
  assert.deepEqual(parseProgress(raw, null, chapters, "v2").current, current);
  const changed = parseProgress(raw, null, chapters, "v3");
  assert.equal(changed.current, null);
  assert.deepEqual(changed.completed, [first.id]);
  assert.equal(parseProgress(raw.replace('"journey"', '"missing-step"'), null, chapters, "v2").current, null);
  for (const raw of ["null", "[]", "3", '{"schemaVersion":2,"completed":{},"current":[]}', "broken"]) {
    assert.equal(parseProgress(raw, null, chapters, "v2").current, null);
  }
});

test("all 515 steps have two stable audible choices with one correct answer and balanced positions", () => {
  let count = 0;
  let firstCorrect = 0;
  for (const chapter of chapters.values()) for (const step of chapter.gameplay.steps) {
    const before = JSON.stringify(step.options);
    const seed = `${chapter.id}:${step.id}`;
    const options = listenOptions(step.options, seed);
    assert.equal(options.length, 2);
    assert.equal(options.filter((option) => option.correct).length, 1);
    assert.equal(new Set(options.map((option) => option.id)).size, 2);
    assert.ok(options.every((option) => option.audio.id && option.audio.text === option.label));
    assert.deepEqual(listenOptions(step.options, seed), options);
    assert.equal(JSON.stringify(step.options), before);
    firstCorrect += Number(options[0].correct);
    count += 1;
  }
  assert.equal(count, 515);
  assert.ok(firstCorrect > count * .4 && firstCorrect < count * .6, `${firstCorrect}/${count}`);
});

test("a focused UI keeps completed records for chapters currently hidden", () => {
  const index = JSON.parse(readFileSync(new URL('../content/runtime/progress-index.json', import.meta.url), 'utf8'));
  const chapters = new Map(index.map(c=>[c.id,c]));
  const scope=JSON.parse(readFileSync(new URL('../content/preview-scope.json',import.meta.url),'utf8'));
  const hidden=index.find(c=>!scope.chapterIds.includes(c.id)).id;
  const visible=scope.chapterIds[0];
  const progress=parseProgress(JSON.stringify({schemaVersion:2,completed:[hidden,visible],current:null}),null,chapters,'0.63.0');
  assert.deepEqual(progress.completed,[hidden,visible]);
});
