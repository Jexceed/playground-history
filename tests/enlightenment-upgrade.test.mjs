import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { waterSplitSnapshot, labSnapshot } from "../app/history-lab-model.ts";
import { stepVoiceIds } from "../app/step-flow.ts";

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const require = createRequire(import.meta.url);
const cache = new Map();

function loadComponent(path) {
  if (cache.has(path)) return cache.get(path);
  const componentModule = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const localRequire = (specifier) => {
    if (specifier.endsWith(".css")) return {};
    if (specifier === "next/image") {
      return { default: (props) => React.createElement("img", { src: props.src, alt: props.alt }) };
    }
    if (!specifier.startsWith(".")) return require(specifier);
    const base = resolve(dirname(path), specifier);
    const source = [".tsx", ".ts"].map((ext) => base + ext).find(fs.existsSync);
    return source ? loadComponent(source) : require(base);
  };
  new Function("require", "module", "exports", outputText)(localRequire, componentModule, componentModule.exports);
  cache.set(path, componentModule.exports);
  return componentModule.exports;
}

const { HistoryLabControls, HistoryLabDiagram } = loadComponent(
  fileURLToPath(new URL("../app/HistoryLab.tsx", import.meta.url)),
);
const { CircleStudy } = loadComponent(
  fileURLToPath(new URL("../app/CircleStudy.tsx", import.meta.url)),
);
const { TimeRiverRibbon } = loadComponent(
  fileURLToPath(new URL("../app/ObjectWorkbench.tsx", import.meta.url)),
);

test("Dujiangyan water-split lab progresses from fish-snout split to Feishayan spillway to Baopingkou irrigation", () => {
  const states = [0, 1, 2].map((stage) => waterSplitSnapshot(stage));
  assert.deepEqual(states.map((s) => s.feishayanSpill), [false, true, true]);
  assert.deepEqual(states.map((s) => s.baopingkouIrrigating), [false, false, true]);
  assert.deepEqual([0, 1, 2].map((stage) => labSnapshot("water-split", stage).complete), [false, false, true]);
  assert.throws(() => waterSplitSnapshot(3), RangeError);

  const stage0Svg = renderToStaticMarkup(React.createElement(HistoryLabDiagram, { kind: "water-split", stage: 0 }));
  const stage1Svg = renderToStaticMarkup(React.createElement(HistoryLabDiagram, { kind: "water-split", stage: 1 }));
  const stage2Svg = renderToStaticMarkup(React.createElement(HistoryLabDiagram, { kind: "water-split", stage: 2 }));
  assert.match(stage0Svg, /鱼嘴/);
  assert.doesNotMatch(stage0Svg, /data-spill-flow="true"/);
  assert.match(stage1Svg, /data-spill-flow="true"/);
  assert.match(stage2Svg, /农田喝饱水/);
});

test("completed HistoryLab and CircleStudy expose reversible stage-comparison pills", () => {
  const config = {
    kind: "water-split",
    stages: [
      { label: "涨水时看飞沙堰排洪", narration: "多余水漫过飞沙堰", audio: { id: "v1", text: "多余水漫过飞沙堰" } },
      { label: "引稳水进宝瓶口浇田", narration: "稳水进宝瓶口", audio: { id: "v2", text: "稳水进宝瓶口" } },
    ],
  };
  const unlockedHtml = renderToStaticMarkup(
    React.createElement(HistoryLabControls, {
      config,
      locked: false,
      controller: { stage: 0, engineAngle: 0, busy: false, advance: () => {}, selectStage: () => {} },
    }),
  );
  assert.doesNotMatch(unlockedHtml, /history-lab-compare/);

  const completedHtml = renderToStaticMarkup(
    React.createElement(HistoryLabControls, {
      config,
      locked: true,
      controller: { stage: 2, engineAngle: 360, busy: false, advance: () => {}, selectStage: () => {} },
    }),
  );
  assert.match(completedHtml, /history-lab-compare/);
  assert.match(completedHtml, /刚开始/);
  assert.match(completedHtml, /涨水时看飞沙堰排洪/);

  const solvedCircleHtml = renderToStaticMarkup(
    React.createElement(CircleStudy, { locked: true, onRefine: () => {} }),
  );
  assert.match(solvedCircleHtml, /circle-compare-pills/);
  assert.match(solvedCircleHtml, /6条边/);
  assert.match(solvedCircleHtml, /12条边/);
  assert.match(solvedCircleHtml, /24条边/);
});

