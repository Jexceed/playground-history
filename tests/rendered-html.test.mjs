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

test("renders only the Qin–Qing local playtest scope", async () => {
 const response=await render(); assert.equal(response.status,200); const html=await response.text();
 assert.match(html,/小小历史旅行团/); assert.match(html,/秦汉至明清时间河十站/);assert.match(html,/家长入口/);
 assert.match(html,/history-tour-river-v4/);assert.match(html,/river-hero/);assert.doesNotMatch(html,/focus-welcome/);
 for(const label of ["秦朝","汉朝","唐朝","宋朝与辽·西夏·金","明朝","清朝"])assert.ok(html.includes(label));
 for(const label of ["世界古代史","远古时期","人民解放战争","跨时代小发现","打开五步故事","speechSynthesis"])assert.ok(!html.includes(label),label);
 const imageSources=[...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(match=>match[1]);
 assert.ok(imageSources.length>=10);
 assert.ok(imageSources.every(src=>src.startsWith("/images/")||src.startsWith("/content/")), "local preview images must not require a remote image optimizer");
 assert.equal((html.match(/data-period-id=/g)??[]).length,10);
});

test("keeps the complete source library and emits a separate focused UI bundle",async()=>{
 const read=async p=>JSON.parse(await readFile(new URL(p,root),"utf8"));
 const full=await read("public/content/manifest.json"),preview=await read("public/content/preview-manifest.json"),scope=await read("content/preview-scope.json");
 assert.equal(full.tracks.length,7);assert.equal(full.totals.chapters,103);assert.equal(full.totals.coreQuestSteps,515);
 assert.equal(preview.totals.chapters,34);assert.equal(preview.totals.coreQuestSteps,170);
 assert.deepEqual(new Set(preview.tracks.flatMap(t=>t.chapters.map(c=>c.id))),new Set(scope.chapterIds));
 assert.equal((await read("content/runtime/progress-index.json")).length,103);
 const voiceLines=new Map((await read("public/audio/voice-lines.json")).lines.map(l=>[l.id,l.text]));
 let segmentCount=0;
 for(const c of full.tracks.flatMap(t=>t.chapters)){
  const detail=await read(`public/content/chapters/${c.id}.json`);assert.deepEqual(detail.gameplay,c.gameplay);
  assert.equal(detail.gameplay.steps.length,5);assert.equal(detail.gameplay.steps.filter(s=>s.options.filter(o=>o.correct).length===1).length,5);
  for(const screen of detail.screens)for(const v of screen.voices){
   assert.equal(v.segments.map(s=>s.text).join("").replace(/\s/g,""),v.text.replace(/\s/g,""));
   assert.ok(v.segments.every(s=>s.hanCharacters<=90));segmentCount+=v.segments.length;
  }
  for(const step of detail.gameplay.steps){
   for(const audio of Object.values(step.audio))assert.equal(voiceLines.get(audio.id),audio.text);
   await access(new URL(`public${step.image}`,root));
  }
 }
 assert.equal(segmentCount,full.totals.audioSegments);
});

test("every focused question has two authored pictures, source references and a concrete ending",async()=>{
 const source=JSON.parse(await readFile(new URL("content/focused-quests.json",root),"utf8"));
 const preview=JSON.parse(await readFile(new URL("public/content/preview-manifest.json",root),"utf8"));
 const byId=new Map(preview.tracks.flatMap(t=>t.chapters.map(c=>[c.id,c])));
 for(const authored of source.chapters){
  const game=byId.get(authored.id).gameplay;assert.equal(game.mode,"authored-picture-quest-v4");assert.ok(game.cta.length>2);
  assert.equal(game.finish.actions.length,2);assert.ok(game.finish.parent);assert.equal(game.finish.actionAudio.length,2);
  for(const [i,step] of game.steps.entries()){
   assert.equal(step.prompt,authored.steps[i].question);assert.equal(step.story.narration,authored.steps[i].story);
   assert.equal(step.options.length,2);assert.notEqual(step.options[0].image,step.options[1].image);assert.ok(step.sourceIds.length);
   for(const o of step.options){await access(new URL(`public${o.image}`,root));assert.ok(o.label&&o.imageAlt);}
  }
 }
});

test("ships a complete local narration pack", async () => {
  const lines = JSON.parse(await readFile(new URL("public/audio/voice-lines.json", root), "utf8"));
  const manifest = JSON.parse(await readFile(new URL("public/audio/voice/manifest.json", root), "utf8"));
  assert.equal(manifest.provider, "edge-tts Python package");
  assert.equal(manifest.voice, lines.voice);
  assert.equal(manifest.rate, lines.rate);
  assert.equal(manifest.pitch, lines.pitch);
  assert.equal(manifest.count, lines.lines.length);
  assert.equal(manifest.entries.length, lines.lines.length);
  assert.equal(new Set(lines.lines.map((line) => line.id)).size, lines.lines.length);
  for (const removedId of ["chapter-open", "chapter-image-camel", "road-image", "meeting-image", "making-image", "chapter-finish"]) {
    assert.ok(!lines.lines.some((line) => line.id === removedId), `${removedId} should not survive after the second Tang quest was removed`);
  }
  assert.ok(lines.lines.every((line) => (line.text.match(/[\u3400-\u9fff]/g) ?? []).length <= 90), "every playable voice line should stay within the child-audio length limit");
  assert.ok(lines.lines.every((line) => !/[，、：；]。|[，、：；]$|…/u.test(line.text)), "every playable voice line should avoid truncated punctuation");
  assert.equal(new Set(manifest.entries.map((entry) => entry.id)).size, manifest.entries.length);
  assert.equal(manifest.failures.length, 0);
  assert.deepEqual(new Set(manifest.entries.map((entry) => entry.id)), new Set(lines.lines.map((line) => line.id)));
  for (const entry of manifest.entries) {
    const info = await stat(new URL(`public${entry.src}`, root));
    assert.ok(info.size > 1024, `${entry.id} should contain audio`);
    const bytes = await readFile(new URL(`public${entry.src}`, root));
    const hasMpegFrame = bytes.subarray(0, Math.min(bytes.length - 1, 4096)).some((byte, index) => byte === 0xff && (bytes[index + 1] & 0xe0) === 0xe0);
    assert.ok(hasMpegFrame, `${entry.id} should contain a decodable MPEG audio frame`);
    assert.equal(entry.text, lines.lines.find((line) => line.id === entry.id)?.text, `${entry.id} manifest text should match its source`);
  }
  await access(new URL("app/speech.ts", root));
});

test("keeps every active task step in one viewport with a narrated image overlay", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const css = await readFile(new URL("app/globals.css", root), "utf8");
  assert.match(page, /taskStepActive/);
  assert.match(page, /data-image-voice-id/);
  assert.match(page, /activeQuestStep\.audio\.image/);
  assert.match(page, /activeQuestStep\.story\.displayText/);
  assert.match(page, /\/images\/quest-steps\/time\.webp/);
  assert.match(page, /\/images\/quest-steps\/takeaway\.webp/);
  assert.match(page, /quest-step-badge-fallback/);
  assert.match(page, /onError=\{\(\) => setImageFailed\(true\)\}/);
  assert.match(page, /role="dialog"/);
  assert.match(css, /\.task-step-active \{[^}]*height: 100svh;[^}]*overflow: hidden;/s);
  assert.match(css, /height: calc\(100svh - 64px\)/);
  assert.match(css, /grid-template-rows: minmax\(120px, 22svh\) minmax\(0, 1fr\)/);
  assert.match(css, /\.image-lightbox-backdrop \{[^}]*position: fixed;/s);
});

test("packages every navigation and step badge used by the child pages", async () => {
  const publicImages = new URL("public/images/", root);
  const builtImages = new URL("dist/client/images/", root);
  const required = [
    "history-tour-river-v4.webp",
    "history-clue-fire-v2.webp",
    "history-clue-camel-v2.webp",
    "history-clue-moon-v2.webp",
    "history-clue-ship-v2.webp",
    ...["time", "beginning", "journey", "change", "takeaway"].map((name) => `quest-steps/${name}.webp`),
    ...["early", "states", "meeting", "united", "han", "cities", "sui", "tang", "five-dynasties", "yuan", "later", "qing", "lateqing", "republic", "modernlife", "newroad", "resistance", "liberation", "founding", "exploration", "reform", "newera", "change", "world-ancient", "world-modern", "world-contemporary", "cross-disciplinary"].map((name) => `history-stations/${name}.webp`),
  ];
  for (const relativePath of required) {
    const publicFile = new URL(relativePath, publicImages);
    const builtFile = new URL(relativePath, builtImages);
    assert.ok((await stat(publicFile)).size > 1024, `${relativePath} should exist in public images`);
    assert.ok((await stat(builtFile)).size > 1024, `${relativePath} should be copied into the production build`);
  }
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
