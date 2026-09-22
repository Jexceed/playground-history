import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";
import {buildFocusedGameplay} from "./lib/focused-gameplay.mjs";
import { synthesisTextFor } from "./lib/voice-synthesis.mjs";

const root = process.cwd();
const focusedQuests = JSON.parse(fs.readFileSync(path.join(root,"content/focused-quests.json"),"utf8"));
const focusedById = new Map(focusedQuests.chapters.map(c=>[c.id,c]));
const outputRoot = path.join(root, "public/content");
const chapterOutputRoot = path.join(outputRoot, "chapters");
const sourceDataRoot = path.join(root, "content/runtime");
const voiceOutputPath = path.join(root, "public/audio/voice-lines.json");

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

let voiceLineById;
let voiceLineByText;

function registerVoiceLine(text, preferredId = null) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) throw new Error("不能登记空语音：请补齐源稿中的引导或回应，再生成声音");
  const existingByText = voiceLineByText.get(normalized);
  if (existingByText) return existingByText;
  const id = preferredId ?? `quest-${createHash("sha1").update(normalized).digest("hex").slice(0, 16)}`;
  const existingById = voiceLineById.get(id);
  if (existingById && existingById.text !== normalized) throw new Error(`语音ID冲突：${id}`);
  const synthesisText = synthesisTextFor(normalized, voicePronunciations.entries);
  const line = { id, text: normalized, ...(synthesisText !== normalized ? { synthesisText } : {}) };
  voiceLineById.set(id, line);
  voiceLineByText.set(normalized, line);
  return line;
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

function compactChildLabel(value, maxCharacters = 48) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  if ([...normalized].length <= maxCharacters) return normalized;
  const units = normalized.match(/[^。！？；]+[。！？；]?/gu) ?? [normalized];
  let compact = "";
  for (const unit of units) {
    if ([...`${compact}${unit}`].length > maxCharacters) break;
    compact += unit;
  }
  if ([...compact].length >= 12) return compact.trim();
  const clauses = normalized.match(/[^，、：。！？；]+[，、：。！？；]?/gu) ?? [normalized];
  compact = "";
  for (const clause of clauses) {
    if ([...`${compact}${clause}`].length > maxCharacters) break;
    compact += clause;
  }
  if ([...compact].length >= 12) return compact.trim();
  return `${[...normalized].slice(0, maxCharacters - 1).join("")}…`;
}

function asSpokenSentence(value) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (/[。！？]$/u.test(normalized)) return normalized;
  return `${normalized.replace(/[，、：；…]+$/u, "")}。`;
}

function buildImageNarration(stepAsset, story) {
  const subject = asSpokenSentence(stepAsset.imageAlt);
  const clue = asSpokenSentence(story.screenText);
  const narration = `点开大图啦。这是${subject}这张图能帮我们找到：${clue}`;
  if (hanLength(narration) <= 90) return narration;
  return `点开大图啦。这是${subject}请找一找图里看得见的线索。`;
}

function markdownBlocks(value) {
  return value
    .trim()
    .split(/\n\s*\n/)
    .map(stripInlineMarkdown)
    .filter(Boolean);
}

function buildChildStory(entry, storyPath) {
  const hook = buildMemoryHook(entry);
  return [
    { id: "hook", icon: hook.icon, label: `从${hook.kind}出发`, text: hook.label },
    ...storyPath.beats.map((beat, index) => ({
      id: ["beginning", "journey", "change"][index],
      icon: ["🔎", "🧭", "✨"][index],
      label: beat.title,
      text: beat.text,
    })),
    { id: "answer-retell", icon: "🗣️", label: "把故事讲给家人听", text: entry.takeaway },
  ];
}

function validateTextbookConnection(connection, sourceById) {
  if (!connection.featured?.type || !connection.featured.icon || !connection.featured.title || !connection.featured.childBridge || !connection.featured.evidenceBoundary) {
    throw new Error(`${connection.id} 的课本熟悉线索不完整`);
  }
  if ([...connection.featured.title].length > 28) throw new Error(`${connection.id} 的课本熟悉线索标题超过28字`);
  if ([...connection.featured.childBridge].length > 52) throw new Error(`${connection.id} 的课本熟悉线索桥接语超过52字`);
  if ([...connection.featured.evidenceBoundary].length > 66) throw new Error(`${connection.id} 的课本熟悉线索边界超过66字`);
  if (!Array.isArray(connection.companions) || connection.companions.length < 2 || connection.companions.length > 4) {
    throw new Error(`${connection.id} 的课本延伸线索应为2—4条`);
  }
  for (const companion of connection.companions) {
    if (!companion.type || !companion.label || !companion.note) throw new Error(`${connection.id} 有不完整的课本延伸线索`);
    if ([...companion.label].length > 22 || [...companion.note].length > 46) throw new Error(`${connection.id} 的课本延伸线索过长`);
  }
  if (!Array.isArray(connection.sourceIds) || connection.sourceIds.length < 2) throw new Error(`${connection.id} 缺少课本连接来源`);
  for (const sourceId of connection.sourceIds) if (!sourceById.has(sourceId)) throw new Error(`${connection.id} 的课本连接来源未登记：${sourceId}`);
}