test("TimeRiverRibbon keeps Chinese and World timelines independent while anchoring relative distance to Today", () => {
  const chinaHtml = renderToStaticMarkup(
    React.createElement(TimeRiverRibbon, {
      periodLabel: "远古时期",
      solved: true,
      options: [
        { id: "a", label: "远古时期", correct: true, audio: { id: "1", text: "远古时期" }, objectView: { kind: "era", name: "远古时期" } },
        { id: "b", label: "唐朝", correct: false, audio: { id: "2", text: "唐朝" }, objectView: { kind: "era", name: "唐朝" } },
      ],
    }),
  );
  assert.match(chinaHtml, /data-timeline-track="china"/);
  assert.match(chinaHtml, /远古/);
  assert.match(chinaHtml, /今天/);
  assert.doesNotMatch(chinaHtml, /四千多年前/);

  const worldChapters = read("content/preview-scope.json").chapterIds.filter(id => id.startsWith("world-"));
  assert.equal(worldChapters.length, 6);
  for (const id of worldChapters) {
    const chapter = read(`public/content/chapters/${id}.json`);
    const step = chapter.gameplay.steps[0];
    const heard = step.audio.lead.text;
    const range = step.interaction.worldTimeStop;
    assert.ok(range && heard.includes(range), `${id} must use the time the child actually hears`);
    for (const solved of [false, true]) {
      const html = renderToStaticMarkup(React.createElement(TimeRiverRibbon, {
        periodLabel: chapter.period.label, options: step.options, solved, worldTimeStop: range,
      }));
      assert.match(html, /data-timeline-track="world"/);
      assert.ok(html.includes(`data-stop-state="${solved ? "current" : "candidate"}"><i aria-hidden="true"></i><span>${range}</span>`), id);
      assert.match(html, /今天/);
      assert.doesNotMatch(html, /秦|唐|宋/);
    }
  }

  const css = fs.readFileSync("app/workbench.css", "utf8");
  const stopRule = css.match(/\.time-river-stop\s*\{[^}]*\}/)?.[0] ?? "";
  assert.match(stopRule, /flex:\s*0\s+0\s+auto/, "time-river-stop must size to natural label width so 夏商周 and 春秋战国 never overlap");
  assert.doesNotMatch(stopRule, /flex:\s*1\b/);
});

test("enlightenment upgrade awakens 3 Pre-Qin origin chapters, adds starter route, and replaces 4-panel poetry covers", () => {
  const scope = read("content/preview-scope.json");
  const routes = read("content/play-routes.json").routes;
  const focused = new Map(read("content/focused-quests.json").chapters.map((c) => [c.id, c]));
  const voices = new Map(read("public/audio/voice-lines.json").lines.map((l) => [l.id, l.text]));

  assert.equal(scope.chapterIds.length, 62);
  assert.equal(scope.periodIds.length, 15);
  for (const id of [
    "cn-ancient-01-02-first-farmers",
    "cn-ancient-02-02-oracle-bronze",
    "cn-ancient-03-01-iron-waterworks",
  ]) {
    assert.ok(scope.chapterIds.includes(id), id);
    const detail = read(`public/content/chapters/${id}.json`);
    assert.equal(detail.gameplay.steps.length, 5);
    assert.ok(detail.gameplay.photoAlbum.photos.length >= 2);
    for (const [i, step] of detail.gameplay.steps.entries()) {
      const heard = stepVoiceIds(step).map((vid) => voices.get(vid)).join(" ");
      assert.ok(heard.length > 8, `${id}/${i} entry voice must be non-empty`);
      for (const concept of step.concepts ?? []) {
        assert.ok(concept.audio?.id && voices.has(concept.audio.id), `${id}/${i} concept audio missing`);
      }
    }
  }

  const starter = routes.find((r) => r.id === "starter");
  assert.ok(starter);
  assert.equal(starter.title, "历史启蒙第一站");
  assert.ok(starter.chapterIds.includes("cn-ancient-01-02-first-farmers"));
  assert.ok(starter.chapterIds.includes("cn-ancient-02-02-oracle-bronze"));
  assert.ok(starter.chapterIds.includes("cn-ancient-03-01-iron-waterworks"));

  // All 9 poetry chapters use dedicated single-scene main illustrations instead of 4-panel sheets on cover/reunion
  for (const id of [
    "cn-ancient-06-12-meng-haoran-chunxiao",
    "cn-ancient-06-13-wang-zhihuan-tower",
    "cn-ancient-07-10-wang-anshi-yuanri",
    "cn-ancient-07-11-su-shi-xilin",
    "cn-ancient-07-12-yang-wanli-xiaochi",
    "cn-ancient-07-13-fan-chengda-tianyuan",
    "cn-ancient-08-10-tang-yin-rooster",
    "cn-ancient-08-11-wen-zhengming-garden",
    "cn-ancient-08-12-yu-qian-lime",
  ]) {
    const ch = focused.get(id);
    assert.match(ch.presentation.sceneAssetId, /-main-scene-v1$/, id);
    assert.match(ch.presentation.story.reunionAssetId, /-main-scene-v1$/, id);
    assert.match(ch.steps[1].visualAssetId, /-main-scene-v1$/, `${id} reading step should show single-scene illustration`);
  }

  // Sima Qian uses modern museum educator scene and removes costumed-docent confusion
  const sima = focused.get("cn-ancient-04-07-sima-qian-shiji");
  assert.equal(sima.presentation.sceneAssetId, "sima-qian-study-v2");
  assert.doesNotMatch(sima.boundary, /古装讲解员/);

  // Song Gunpowder teaches historical military/signal & festive fireworks uses safely
  const gunpowder = focused.get("cn-ancient-07-08-song-gunpowder-records");
  assert.equal(gunpowder.presentation.sceneAssetId, "song-gunpowder-uses-v1");
  assert.equal(gunpowder.presentation.story.reunionAssetId, "song-tech-reunion-v1");
  assert.equal(gunpowder.steps[2].interaction.kind, "scene-find");
  assert.deepEqual(
    gunpowder.steps[2].interaction.hotspots.map((h) => h.id),
    ["military-signal", "festival-fireworks"],
  );
});
