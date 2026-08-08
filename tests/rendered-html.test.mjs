import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the Chinese-history timeline and Tang chapter entry", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /中华文明/);
  assert.match(html, /隋唐五代/);
  assert.match(html, /开始隋唐第一章/);
  assert.match(html, /查看完整91章/);
  assert.doesNotMatch(html, /speechSynthesis|Sign in with ChatGPT|codex-preview/);
});

test("ships the complete platform-neutral 91-chapter content pack", async () => {
  const manifest = JSON.parse(await readFile(new URL("public/content/manifest.json", root), "utf8"));
  assert.equal(manifest.tracks.length, 7);
  assert.deepEqual(manifest.totals, {
    tracks: 7,
    chapters: 91,
    facts: 2604,
    screens: 585,
    audioClips: 653,
    audioSegments: 1092,
    coreAudioSegments: 653,
    extensionAudioSegments: 439,
    interactions: 303,
    sources: 951,
    assets: 422,
  });

  const chapters = manifest.tracks.flatMap((track) => track.chapters.map((chapter) => ({ ...chapter, trackId: track.id })));
  assert.equal(chapters.length, 91);
  assert.equal(new Set(chapters.map((chapter) => chapter.id)).size, 91);
  const audioSegmentIds = new Set();

  for (const chapter of chapters) {
    const detail = JSON.parse(await readFile(new URL(`public${chapter.detailUrl}`, root), "utf8"));
    assert.equal(detail.id, chapter.id);
    assert.equal(detail.trackId, chapter.trackId);
    assert.equal(detail.screens.length, chapter.screens);
    assert.equal(detail.screens.flatMap((screen) => screen.voices).length, chapter.audioClips);
    const audioSegments = detail.screens.flatMap((screen) => screen.voices.flatMap((voice) => voice.segments));
    assert.equal(audioSegments.length, chapter.audioSegments);
    assert.equal(audioSegments.filter((segment) => segment.tier === "core").length, chapter.coreAudioSegments);
    assert.equal(audioSegments.filter((segment) => segment.tier === "extension").length, chapter.extensionAudioSegments);
    for (const screen of detail.screens) {
      for (const voice of screen.voices) {
        assert.equal(voice.segments.map((segment) => segment.text).join("").replace(/\s/g, ""), voice.text.replace(/\s/g, ""));
        assert.equal(voice.segments[0].tier, "core");
        assert.ok(voice.segments.slice(1).every((segment) => segment.tier === "extension"));
        assert.ok(voice.segments.every((segment) => segment.hanCharacters <= 90), `${chapter.id} voice segments should stay short`);
        for (const segment of voice.segments) {
          assert.ok(!audioSegmentIds.has(segment.id), `${segment.id} should be unique`);
          audioSegmentIds.add(segment.id);
        }
      }
    }
    assert.equal(detail.interactions.length, chapter.interactions);
    assert.equal(detail.facts.length, chapter.factCount);
    assert.equal(detail.sources.length, chapter.sourceCount);
    assert.equal(detail.assets.length, chapter.assetCount);
    assert.ok(detail.screens[0]?.title, `${chapter.id} should begin with a child screen`);
    assert.ok(detail.sources.every((source) => /^https?:\/\//.test(source.url)), `${chapter.id} sources should have web URLs`);
    const thumbnail = await stat(new URL(`public${chapter.thumbnail}`, root));
    assert.ok(thumbnail.size > 1024, `${chapter.id} should contain a review thumbnail`);
  }
  assert.equal(audioSegmentIds.size, manifest.totals.audioSegments);
});

test("ships a complete local narration pack", async () => {
  const lines = JSON.parse(await readFile(new URL("public/audio/voice-lines.json", root), "utf8"));
  const manifest = JSON.parse(await readFile(new URL("public/audio/voice/manifest.json", root), "utf8"));
  assert.equal(manifest.provider, "edge-tts Python package");
  assert.equal(manifest.voice, lines.voice);
  assert.equal(manifest.rate, lines.rate);
  assert.equal(manifest.pitch, lines.pitch);
  assert.equal(manifest.entries.length, lines.lines.length);
  assert.deepEqual(new Set(manifest.entries.map((entry) => entry.id)), new Set(lines.lines.map((line) => line.id)));
  for (const entry of manifest.entries) {
    const info = await stat(new URL(`public${entry.src}`, root));
    assert.ok(info.size > 1024, `${entry.id} should contain audio`);
  }
  await access(new URL("app/speech.ts", root));
});

test("keeps existing narration files when synthesis fails", async () => {
  const audioUrl = new URL("public/audio/voice/zh-CN/xiaoxiao/river-intro.mp3", root);
  const before = await readFile(audioUrl);
  const result = spawnSync(process.execPath, ["scripts/generate-voices.mjs", "--python", "/usr/bin/false", "--force"], {
    cwd: fileURLToPath(root),
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.deepEqual(await readFile(audioUrl), before);
});

test("ships two local voice audition profiles before the full narration run", async () => {
  const manifest = JSON.parse(await readFile(new URL("public/audio/auditions/manifest.json", root), "utf8"));
  assert.equal(manifest.profiles.length, 2);
  assert.equal(manifest.profiles.flatMap((profile) => profile.samples).length, 6);
  assert.deepEqual(new Set(manifest.profiles.flatMap((profile) => profile.samples.map((sample) => sample.id))), new Set(["timeline", "artifact", "cause"]));
  for (const profile of manifest.profiles) {
    for (const sample of profile.samples) {
      const info = await stat(new URL(`public${sample.src}`, root));
      assert.ok(info.size > 1024, `${profile.id}/${sample.id} should contain audio`);
    }
  }
});