const editorOnlyBoundaryPattern = /(?:仅供|只供).*编辑|不直接进入低龄|只用于家长层|只用于家长与编辑/u;

function isChildImageAsset(asset) {
  return asset
    && asset.childVisibility !== "editor-only"
    && asset.clearance?.startsWith("cleared-")
    && asset.localPath
    && !editorOnlyBoundaryPattern.test(`${asset.notes ?? ""} ${asset.boundary ?? ""}`)
    && /\.(?:jpe?g|png|tif|svg)$/i.test(asset.localPath);
}

function assetText(asset) {
  return `${asset.title ?? ""} ${asset.caption ?? ""}`;
}

const genericSemanticBigrams = new Set([
  "照片", "图像", "遗址", "博物", "现代", "历史", "中国", "世界", "一个", "一种", "人们", "可以", "帮助", "说明", "故事", "线索", "今天", "当时", "时期", "国家", "地方", "人物", "画面", "展出", "拍摄", "制作", "保存", "不同", "发生", "变化",
]);

function semanticBigrams(value) {
  const result = new Set();
  for (const sequence of String(value ?? "").match(/\p{Script=Han}{2,}/gu) ?? []) {
    const characters = [...sequence];
    for (let index = 0; index < characters.length - 1; index += 1) {
      const bigram = `${characters[index]}${characters[index + 1]}`;
      if (!genericSemanticBigrams.has(bigram)) result.add(bigram);
    }
  }
  return result;
}

function storyAssetMatch(asset, story) {
  const visualText = assetText(asset);
  const storyText = `${story.title} ${story.screenText} ${story.narration}`;
  const visualBigrams = semanticBigrams(visualText);
  const storyBigrams = semanticBigrams(storyText);
  const titleBigrams = semanticBigrams(story.title);
  let score = 0;
  for (const bigram of storyBigrams) if (visualBigrams.has(bigram)) score += 3;
  for (const bigram of titleBigrams) if (visualBigrams.has(bigram)) score += 6;
  for (const token of entryTokens(story.title)) {
    if (visualText.includes(token)) score += Math.min(18, [...token].length * 4);
  }
  const evidenceSignals = [
    [/照片|合影/u, /照片|合影/u],
    [/会址|石库门/u, /会址|石库门/u],
    [/法令|宣言/u, /法令|宣言/u],
    [/改革|制度/u, /改革|宪法|法令|宣言|使节|工厂/u],
    [/会议/u, /会议|会址/u],
    [/地图|路线/u, /地图|路线/u],
    [/书信|家书|信件/u, /书信|家书|信件/u],
    [/诗|诗句/u, /诗|诗句/u],
    [/壁画/u, /壁画/u],
    [/机器|蒸汽机|火车|汽车|高铁/u, /机器|蒸汽机|火车|汽车|高铁/u],
  ];
  for (const [storyPattern, visualPattern] of evidenceSignals) {
    if (storyPattern.test(storyText) && visualPattern.test(visualText)) score += 24;
  }
  if (!/战争|海战|战场/u.test(storyText) && /战争|海战|战场|战时宣传/u.test(visualText)) score -= 30;
  return score;
}

function buildMemoryHook(entry) {
  const title = entry.childTitle;
  const rules = [
    { pattern: /《静夜思》|《春望》|《水调歌头》|孔子说|《论语》|四句古诗|一首宋词/, kind: "一句诗文", icon: "📜" },
    { pattern: /九色鹿|《清明上河图》|长卷|壁画|画一只熊|海报|会议合影/, kind: "一幅图画", icon: "🖼️" },
    { pattern: /一封家书|一本航海日志|一张大请愿书|一纸约法|三份人权文件|一份奏章|上书|一张解放宣言/, kind: "一页文字", icon: "📄" },
    { pattern: /电话里的声音|卫星为什么会唱/, kind: "一个声音", icon: "🎧" },
    { pattern: /地图|路线|走到遵义|走过哪些地方|迁徙|大运河还是驿路/, kind: "一张地图", icon: "🗺️" },
    { pattern: /孔子|张骞|林则徐|康有为|孙中山|鲁迅|毛泽东|郑和|玄奘|鉴真|杜甫|王羲之|祖冲之|忽必烈|李时珍|宋应星|颜真卿|李白|苏轼|徐霞客|达·芬奇|瓦特|玻利瓦尔|牛顿|达尔文|贝多芬|列宁|甘地|周恩来|曼德拉/, kind: "一个人", icon: "👋" },
    { pattern: /蒸汽机|火车|汽车|新干线|网页服务器|高铁/, kind: "一台机器", icon: "⚙️" },
    { pattern: /洞穴|村庄|都江堰|长安|江南|洛阳城|大都|虎门|圆明园|船政学堂|石库门|井冈山|卢沟桥|天安门|金字塔旁|阿庇亚大道|修道院|巴格达|奈良|故宫/, kind: "一个地方", icon: "📍" },
  ];
  const matched = rules.find((rule) => rule.pattern.test(title));
  return {
    kind: matched?.kind ?? "一件东西",
    icon: matched?.icon ?? "🔎",
    label: title,
    question: entry.prompt,
  };
}

