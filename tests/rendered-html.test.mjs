import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
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
  assert.doesNotMatch(html, /speechSynthesis|Sign in with ChatGPT|codex-preview/);
});

test("ships a complete local narration pack", async () => {
  const lines = JSON.parse(await readFile(new URL("public/audio/voice-lines.json", root), "utf8"));
  const manifest = JSON.parse(await readFile(new URL("public/audio/voice/manifest.json", root), "utf8"));
  assert.equal(manifest.provider, "edge-tts Python package");
  assert.equal(manifest.voice, "zh-CN-XiaoxiaoNeural");
  assert.equal(manifest.entries.length, lines.lines.length);
  assert.deepEqual(new Set(manifest.entries.map((entry) => entry.id)), new Set(lines.lines.map((line) => line.id)));
  for (const entry of manifest.entries) {
    const info = await stat(new URL(`public${entry.src}`, root));
    assert.ok(info.size > 1024, `${entry.id} should contain audio`);
  }
  await access(new URL("app/speech.ts", root));
});
