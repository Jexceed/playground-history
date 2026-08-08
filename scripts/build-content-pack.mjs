import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const outputRoot = path.join(root, "public/content");
const chapterOutputRoot = path.join(outputRoot, "chapters");
const sourceDataRoot = path.join(root, "content/runtime");

const catalogPaths = [
  "content/catalog.json",
  "content/catalog-china-modern.json",
  "content/catalog-china-contemporary.json",
  "content/catalog-world-ancient.json",
  "content/catalog-world-modern.json",
  "content/catalog-world-contemporary.json",
  "content/catalog-cross-disciplinary.json",
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function stripInlineMarkdown(value) {
  return value
    .replace(/\[([^\]]+)]\([^\)]+\)/g, "$1")
    .replace(/\[([A-Z][A-Z0-9-]+(?:;\s*[A-Z][A-Z0-9-]+)*)]/g, "")
    .replace(/[*_`]/g, "")
    .replace(/^>\s?/gm, "")
    .replace(/\s+([，。；：！？])/g, "$1")
    .trim();
}

function markdownBlocks(value) {
  return value
    .trim()
    .split(/\n\s*\n/)
    .map(stripInlineMarkdown)
    .filter(Boolean);
}

function getSection(markdown, headingTest) {
  const headings = [...markdown.matchAll(/^## ([^\n]+)$/gm)];
  const headingIndex = headings.findIndex((match) => headingTest(match[1]));
  if (headingIndex < 0) return "";
  const current = headings[headingIndex];
  const next = headings[headingIndex + 1];
  return markdown.slice(current.index + current[0].length, next?.index ?? markdown.length).trim();
}

function parseMetadata(markdown) {
  const firstSection = markdown.split(/^## /m)[0];
  return Object.fromEntries(
    [...firstSection.matchAll(/^- ([^：\n]+)：\s*(.+)$/gm)]
      .map((match) => [match[1].trim(), stripInlineMarkdown(match[2])]),
  );
}

function parseFacts(markdown) {
  const section = getSection(markdown, (heading) => /^(?:\d+条)?事实卡$/.test(heading));
  return section.split("\n").flatMap((line) => {
    const match = line.match(/^(\d+)\.\s+(.+)$/);
    if (!match) return [];
    const sourceIds = [...match[2].matchAll(/\[([A-Z][A-Z0-9-]+(?:;\s*[A-Z][A-Z0-9-]+)*)]/g)]
      .flatMap((citation) => citation[1].split(/;\s*/));
    return [{ number: Number(match[1]), text: stripInlineMarkdown(match[2]), sourceIds }];
  });
}

function firstParagraphAfter(body, startIndex) {
  const tail = body.slice(startIndex).trimStart();
  const paragraph = tail.split(/\n\s*\n/)[0] ?? "";
  return stripInlineMarkdown(paragraph.replace(/^“|”$/g, ""));
}

function parseVoices(body) {
  const marker = /^(?:\*\*语音(\d+)[^*]*\*\*|### 语音(\d+)：[^\n]*|语音 `[A-Z](\d+)`：[^\n]*)/gm;
  const voices = [...body.matchAll(marker)].map((match) => ({
      number: Number(match[1] ?? match[2] ?? match[3]),
      label: stripInlineMarkdown(match[0]),
      text: firstParagraphAfter(body, match.index + match[0].length),
    }));
  return [...new Map(voices.map((voice) => [voice.number, voice])).values()];
}

function parseInteractions(body) {
  const marker = /^(?:\*\*互动(\d+)[｜：]?([^*]*)\*\*|### 互动(\d+)：([^\n]*))/gm;
  const matches = [...body.matchAll(marker)];
  return matches.map((match, index) => {
    const end = matches[index + 1]?.index ?? body.length;
    const block = body.slice(match.index + match[0].length, end);
    return {
      number: Number(match[1] ?? match[3]),
      title: stripInlineMarkdown(match[2] ?? match[4] ?? ""),
      items: block.split("\n").filter((line) => /^-\s+/.test(line)).map((line) => stripInlineMarkdown(line.replace(/^-\s+/, ""))),
    };
  });
}

function parseSeparateInteractions(markdown) {
  const section = getSection(markdown, (heading) => /^(?:互动设计|互动|互动题[^\n]*)$/.test(heading));
  if (!section) return [];
  const headings = [...section.matchAll(/^### 互动(\d+)：([^\n]*)$/gm)];
  if (headings.length) {
    return headings.map((match, index) => {
      const end = headings[index + 1]?.index ?? section.length;
      const block = section.slice(match.index + match[0].length, end);
      return {
        number: Number(match[1]),
        title: stripInlineMarkdown(match[2]),
        items: block.split("\n").filter((line) => /^-\s+/.test(line)).map((line) => stripInlineMarkdown(line.replace(/^-\s+/, ""))),
      };
    });
  }
  return section.split("\n").flatMap((line) => {
    const match = line.match(/^(\d+)\.\s+(?:\*\*)?([^*：]+)(?:\*\*)?[：:]?\s*(.*)$/);
    if (!match) return [];
    return [{ number: Number(match[1]), title: stripInlineMarkdown(match[2]), items: match[3] ? [stripInlineMarkdown(match[3])] : [] }];
  });
}

function parseScreenText(body) {
  const bold = body.match(/\*\*屏幕文字\*\*\s*\n\n([\s\S]*?)(?=\n\n\*\*|\n\n### |$)/);
  if (bold) return stripInlineMarkdown(bold[1]).replace(/\s{2,}\n/g, "\n");
  const plain = body.match(/^屏幕文字：\s*\n\n([\s\S]*?)(?=\n\n(?:语音|画面|互动|### )|$)/m);
  return plain ? stripInlineMarkdown(plain[1]) : "";
}

function parseScreens(markdown) {
  const section = getSection(markdown, (heading) => /(?:儿童[^\n]*(?:语音|故事)|\d+屏儿童)/.test(heading));
  const headings = [...section.matchAll(/^### ((?:第(\d+)屏|(\d+)\.)[^\n]*)$/gm)];
  return headings.map((match, index) => {
    const end = headings[index + 1]?.index ?? section.length;
    const body = section.slice(match.index + match[0].length, end).trim();
    return {
      number: Number(match[2] ?? match[3]),
      title: stripInlineMarkdown(match[1].replace(/^(?:第\d+屏|\d+\.)[：:]?\s*/, "")),
      screenText: parseScreenText(body),
      voices: parseVoices(body),
      interactions: parseInteractions(body),
    };
  });
}

function hanLength(value) {
  return (value.match(/[\p{Script=Han}]/gu) ?? []).length;
}

function splitLongClause(value, maxHan) {
  const parts = [];
  let current = "";
  let currentHan = 0;
  for (const character of value) {
    const characterHan = /\p{Script=Han}/u.test(character) ? 1 : 0;
    if (current && currentHan + characterHan > maxHan) {
      parts.push(current.trim());
      current = "";
      currentHan = 0;
    }
    current += character;
    currentHan += characterHan;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function splitVoiceText(value, maxHan = 90) {
  const sentences = value.match(/[^。！？；]+[。！？；]?/gu) ?? [value];
  const units = sentences.flatMap((sentence) => {
    if (hanLength(sentence) <= maxHan) return sentence.trim();
    const clauses = sentence.match(/[^，、：]+[，、：]?/gu) ?? [sentence];
    return clauses.flatMap((clause) => hanLength(clause) <= maxHan ? clause.trim() : splitLongClause(clause, maxHan));
  }).filter(Boolean);

  const segments = [];
  let current = "";
  for (const unit of units) {
    if (current && hanLength(current + unit) > maxHan) {
      segments.push(current.trim());
      current = "";
    }
    current += unit;
  }
  if (current.trim()) segments.push(current.trim());
  return segments;
}

function collectCitationIds(markdown) {
  return [...new Set(
    [...markdown.matchAll(/\[([A-Z][A-Z0-9-]+(?:;\s*[A-Z][A-Z0-9-]+)*)]/g)]
      .flatMap((match) => match[1].split(/;\s*/)),
  )];
}

const catalogs = catalogPaths.map(readJson);
const productMap = readJson("content/product-map.json");
const sourceRegistry = readJson("content/sources.json");
const sourceById = new Map(sourceRegistry.sources.map((source) => [source.id, source]));
const assetRegistries = fs.readdirSync(path.join(root, "content/assets"))
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => readJson(`content/assets/${name}`));
const assetById = new Map(assetRegistries.flatMap((registry) => registry.assets.map((asset) => [asset.id, asset])));

const assetsByChapter = new Map();
function addAsset(chapterId, asset, usage, boundary) {
  const current = assetsByChapter.get(chapterId) ?? [];
  if (!current.some((item) => item.id === asset.id)) {
    current.push({
      id: asset.id,
      title: asset.title ?? asset.objectName,
      localPath: asset.localPath ?? null,
      sourcePage: asset.sourcePage ?? asset.imageSourcePage ?? null,
      license: asset.license ?? null,
      clearance: asset.clearance,
      caption: asset.caption ?? usage ?? "",
      boundary: asset.notes ?? boundary ?? "",
    });
  }
  assetsByChapter.set(chapterId, current);
}

for (const registry of assetRegistries) {
  for (const asset of registry.assets) {
    for (const chapterId of asset.chapterIds ?? registry.chapterIds ?? []) addAsset(chapterId, asset);
  }
  for (const reused of registry.reusedAssets ?? []) {
    const asset = assetById.get(reused.assetId);
    if (!asset) continue;
    for (const chapterId of reused.chapterIds ?? registry.chapterIds ?? []) addAsset(chapterId, asset, reused.usage, reused.boundary);
  }
}

fs.mkdirSync(chapterOutputRoot, { recursive: true });
fs.mkdirSync(sourceDataRoot, { recursive: true });

const manifestTracks = [];
let totalFacts = 0;
let totalScreens = 0;
let totalAudio = 0;
let totalAudioSegments = 0;
let totalCoreAudioSegments = 0;
let totalExtensionAudioSegments = 0;
let totalInteractions = 0;

for (const [catalogIndex, catalog] of catalogs.entries()) {
  const trackInfo = productMap.tracks.find((track) => track.id === catalog.trackId);
  const periodById = new Map(catalog.periods.map((period) => [period.id, period]));
  const manifestChapters = [];

  for (const chapter of catalog.chapters) {
    const markdown = fs.readFileSync(path.join(root, chapter.detailPath), "utf8");
    const metadata = parseMetadata(markdown);
    const conclusion = markdownBlocks(getSection(markdown, (heading) => heading === "本章结论"));
    const facts = parseFacts(markdown);
    const screens = parseScreens(markdown);
    const embeddedInteractions = screens.flatMap((screen) => screen.interactions);
    const interactions = embeddedInteractions.length ? embeddedInteractions : parseSeparateInteractions(markdown);
    const sourceIds = collectCitationIds(markdown);
    const sources = sourceIds.map((id) => sourceById.get(id)).filter(Boolean);
    const assets = assetsByChapter.get(chapter.id) ?? [];
    const period = periodById.get(chapter.periodId);
    const thumbnail = `/content/thumbnails/${chapter.id}.jpg`;

    const parsedAudioCount = screens.flatMap((screen) => screen.voices).length;
    const segmentedScreens = screens.map((screen) => ({
      ...screen,
      voices: screen.voices.map((voice) => ({
        ...voice,
        segments: splitVoiceText(voice.text).map((text, index) => ({
          id: `${chapter.id}-s${String(screen.number).padStart(2, "0")}-v${String(voice.number).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
          order: index + 1,
          tier: index === 0 ? "core" : "extension",
          text,
          hanCharacters: hanLength(text),
        })),
      })),
    }));
    const parsedAudioSegmentCount = segmentedScreens.flatMap((screen) => screen.voices.flatMap((voice) => voice.segments)).length;
    const parsedCoreAudioSegmentCount = segmentedScreens.flatMap((screen) => screen.voices.flatMap((voice) => voice.segments)).filter((segment) => segment.tier === "core").length;
    const parsedExtensionAudioSegmentCount = parsedAudioSegmentCount - parsedCoreAudioSegmentCount;
    if (facts.length < 5) throw new Error(`${chapter.id} 内容包事实卡不足`);
    if (screens.length !== chapter.targets.screens) throw new Error(`${chapter.id} 内容包屏幕数不一致`);
    if (parsedAudioCount !== chapter.targets.audioClips) throw new Error(`${chapter.id} 内容包语音数不一致`);
    if (interactions.length !== chapter.targets.interactions) throw new Error(`${chapter.id} 内容包互动数不一致`);

    const chapterPack = {
      schemaVersion: 1,
      contentVersion: catalog.contentVersion,
      id: chapter.id,
      trackId: catalog.trackId,
      trackLabel: trackInfo.label,
      period: { id: period.id, label: period.label, years: period.years ?? period.range ?? "" },
      order: chapter.order,
      title: chapter.title,
      coreQuestion: chapter.coreQuestion,
      throughline: chapter.throughline,
      age: metadata["适龄"] ?? metadata["建议年龄"] ?? metadata["适用年龄"] ?? "6—9岁亲子共学",
      durationMinutes: chapter.targets.durationMinutes,
      conclusion,
      facts,
      screens: segmentedScreens,
      interactions,
      sources,
      assets,
      thumbnail,
      status: chapter.status,
    };

    fs.writeFileSync(path.join(chapterOutputRoot, `${chapter.id}.json`), `${JSON.stringify(chapterPack, null, 2)}\n`);

    totalFacts += facts.length;
    totalScreens += screens.length;
    totalAudio += parsedAudioCount;
    totalAudioSegments += parsedAudioSegmentCount;
    totalCoreAudioSegments += parsedCoreAudioSegmentCount;
    totalExtensionAudioSegments += parsedExtensionAudioSegmentCount;
    totalInteractions += interactions.length;
    manifestChapters.push({
      id: chapter.id,
      order: chapter.order,
      periodId: chapter.periodId,
      periodLabel: period.label,
      periodYears: period.years ?? period.range ?? "",
      title: chapter.title,
      coreQuestion: chapter.coreQuestion,
      throughline: chapter.throughline,
      durationMinutes: chapter.targets.durationMinutes,
      screens: chapter.targets.screens,
      audioClips: chapter.targets.audioClips,
      audioSegments: parsedAudioSegmentCount,
      coreAudioSegments: parsedCoreAudioSegmentCount,
      extensionAudioSegments: parsedExtensionAudioSegmentCount,
      interactions: chapter.targets.interactions,
      factCount: facts.length,
      sourceCount: sources.length,
      assetCount: assets.length,
      thumbnail,
      detailUrl: `/content/chapters/${chapter.id}.json`,
      reviewStatus: chapter.status.review,
    });
  }

  manifestTracks.push({
    id: catalog.trackId,
    order: catalogIndex + 1,
    label: trackInfo.label,
    range: trackInfo.range,
    editorialNote: catalog.editorialNote,
    periods: catalog.periods,
    chapters: manifestChapters,
  });
}

const manifest = {
  schemaVersion: 1,
  contentVersion: productMap.contentVersion,
  generatedAt: "2026-08-08",
  title: "小小历史旅行团完整内容地图",
  audience: productMap.audience,
  totals: {
    tracks: manifestTracks.length,
    chapters: manifestTracks.reduce((sum, track) => sum + track.chapters.length, 0),
    facts: totalFacts,
    screens: totalScreens,
    audioClips: totalAudio,
    audioSegments: totalAudioSegments,
    coreAudioSegments: totalCoreAudioSegments,
    extensionAudioSegments: totalExtensionAudioSegments,
    interactions: totalInteractions,
    sources: sourceRegistry.sources.length,
    assets: assetById.size,
  },
  tracks: manifestTracks,
};

const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
fs.writeFileSync(path.join(outputRoot, "manifest.json"), manifestText);
fs.writeFileSync(path.join(sourceDataRoot, "content-manifest.json"), manifestText);
console.log(`内容包生成完成：${manifest.totals.tracks} 个板块，${manifest.totals.chapters} 章。`);