function entryTokens(value) {
  return String(value ?? "")
    .split(/[、，；与和及（）()·\s]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
}

function scoreAsset(asset, role, childEntry, story) {
  const text = assetText(asset);
  const rolePatterns = {
    time: /地图|时间|年表|年代|遗址|现状|全景|航拍/,
    beginning: /文物|器|碑|印|书|画|照片|遗存|工具|模型|专利/,
    journey: /遗址|地图|桥|河|城|宫|塔|寺|道路|车站|港|田|现场|建筑/,
    change: /人物|肖像|合影|工人|居民|师生|家庭|队伍|生活|活动|工作/,
    takeaway: /诗|词|书法|画|歌|文稿|手稿|文字|器|遗址/,
  };
  let score = rolePatterns[role]?.test(text) ? 4 : 0;
  const roleValue = role === "journey"
    ? childEntry.place
    : role === "change"
      ? childEntry.people.join("、")
      : role === "takeaway"
        ? childEntry.culture ?? childEntry.object
        : childEntry.object;
  for (const token of entryTokens(roleValue)) if (text.includes(token)) score += 3;
  const chapterAnchor = `${childEntry.object} ${childEntry.people.join("、")} ${childEntry.place} ${childEntry.culture ?? ""}`;
  for (const token of entryTokens(chapterAnchor)) if (text.includes(token)) score += 8;
  score += storyAssetMatch(asset, story) * 2;
  if (asset.id === childEntry.preferredAssetId) score += role === "time" ? 12 : role === "beginning" ? 8 : 6;
  return score;
}

function assignStepAssets(assets, childEntry, stories, overrides = {}) {
  const visible = assets.filter(isChildImageAsset);
  if (visible.length === 0) throw new Error(`${childEntry.id} 没有可用于儿童步骤的清权图片`);
  const roles = ["time", "beginning", "journey", "change", "takeaway"];
  const usedCount = new Map();
  const selected = roles.map((role, stepIndex) => {
    const story = stories[stepIndex];
    const unused = visible.filter((asset) => !usedCount.has(asset.id));
    const bestSemanticScore = Math.max(...visible.map((asset) => storyAssetMatch(asset, story)));
    const suitableUnused = unused.filter((asset) => {
      const semanticScore = storyAssetMatch(asset, story);
      return bestSemanticScore > 0 && bestSemanticScore - semanticScore <= 3;
    });
    const candidates = suitableUnused.length > 0 ? suitableUnused : visible;
    const ranked = [...candidates].sort((a, b) => {
      const aScore = scoreAsset(a, role, childEntry, story) - (usedCount.get(a.id) ?? 0);
      const bScore = scoreAsset(b, role, childEntry, story) - (usedCount.get(b.id) ?? 0);
      return bScore - aScore || a.id.localeCompare(b.id);
    });
    const asset = ranked[0];
    usedCount.set(asset.id, (usedCount.get(asset.id) ?? 0) + 1);
    return { role, story, asset };
  });
  return selected.map(({ asset: automaticallySelectedAsset, role }) => {
    const overrideAssetId = overrides[role];
    const asset = overrideAssetId
      ? visible.find((candidate) => candidate.id === overrideAssetId)
      : automaticallySelectedAsset;
    if (overrideAssetId && !asset) {
      throw new Error(`${childEntry.id}/${role} 的配图覆盖不是本章儿童可见清权素材：${overrideAssetId}`);
    }
    return {
      assetId: asset.id,
      image: `/content/step-images/${asset.id}.${/\.svg$/i.test(asset.localPath) ? "svg" : "jpg"}`,
      imageAlt: asset.title,
      imageCaption: asset.caption,
      imageBoundary: asset.boundary,
    };
  });
}

const distressingChoicePattern = /头骨|骷髅|遗体|尸体|伤口|处决|屠杀|死亡|法西斯|军备|侵略|投降|内战|奴隶|奴役|强迫劳动|骨骼|枪|武器|战争/;

function makeGameOptions(correctLabel, candidateLabels, seed, stepId) {
  const normalizedCorrectLabel = correctLabel.replace(/\s+/g, " ").trim();
  const candidates = [...new Set(candidateLabels
    .filter(Boolean)
    .map((label) => compactChildLabel(label.replace(/\s+/g, " ").trim()))
    .filter((label) => label !== normalizedCorrectLabel && !distressingChoicePattern.test(label)))];
  if (candidates.length < 2) throw new Error(`${stepId} 没有足够的干扰选项`);
  const distractors = [];
  let cursor = (seed * 17 + 11) % candidates.length;
  while (distractors.length < 2) {
    const label = candidates[cursor % candidates.length];
    if (!distractors.includes(label)) distractors.push(label);
    cursor += 1;
  }
  const labels = [normalizedCorrectLabel, ...distractors];
  const rotation = seed % labels.length;
  const ordered = [...labels.slice(rotation), ...labels.slice(0, rotation)];
  return ordered.map((label, index) => ({
    id: `${stepId}-${index + 1}`,
    label,
    correct: label === normalizedCorrectLabel,
  }));
}

function compactPlainLabel(value, maxCharacters = 48) {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  if ([...normalized].length <= maxCharacters) return normalized;
  return [...normalized]
    .slice(0, maxCharacters)
    .join("")
    .replace(/[，、：；。！？]+$/u, "")
    .trim();
}

function stripBeatConnector(value) {
  return String(value ?? "")
    .replace(/^(?:先|接着|最后)[，：、\s]*/u, "")
    .trim();
}

function buildSemanticOption(value, suffix, maxCharacters = 48) {
  const normalizedSuffix = String(suffix ?? "").trim();
  const suffixLength = [...normalizedSuffix].length;
  const body = compactPlainLabel(value, Math.max(8, maxCharacters - suffixLength))
    .replace(/[，、：；。！？]+$/u, "");
  return `${body}${normalizedSuffix}`;
}

function buildBalancedSemanticOption(values, suffix, targetCharacters) {
  const normalizedSuffix = String(suffix ?? "").trim();
  const bodyBudget = Math.max(2, Math.min(48, targetCharacters) - [...normalizedSuffix].length);
  const bodySource = [...new Set(values
    .flatMap((value) => String(value ?? "").split("、"))
    .map((value) => value.replace(/\s+/g, " ").trim())
    .filter(Boolean))]
    .join("、");
  const body = compactPlainLabel(bodySource, bodyBudget).replace(/[，、：；。！？]+$/u, "");
  return `${body}${normalizedSuffix}`;
}

function safeSemanticGrounding(value, fallback) {
  return distressingChoicePattern.test(String(value ?? "")) ? fallback : value;
}

function buildGameplay({ chapter, childEntry, textbookConnection, storyPath, screens, interactions, period, trackInfo, globalIndex, contexts, assets, stepImageOverrides }) {
  const hook = buildMemoryHook(childEntry);
  const currentTime = trackInfo.id === "cross-disciplinary"
    ? `跨越很多时代 · ${period.label}`
    : `${trackInfo.label} · ${period.label} · ${period.years ?? period.range ?? ""}`;
  const timeStoryText = trackInfo.id === "cross-disciplinary"
    ? `这个故事会跨越很多时代，来比较${period.label}。`
    : `这是${period.label}，时间是${period.years ?? period.range ?? ""}。`;
  const stories = [
    {
      screenNumber: 1,
      title: "先把故事放进时间河",
      screenText: timeStoryText,
      narration: timeStoryText,
    },
    ...storyPath.beats.map((beat, index) => ({
      screenNumber: index + 2,
      title: beat.title,
      screenText: beat.text,
      narration: beat.text,
    })),
    {
      screenNumber: screens.at(-1)?.number ?? screens.length,
      title: "把三条线索连成答案",
      screenText: childEntry.takeaway,
      narration: childEntry.takeaway,
    },
  ];
  const storyLabels = stories.map((story) => compactChildLabel(story.screenText));
  const stepAssets = assignStepAssets(assets, childEntry, stories, stepImageOverrides);
  const placeLabel = compactChildLabel(childEntry.place, 26);
  const objectLabel = compactChildLabel(childEntry.object, 24);
  const peopleLabel = compactPlainLabel(childEntry.people.join("、"), 24);
  const placeGrounding = safeSemanticGrounding(childEntry.place, hook.label);
  const peopleGrounding = safeSemanticGrounding(peopleLabel, hook.label);
  const cultureGrounding = safeSemanticGrounding(childEntry.culture, hook.label);
  const evidenceAnswer = buildSemanticOption(childEntry.object, "，是能核对的证物");
  const safeGroundingParts = [
    childEntry.object,
    childEntry.place,
    peopleLabel,
    childEntry.culture,
    hook.label,
  ].filter((value) => value && !distressingChoicePattern.test(value));
  const evidenceLength = [...evidenceAnswer].length;
  const journeyLength = [...storyLabels[2]].length;
  const changeLength = [...storyLabels[3]].length;
  const takeawayLength = [...childEntry.takeaway].length;
  const beginningCandidates = [
    buildBalancedSemanticOption([placeGrounding, peopleGrounding, cultureGrounding, hook.label], "，只是故事地点", evidenceLength - 1),
    buildBalancedSemanticOption([peopleGrounding, placeGrounding, cultureGrounding, hook.label], "，只是故事人物", evidenceLength + 1),
  ];
  const journeyCandidates = [
    buildBalancedSemanticOption([placeGrounding, childEntry.object, ...safeGroundingParts], "，只说了地点", journeyLength - 1),
    buildBalancedSemanticOption([peopleGrounding, childEntry.object, ...[...safeGroundingParts].reverse()], "，只认出人物", journeyLength + 1),
  ];
  const changeCandidates = [
    buildBalancedSemanticOption([childEntry.object, childEntry.place, ...safeGroundingParts], "，还只是故事起点", changeLength - 1),
    buildBalancedSemanticOption([stripBeatConnector(storyLabels[2]), ...[...safeGroundingParts].reverse()], "，还只是行动经过", changeLength + 1),
  ];
  const takeawayCandidates = [
    buildBalancedSemanticOption([stripBeatConnector(storyLabels[1]), ...safeGroundingParts], "，只说了原因", takeawayLength - 1),
    buildBalancedSemanticOption([stripBeatConnector(storyLabels[3]), ...[...safeGroundingParts].reverse()], "，只说了结果", takeawayLength + 1),
  ];
  const definitions = [
    {
      id: "time",
      questionKind: "time-location",
      icon: "🕰️",
      phase: "先找到时间",
      prompt: `从${hook.kind}出发，先找哪个年代？`,
      correctLabel: currentTime,
      candidates: contexts.map((item) => item.timeLabel),
      rightNote: "时间找对了，故事有了起点。",
      wrongNote: "先看看时间线，再找一找这章所在的年代。",
      leadIn: `先给${hook.kind}找到正确年代。`,
    },
    {
      id: "beginning",
      questionKind: "evidence-object",
      icon: "🔎",
      phase: "第一拍 · 故事起点",
      prompt: "哪一件证物能先打开这个故事？",
      correctLabel: evidenceAnswer,
      candidates: beginningCandidates,
      rightNote: storyLabels[1],
      wrongNote: "这张卡说到了人物、地点或文化，再找一件能看、能摸或能核对的证物。",
      leadIn: "时间找到了。先找一件看得见、能核对的证物。",
    },
    {
      id: "journey",
      questionKind: "people-place-action",
      icon: "🧭",
      phase: "第二拍 · 故事继续",
      prompt: "故事里的人来到这里以后，做了什么？",
      correctLabel: storyLabels[2],
      candidates: journeyCandidates,
      rightNote: storyLabels[2],
      wrongNote: "这张卡只说到了人物、地点或证物，再找那一步真正发生的行动。",
      leadIn: "证物找到了。现在跟着人物来到故事地点，看他们做了什么。",
    },
    {
      id: "change",
      questionKind: "cause-effect",
      icon: "✨",
      phase: "第三拍 · 看见变化",
      prompt: "前面的行动带来了什么变化？",
      correctLabel: storyLabels[3],
      candidates: changeCandidates,
      rightNote: storyLabels[3],
      wrongNote: "这张卡还停在证物、地点或行动，再找由前面行动带来的变化。",
      leadIn: "行动发生了。再看看它带来了什么变化。",
    },
    {
      id: "takeaway",
      questionKind: "reason-result",
      icon: "🗣️",
      phase: "把线索连成答案",
      prompt: "哪句话同时说清了原因和结果？",
      correctLabel: childEntry.takeaway,
      candidates: takeawayCandidates,
      rightNote: childEntry.takeaway,
      wrongNote: "这句话只说了原因或结果的一边，再找把两边连起来的完整回答。",
      leadIn: "把证物、行动和变化连起来，说清为什么和后来怎样。",
    },
  ];
  const steps = definitions.map((definition, stepIndex) => {
    const sourceStory = stories[stepIndex];
    const story = { ...sourceStory, displayText: compactChildLabel(sourceStory.screenText) };
    const stepAsset = stepAssets[stepIndex];
    const correctLabel = compactChildLabel(definition.correctLabel);
    const rightNote = definition.rightNote;
    const wrongNote = definition.wrongNote;
    const options = makeGameOptions(correctLabel, definition.candidates, globalIndex * 5 + stepIndex, `${chapter.id}-${definition.id}`)
      .map((option) => ({ ...option, audio: registerVoiceLine(option.label) }));
    return {
      id: definition.id,
      questionKind: definition.questionKind,
      icon: definition.icon,
      phase: definition.phase,
      title: story.title,
      prompt: definition.prompt,
      rightNote,
      wrongNote,
      story,
      ...stepAsset,
      audio: {
        transition: registerVoiceLine(definition.leadIn),
        intro: registerVoiceLine(story.narration),
        image: registerVoiceLine(buildImageNarration(stepAsset, story)),
        question: registerVoiceLine(definition.prompt),
        right: registerVoiceLine(
          [
            "答对啦！时间找对了，故事有了起点。",
            "答对啦！第一件证物找到了。",
            "答对啦！人物、地点和行动连起来了。",
            "答对啦！你找到了前因带来的变化。",
            "答对啦！原因和结果都说清楚了。",
          ][stepIndex],
        ),
        wrong: registerVoiceLine(`还差一点。${wrongNote}`),
      },
      options,
    };
  });
  return {
    mode: "memory-hook-story-quest-v3",
    status: "playable-core",
    audioStatus: "local-pre-generated",
    hook,
    coverAudio: registerVoiceLine(`今天从${hook.kind}出发：${hook.label}。我们要去${placeLabel}，看看${objectLabel}怎样把答案一点点带出来。准备好就点开始。`),
    textbookAudio: textbookConnection
      ? registerVoiceLine(`课本里的老朋友是${textbookConnection.featured.title}。${textbookConnection.featured.childBridge}`)
      : null,
    finishAudio: registerVoiceLine(`五条线索都找到了，“${hook.label}”的答案是：${childEntry.takeaway} 你获得了历史证据小侦探勋章。`),
    estimatedMinutes: chapter.targets.durationMinutes,
    badge: { icon: "🏅", label: "历史证据小侦探" },
    steps,
    extensionTasks: interactions,
  };
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
const childEntryPoints = readJson("content/child-entry-points.json");
const childEntryByChapter = new Map(childEntryPoints.chapters.map((entry) => [entry.id, entry]));
const questStoryPaths = readJson("content/quest-story-paths.json");
const storyPathByChapter = new Map(questStoryPaths.chapters.map((entry) => [entry.id, entry]));
const stepImageOverrideRegistry = readJson("content/step-image-overrides.json");
const stepImageOverridesByChapter = new Map(stepImageOverrideRegistry.chapters.map((entry) => [entry.id, entry.steps]));
if (stepImageOverridesByChapter.size !== stepImageOverrideRegistry.chapters.length) throw new Error("步骤配图覆盖存在重复章节ID");
if (storyPathByChapter.size !== questStoryPaths.chapters.length) throw new Error("专属故事拍点存在重复章节ID");
if (storyPathByChapter.size !== childEntryByChapter.size) throw new Error(`专属故事拍点覆盖不完整：${storyPathByChapter.size}/${childEntryByChapter.size}`);
for (const entry of childEntryPoints.chapters) {
  const storyPath = storyPathByChapter.get(entry.id);
  if (!storyPath) throw new Error(`${entry.id} 缺少专属故事拍点`);
  if (storyPath.beats?.length !== 3) throw new Error(`${entry.id} 必须有3个专属故事拍点`);
  const prefixes = ["先", "接着", "最后"];
  for (const [index, beat] of storyPath.beats.entries()) {
    if (!beat.title || !beat.text) throw new Error(`${entry.id} 第${index + 1}拍缺少标题或文字`);
    if (![...beat.title].length || [...beat.title].length > 16) throw new Error(`${entry.id} 第${index + 1}拍标题超过16字`);
    if (![...beat.text].length || [...beat.text].length > (focusedById.has(entry.id) ? 64 : 48)) throw new Error(`${entry.id} 第${index + 1}拍文字超过64字`);
    if (!beat.text.startsWith(prefixes[index])) throw new Error(`${entry.id} 第${index + 1}拍必须以“${prefixes[index]}”开始`);
  }
}
const childLanguageGlossary = readJson("content/child-language-glossary.json");
const voicePronunciations = readJson("content/voice-pronunciations.json");
const voiceInterface = readJson("content/voice-interface-lines.json");
voiceLineById = new Map();
voiceLineByText = new Map();
for (const line of voiceInterface.lines) registerVoiceLine(line.text, line.id);
const sourceRegistry = readJson("content/sources.json");
const sourceById = new Map(sourceRegistry.sources.map((source) => [source.id, source]));
const textbookConnections = readJson("content/textbook-connections.json");
const textbookConnectionByChapter = new Map(textbookConnections.chapters.map((entry) => [entry.id, entry]));
if (textbookConnectionByChapter.size !== textbookConnections.chapters.length) throw new Error("课本熟悉线索存在重复章节ID");
for (const connection of textbookConnections.chapters) validateTextbookConnection(connection, sourceById);
const expectedTextbookConnectionIds = childEntryPoints.chapters
  .filter((entry) => /^cn-ancient-(?:04|05|06|07|08)-/.test(entry.id))
  .map((entry) => entry.id);
if (expectedTextbookConnectionIds.length !== textbookConnectionByChapter.size) {
  throw new Error(`秦至清课本熟悉线索覆盖不完整：${textbookConnectionByChapter.size}/${expectedTextbookConnectionIds.length}`);
}
for (const id of expectedTextbookConnectionIds) if (!textbookConnectionByChapter.has(id)) throw new Error(`${id} 缺少课本熟悉线索`);
const assetRegistries = fs.readdirSync(path.join(root, "content/assets"))
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => readJson(`content/assets/${name}`));
const assetById = new Map(assetRegistries.flatMap((registry) => registry.assets.map((asset) => [asset.id, asset])));

const gameplayContexts = catalogs.flatMap((catalog, catalogIndex) => {
  const trackInfo = productMap.tracks.find((track) => track.id === catalog.trackId);
  const periodById = new Map(catalog.periods.map((period) => [period.id, period]));
  return catalog.chapters.map((chapter) => {
    const period = periodById.get(chapter.periodId);
    return {
      id: chapter.id,
      globalIndex: catalogs.slice(0, catalogIndex).reduce((sum, item) => sum + item.chapters.length, 0) + chapter.order - 1,
      entry: childEntryByChapter.get(chapter.id),
      timeLabel: `${trackInfo.label} · ${period.label} · ${period.years ?? period.range ?? ""}`,
    };
  });
});
const gameplayContextById = new Map(gameplayContexts.map((item) => [item.id, item]));

const assetsByChapter = new Map();
function addAsset(chapterId, asset, usage, boundary) {
  const current = assetsByChapter.get(chapterId) ?? [];
  if (!current.some((item) => item.id === asset.id)) {
    current.push({
      id: asset.id,
      title: asset.title ?? asset.objectName,
      localPath: asset.localPath ?? null,
      sourcePage: asset.sourcePage ?? asset.imageSourcePage ?? null,
      sourceFile: asset.sourceFile ?? null,
      licensePath: asset.licensePath ?? null,
      license: asset.license ?? null,
      clearance: asset.clearance,
      caption: (asset.caption ?? usage)?.trim() || asset.title || asset.objectName || "章节登记图片",
      boundary: (asset.boundary ?? asset.notes ?? boundary)?.trim() || "只用于观察图片中可见的物件、地点或艺术表现；不能由单张图推出人物动机、完整过程或所有人的生活。",
      childVisibility: asset.childVisibility ?? "child-ok",
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
  const periodOrderById = new Map(catalog.periods.map((period, index) => [period.id, index]));
  const displayChapters = [...catalog.chapters].sort((left, right) => (
    (periodOrderById.get(left.periodId) ?? Number.MAX_SAFE_INTEGER) - (periodOrderById.get(right.periodId) ?? Number.MAX_SAFE_INTEGER)
    || left.order - right.order
  ));
  const manifestChapters = [];

  for (const chapter of displayChapters) {
    const markdown = fs.readFileSync(path.join(root, chapter.detailPath), "utf8");
    const metadata = parseMetadata(markdown);
    const conclusion = markdownBlocks(getSection(markdown, (heading) => heading === "本章结论"));
    const facts = parseFacts(markdown);
    const screens = parseScreens(markdown);
    const embeddedInteractions = screens.flatMap((screen) => screen.interactions);
    const interactions = embeddedInteractions.length ? embeddedInteractions : parseSeparateInteractions(markdown);
    const textbookConnection = textbookConnectionByChapter.get(chapter.id) ?? null;
    const focused = focusedById.get(chapter.id);
    const sourceIds = [...new Set([...collectCitationIds(markdown), ...(textbookConnection?.sourceIds ?? []), ...(focused?.steps.flatMap(s=>s.sourceIds) ?? [])])];
    const sources = sourceIds.map((id) => sourceById.get(id)).filter(Boolean);
    const assets = assetsByChapter.get(chapter.id) ?? [];
    const childEntry = childEntryByChapter.get(chapter.id);
    if (!childEntry) throw new Error(`${chapter.id} 缺少低龄兴趣入口`);
    const storyPath = storyPathByChapter.get(chapter.id);
    if (!storyPath) throw new Error(`${chapter.id} 缺少专属连续故事拍点`);
    const childStory = focused ? focused.steps.map((s,i)=>({id:["time","beginning","journey","change","takeaway"][i],icon:["🕰️","🔎","🧭","✨","🗣️"][i],label:s.title,text:s.story})) : buildChildStory(childEntry, storyPath);
    if (childStory.some((step) => [...step.text].length > 120)) throw new Error(`${chapter.id} 的亲子故事骨架单步超过120字`);
    const childEntryText = JSON.stringify(childEntry);
    const childLanguageText = `${childEntryText} ${screens.map((screen) => `${screen.title} ${screen.screenText} ${screen.voices.map((voice) => voice.text).join(" ")}`).join(" ")}`;
    const glossary = childLanguageGlossary.terms
      .filter((item) => childLanguageText.includes(item.term))
      .sort((a, b) => Number(!childEntryText.includes(a.term)) - Number(!childEntryText.includes(b.term)) || a.priority - b.priority || b.term.length - a.term.length || a.term.localeCompare(b.term, "zh-CN"));
    if (glossary.length === 0 && !focused) throw new Error(`${chapter.id} 没有匹配任何儿童口语词典解释`);
    const pronunciations = voicePronunciations.entries
      .filter((item) => item.chapterIds.includes(chapter.id))
      .sort((a, b) => a.kind.localeCompare(b.kind) || a.text.localeCompare(b.text, "zh-CN"));
    if (pronunciations.length === 0) throw new Error(`${chapter.id} 没有匹配任何配音读音校听项`);
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
    const gameplayContext = gameplayContextById.get(chapter.id);
    const gameplay = focused ? buildFocusedGameplay({focused, registerVoiceLine, assets, interactions, childEntry}) : buildGameplay({
      chapter,
      childEntry,
      textbookConnection,
      storyPath,
      screens: segmentedScreens,
      interactions,
      period,
      trackInfo,
      globalIndex: gameplayContext.globalIndex,
      contexts: gameplayContexts,
      assets,
      stepImageOverrides: stepImageOverridesByChapter.get(chapter.id) ?? {},
    });
    if (gameplay.steps.length !== 5) throw new Error(`${chapter.id} 核心关卡不是5步`);
    for (const gameStep of gameplay.steps) {
      const lookListen = gameStep.interaction?.kind === "look-listen";
      const sceneFind = gameStep.interaction?.kind === "scene-find" && gameStep.interaction.rounds?.length > 0;
      const historyLab = gameStep.interaction?.kind === "history-lab" && gameStep.interaction.lab?.stages?.length > 0;
      if ((lookListen || sceneFind || historyLab) && gameStep.options.length === 0) continue;
      if (gameStep.options.length !== (focused ? 2 : 3) || gameStep.options.filter((option) => option.correct).length !== 1) {
        throw new Error(`${chapter.id} 的 ${gameStep.id} 选项结构无效`);
      }
    }
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
      childEntry,
      textbookConnection,
      childStory,
      glossary,
      pronunciations,
      gameplay,
      age: metadata["适龄"] ?? metadata["建议年龄"] ?? metadata["适用年龄"] ?? "4—6岁亲子共学；儿童以图标和语音为主",
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
      childEntry,
      textbookConnection,
      childStory,
      glossary: glossary.slice(0, 6),
      glossaryCount: glossary.length,
      pronunciations: pronunciations.slice(0, 6),
      pronunciationCount: pronunciations.length,
      gameplay,
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
  generatedAt: focusedQuests.updatedAt,
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
    playableChapters: manifestTracks.reduce((sum, track) => sum + track.chapters.length, 0),
    coreQuestSteps: manifestTracks.reduce((sum, track) => sum + track.chapters.reduce((chapterSum, chapter) => chapterSum + chapter.gameplay.steps.length, 0), 0),
    localVoiceLines: voiceLineById.size,
    glossaryTerms: childLanguageGlossary.terms.length,
    pronunciationEntries: voicePronunciations.entries.length,
    yearReadingRules: voicePronunciations.yearReadingRules.length,
    sources: sourceRegistry.sources.length,
    textbookConnections: textbookConnectionByChapter.size,
    assets: assetById.size,
  },
  voiceReadingGuide: {
    status: voicePronunciations.status,
    notation: voicePronunciations.notation,
    instructions: voicePronunciations.instructions,
    yearReadingRules: voicePronunciations.yearReadingRules,
  },
  voicePlayback: {
    status: "local-pre-generated",
    voice: voiceInterface.voice,
    rate: voiceInterface.rate,
    pitch: voiceInterface.pitch,
    lineCount: voiceLineById.size,
  },
  tracks: manifestTracks,
};

const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
fs.writeFileSync(path.join(outputRoot, "manifest.json"), manifestText);
fs.writeFileSync(path.join(sourceDataRoot, "content-manifest.json"), manifestText);
fs.mkdirSync(path.dirname(voiceOutputPath), { recursive: true });
fs.writeFileSync(voiceOutputPath, `${JSON.stringify({
  voice: voiceInterface.voice,
  rate: voiceInterface.rate,
  pitch: voiceInterface.pitch,
  generatedFrom: ["content/voice-interface-lines.json", "content/voice-pronunciations.json", "content/focused-quests.json", "content/chapters/*.md", "content/child-entry-points.json", "content/quest-story-paths.json", "content/step-image-overrides.json", "content/textbook-connections.json"],
  lines: [...voiceLineById.values()],
}, null, 2)}\n`);
console.log(`内容包生成完成：${manifest.totals.tracks} 个板块，${manifest.totals.chapters} 章。`);

// The UI imports only the current 34-chapter scope. The complete library remains on disk.
const previewScope=readJson("content/preview-scope.json");
const visible=new Set(previewScope.chapterIds);
const previewTracks=manifestTracks.map(t=>({...t,range:"秦汉至明清",periods:t.periods.filter(p=>previewScope.periodIds.includes(p.id)),chapters:t.chapters.filter(c=>visible.has(c.id))})).filter(t=>t.chapters.length);
const previewChapters=previewTracks.flatMap(t=>t.chapters);
const previewDetails=previewChapters.map(c=>readJson(`public/content/chapters/${c.id}.json`));
const distinct=(key,idKey)=>new Set(previewDetails.flatMap(c=>c[key].map(x=>x[idKey]))).size;
const sum=key=>previewChapters.reduce((total,c)=>total+(c[key]??0),0);
const previewVoiceIds=new Set();
const collectVoices=obj=>{if(!obj||typeof obj!=="object")return;if(typeof obj.id==="string"&&typeof obj.text==="string"&&voiceLineById.has(obj.id))previewVoiceIds.add(obj.id);else Object.values(obj).forEach(collectVoices);};
previewChapters.forEach(c=>collectVoices(c.gameplay));
["river-intro","choice-help","choice-circle","choice-square","choice-first","resume-hint"].forEach(id=>previewVoiceIds.add(id));
const preview={...manifest,title:"秦汉至明清本机试玩",scope:previewScope,tracks:previewTracks,totals:{...manifest.totals,tracks:previewTracks.length,chapters:previewChapters.length,playableChapters:previewChapters.length,coreQuestSteps:previewChapters.length*5,facts:sum("factCount"),screens:sum("screens"),audioClips:sum("audioClips"),audioSegments:sum("audioSegments"),coreAudioSegments:sum("coreAudioSegments"),extensionAudioSegments:sum("extensionAudioSegments"),interactions:sum("interactions"),textbookConnections:34,sources:distinct("sources","id"),assets:distinct("assets","id"),glossaryTerms:distinct("glossary","term"),pronunciationEntries:distinct("pronunciations","text"),localVoiceLines:previewVoiceIds.size},voicePlayback:{...manifest.voicePlayback,lineCount:previewVoiceIds.size}};
const previewText=JSON.stringify(preview,null,2)+"\n";
fs.writeFileSync(path.join(sourceDataRoot,"preview-manifest.json"),previewText);
fs.writeFileSync(path.join(outputRoot,"preview-manifest.json"),previewText);
fs.writeFileSync(path.join(sourceDataRoot,"progress-index.json"),JSON.stringify(manifestTracks.flatMap(t=>t.chapters.map(c=>({id:c.id,gameplay:{steps:c.gameplay.steps.map(s=>({id:s.id}))}}))),null,2)+"\n");
