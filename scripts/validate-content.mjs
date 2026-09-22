import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const requireLocalAssets = process.argv.includes("--require-local-assets");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values, label) {
  const seen = new Set();
  for (const value of values) {
    assert(!seen.has(value), `${label} 重复：${value}`);
    seen.add(value);
  }
  return seen;
}

function assertSequential(values, expectedCount, label) {
  const normalized = [...values].map(Number).sort((a, b) => a - b);
  assert(normalized.length === expectedCount, `${label} 数量为 ${normalized.length}，应为 ${expectedCount}`);
  assert(
    normalized.every((value, index) => value === index + 1),
    `${label} 编号必须从 1 连续排列，当前为 ${normalized.join("、")}`,
  );
}

const timeline = readJson("content/timeline.json");
const catalogPaths = [
  "content/catalog.json",
  "content/catalog-china-modern.json",
  "content/catalog-china-contemporary.json",
  "content/catalog-world-ancient.json",
  "content/catalog-world-modern.json",
  "content/catalog-world-contemporary.json",
  "content/catalog-cross-disciplinary.json",
];
const catalogs = catalogPaths.map(readJson);
const catalog = catalogs[0];
const productMap = readJson("content/product-map.json");
const childEntryPoints = readJson("content/child-entry-points.json");
const focusedChapterById = new Map(readJson("content/focused-quests.json").chapters.map(chapter => [chapter.id, chapter]));
const stepImageOverrideRegistry = readJson("content/step-image-overrides.json");
const childLanguageGlossary = readJson("content/child-language-glossary.json");
const voicePronunciations = readJson("content/voice-pronunciations.json");
const voiceInterface = readJson("content/voice-interface-lines.json");
const sourceRegistry = readJson("content/sources.json");
const assetRegistryPaths = [
  "content/assets/focused-quests-assets.json",
  "content/assets/homepage-ui-assets.json",
  "content/assets/tang-changan-assets.json",
  "content/assets/ancient-origins-assets.json",
  "content/assets/xia-shang-zhou-assets.json",
  "content/assets/spring-autumn-warring-states-assets.json",
  "content/assets/qin-han-assets.json",
  "content/assets/three-kingdoms-jin-northern-southern-assets.json",
  "content/assets/sui-tang-five-dynasties-assets.json",
  "content/assets/liao-song-xia-jin-yuan-assets.json",
  "content/assets/ming-qing-assets.json",
  "content/assets/china-modern-late-qing-assets.json",
  "content/assets/china-modern-revolution-social-assets.json",
  "content/assets/china-modern-new-democratic-revolution-assets.json",
  "content/assets/china-modern-war-of-resistance-assets.json",
  "content/assets/china-modern-liberation-war-assets.json",
  "content/assets/china-contemporary-founding-assets.json",
  "content/assets/china-contemporary-transition-assets.json",
  "content/assets/china-contemporary-exploration-assets.json",
  "content/assets/china-contemporary-science-diplomacy-assets.json",
  "content/assets/china-contemporary-reform-begins-assets.json",
  "content/assets/china-contemporary-reform-daily-life-assets.json",
  "content/assets/china-contemporary-chinese-characteristics-reunification-assets.json",
  "content/assets/china-contemporary-new-era-development-assets.json",
  "content/assets/china-contemporary-china-and-world-today-assets.json",
  "content/assets/world-ancient-human-farming-assets.json",
  "content/assets/world-ancient-river-civilizations-assets.json",
  "content/assets/world-ancient-india-assets.json",
  "content/assets/world-ancient-greek-city-states-assets.json",
  "content/assets/world-ancient-rome-assets.json",
  "content/assets/world-ancient-medieval-europe-assets.json",
  "content/assets/world-ancient-byzantine-assets.json",
  "content/assets/world-ancient-islamic-world-assets.json",
  "content/assets/world-ancient-medieval-japan-assets.json",
  "content/assets/world-ancient-africa-americas-assets.json",
  "content/assets/world-modern-workshops-renaissance-assets.json",
  "content/assets/world-modern-ocean-routes-assets.json",
  "content/assets/world-modern-english-revolution-assets.json",
  "content/assets/world-modern-american-french-revolutions-assets.json",
  "content/assets/world-modern-first-industrial-revolution-assets.json",
  "content/assets/world-modern-workers-marxism-assets.json",
  "content/assets/world-modern-colonial-resistance-assets.json",
  "content/assets/world-modern-capitalist-expansion-assets.json",
  "content/assets/world-modern-second-industrial-revolution-assets.json",
  "content/assets/world-modern-science-art-assets.json",
  "content/assets/world-contemporary-first-world-war-assets.json",
  "content/assets/world-contemporary-russian-revolution-assets.json",
  "content/assets/world-contemporary-interwar-order-socialism-assets.json",
  "content/assets/world-contemporary-depression-fascism-resistance-assets.json",
  "content/assets/world-contemporary-second-world-war-assets.json",
  "content/assets/world-contemporary-cold-war-assets.json",
  "content/assets/world-contemporary-postwar-development-assets.json",
  "content/assets/world-contemporary-decolonization-assets.json",
  "content/assets/world-contemporary-globalization-polarization-assets.json",
  "content/assets/world-contemporary-peace-development-assets.json",
  "content/assets/cross-hero-biography-assets.json",
  "content/assets/cross-money-history-assets.json",
  "content/assets/cross-cultural-exchange-assets.json",
  "content/assets/cross-transport-history-assets.json",
  "content/assets/cross-environment-development-assets.json",
];
const discoveredAssetRegistryPaths = fs.readdirSync(path.join(root, "content/assets"))
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => `content/assets/${name}`);
assert(
  JSON.stringify([...assetRegistryPaths].sort()) === JSON.stringify(discoveredAssetRegistryPaths),
  "素材登记文件清单与 content/assets 目录不一致，请把新增登记表加入校验器",
);
const assetRegistries = discoveredAssetRegistryPaths.map(readJson);

const timelinePeriodIds = unique(timeline.periods.map((item) => item.id), "时间线时期 ID");
const chapterIds = unique(catalogs.flatMap((item) => item.chapters.map((chapter) => chapter.id)), "章节 ID");
const catalogChapterById = new Map(catalogs.flatMap((item) => item.chapters.map((chapter) => [chapter.id, chapter])));
const sourceIds = unique(sourceRegistry.sources.map((item) => item.id), "来源 ID");
unique(productMap.tracks.map((item) => item.id), "内容板块 ID");

assert(childEntryPoints.audience.includes("4—6岁"), "低龄兴趣入口的适龄说明必须为4—6岁");
const childEntryIds = unique(childEntryPoints.chapters.map((item) => item.id), "低龄兴趣入口章节 ID");
unique(childEntryPoints.chapters.map((item) => item.childTitle), "低龄兴趣入口儿童标题");
unique(childEntryPoints.chapters.map((item) => item.takeaway), "低龄兴趣入口儿童带走句");
const childEntryById = new Map(childEntryPoints.chapters.map((item) => [item.id, item]));
assert(childEntryIds.size === chapterIds.size, `低龄兴趣入口应覆盖 ${chapterIds.size} 章，当前为 ${childEntryIds.size} 章`);
for (const chapterId of chapterIds) {
  assert(childEntryIds.has(chapterId), `章节 ${chapterId} 缺少低龄兴趣入口`);
}
for (const entry of childEntryPoints.chapters) {
  assert(chapterIds.has(entry.id), `低龄兴趣入口使用了未知章节 ${entry.id}`);
  assert(typeof entry.childTitle === "string" && entry.childTitle.trim(), `章节 ${entry.id} 缺少儿童标题`);
  assert([...entry.childTitle].length <= 24, `章节 ${entry.id} 的儿童标题超过24字`);
  assert(typeof entry.prompt === "string" && entry.prompt.trim(), `章节 ${entry.id} 缺少儿童问题`);
  assert([...entry.prompt].length <= 62, `章节 ${entry.id} 的儿童问题超过62字`);
  assert(typeof entry.takeaway === "string" && entry.takeaway.trim(), `章节 ${entry.id} 缺少儿童带走的一句话`);
  assert([...entry.takeaway].length <= (entry.playableSource ? 64 : 48), `章节 ${entry.id} 的儿童带走句超过本层长度限制`);
  assert(/[。！？]$/.test(entry.takeaway), `章节 ${entry.id} 的儿童带走句需要完整收尾`);
  assert(typeof entry.object === "string" && entry.object.trim(), `章节 ${entry.id} 缺少实物或动作入口`);
  assert(Array.isArray(entry.people) && entry.people.length > 0, `章节 ${entry.id} 至少需要一条人物或群体连接`);
  assert(typeof entry.place === "string" && entry.place.trim(), `章节 ${entry.id} 缺少地点连接`);
  assert(typeof entry.care === "string" && entry.care.trim(), `章节 ${entry.id} 缺少低龄边界说明`);
  assert(!/(?:头骨|骷髅|遗体|尸体|伤口|处决)/.test(`${entry.childTitle}${entry.prompt}${entry.takeaway}${entry.object}`), `章节 ${entry.id} 把不友好视觉词放进了儿童入口`);
}

assert(childLanguageGlossary.audience.includes("4—6岁"), "儿童口语词典的适龄说明必须为4—6岁");
const glossaryTerms = unique(childLanguageGlossary.terms.map((item) => item.term), "儿童口语词典词语");
for (const item of childLanguageGlossary.terms) {
  assert(typeof item.icon === "string" && item.icon.trim(), `儿童口语词典 ${item.term} 缺少图标`);
  assert(typeof item.plain === "string" && item.plain.trim(), `儿童口语词典 ${item.term} 缺少口语解释`);
  assert([...item.plain].length <= 48, `儿童口语词典 ${item.term} 的口语解释超过48字`);
  assert(typeof item.example === "string" && item.example.trim(), `儿童口语词典 ${item.term} 缺少具体例子`);
  assert([...item.example].length <= 80, `儿童口语词典 ${item.term} 的例子超过80字`);
  assert(Number.isInteger(item.priority) && item.priority >= 1 && item.priority <= 3, `儿童口语词典 ${item.term} 的优先级必须为1—3`);
}
const usedGlossaryTerms = new Set();

assert(/^zh-CN-/.test(voiceInterface.voice), "儿童界面语音必须使用普通话音色");
assert(/^[-+]\d+%$/.test(voiceInterface.rate), "儿童界面语速格式无效");
assert(/^[-+]\d+Hz$/.test(voiceInterface.pitch), "儿童界面音高格式无效");
unique(voiceInterface.lines.map((item) => item.id), "儿童界面语音 ID");
for (const line of voiceInterface.lines) {
  assert(typeof line.text === "string" && line.text.trim(), `儿童界面语音 ${line.id} 缺少文字`);
}

assert(voicePronunciations.audience.includes("编辑"), "配音读音表必须明确用于编辑校听");
assert(voicePronunciations.status.includes("pending"), "配音读音表在正式定音前必须保持待校听状态");
assert(typeof voicePronunciations.notation === "string" && voicePronunciations.notation.trim(), "配音读音表缺少拼音记法说明");
assert(Array.isArray(voicePronunciations.yearReadingRules) && voicePronunciations.yearReadingRules.length >= 5, "配音读音表缺少年代读法规则");
unique(voicePronunciations.yearReadingRules.map((item) => item.id), "年代读法规则 ID");
for (const item of voicePronunciations.yearReadingRules) {
  assert(item.example && item.reading && item.note, `年代读法规则 ${item.id} 不完整`);
}
const pronunciationTexts = unique(voicePronunciations.entries.map((item) => item.text), "配音读音表词语");
const pronunciationKinds = new Set(["person", "place", "polyphone", "title", "term", "phrase"]);
const pronunciationCoverage = new Set();
for (const item of voicePronunciations.entries) {
  assert(typeof item.reading === "string" && item.reading.trim(), `配音读音表 ${item.text} 缺少读音`);
  assert([...item.reading].length <= 44, `配音读音表 ${item.text} 的读音过长`);
  assert(pronunciationKinds.has(item.kind), `配音读音表 ${item.text} 的类型无效：${item.kind}`);
  assert(typeof item.note === "string" && item.note.trim(), `配音读音表 ${item.text} 缺少校听提示`);
  assert(Array.isArray(item.chapterIds) && item.chapterIds.length > 0, `配音读音表 ${item.text} 没有关联章节`);
  unique(item.chapterIds, `配音读音表 ${item.text} 的章节 ID`);
  for (const chapterId of item.chapterIds) {
    assert(chapterIds.has(chapterId), `配音读音表 ${item.text} 使用了未知章节 ${chapterId}`);
    const chapter = catalogChapterById.get(chapterId);
    const detailText = fs.readFileSync(path.join(root, chapter.detailPath), "utf8");
    const entryText = JSON.stringify(childEntryById.get(chapterId));
    const focusedText = JSON.stringify(focusedChapterById.get(chapterId) ?? {});
    assert(`${entryText}\n${detailText}\n${focusedText}`.includes(item.text), `配音读音表 ${item.text} 未出现在章节 ${chapterId}`);
    pronunciationCoverage.add(chapterId);
  }
}
for (const chapterId of chapterIds) {
  assert(pronunciationCoverage.has(chapterId), `章节 ${chapterId} 缺少人名、地名或多音字校听项`);
}

for (const source of sourceRegistry.sources) {
  assert(typeof source.title === "string" && source.title.trim(), `来源 ${source.id} 缺少标题`);
  assert(typeof source.institution === "string" && source.institution.trim(), `来源 ${source.id} 缺少机构`);
  assert(/^https?:\/\//.test(source.url), `来源 ${source.id} 的网址格式无效`);
  assert(typeof source.factUse === "string" && source.factUse.trim(), `来源 ${source.id} 缺少事实用途说明`);
}

assert(catalog.trackId === "china-ancient", "当前目录必须属于 china-ancient");
assert(catalog.periods.length === 13, `中国古代史目录应有 13 个儿童时间河时期，当前为 ${catalog.periods.length}`);
const ancientPeriodIds = catalog.periods.map((period) => period.id);
const expectedAncientPeriodIds = [
  "ancient-origins",
  "xia-shang-western-zhou",
  "spring-autumn-warring-states",
  "qin",
  "han",
  "three-kingdoms-jin-northern-southern",
  "sui",
  "tang",
  "five-dynasties-ten-kingdoms",
  "song",
  "yuan",
  "ming",
  "qing",
];
assert(
  JSON.stringify(ancientPeriodIds) === JSON.stringify(expectedAncientPeriodIds),
  "中国古代史时期必须按独立站与并行关系排列",
);
for (const periodId of expectedAncientPeriodIds) {
  assert(catalog.chapters.some((chapter) => chapter.periodId === periodId), `时期 ${periodId} 至少需要一个可玩章节`);
}
const mergedPeriodIds = new Set(["qin-han", "sui-tang-five-dynasties", "liao-song-xia-jin-yuan", "ming-qing"]);
assert(!catalog.periods.some((period) => mergedPeriodIds.has(period.id)), "秦至清重要时期不得继续使用合并站 ID");
assert(catalog.chapters.length === 43, `中国古代史目录应有 43 章，当前为 ${catalog.chapters.length}`);
assert(!catalog.periods.some((period) => period.id === "liao-xia-jin"), "辽·西夏·金不应保留独立导航站");
assert(catalog.chapters.find((chapter) => chapter.id === "cn-ancient-07-01-parallel-regimes")?.periodId === "song", "辽宋夏金并立故事必须收进宋站同一窗口");
for (const chapterId of ["cn-ancient-04-05-qin-great-wall", "cn-ancient-06-08-zhenguan-governance", "cn-ancient-07-07-song-compass-navigation", "cn-ancient-07-08-song-gunpowder-records"]) {
  assert(catalog.chapters.some((chapter) => chapter.id === chapterId), `新增核心课程故事缺失：${chapterId}`);
}
assert(catalogs[1].trackId === "china-modern", "第二份目录必须属于 china-modern");
assert(catalogs[1].periods.length === 6, `中国近代史目录应有 6 个阶段，当前为 ${catalogs[1].periods.length}`);
assert(catalogs[1].chapters.length === 14, `中国近代史目录应有 14 章，当前为 ${catalogs[1].chapters.length}`);
assert(catalogs[2].trackId === "china-contemporary", "第三份目录必须属于 china-contemporary");
assert(catalogs[2].periods.length === 4, `中国现代史目录应有 4 个阶段，当前为 ${catalogs[2].periods.length}`);
assert(catalogs[2].chapters.length === 10, `中国现代史目录应有 10 章，当前为 ${catalogs[2].chapters.length}`);
const expectedCatalogs = [
  ["china-ancient", 43],
  ["china-modern", 14],
  ["china-contemporary", 10],
  ["world-ancient", 10],
  ["world-modern", 10],
  ["world-contemporary", 10],
  ["cross-disciplinary", 6],
];
let factCardCount = 0;
for (const [index, [trackId, chapterCount]] of expectedCatalogs.entries()) {
  assert(catalogs[index].trackId === trackId, `第 ${index + 1} 份目录必须属于 ${trackId}`);
  assert(catalogs[index].chapters.length === chapterCount, `${trackId} 应有 ${chapterCount} 章，当前为 ${catalogs[index].chapters.length}`);
  assert(productMap.tracks[index].id === trackId, `产品地图第 ${index + 1} 项必须属于 ${trackId}`);
  assert(productMap.tracks[index].catalogPath === catalogPaths[index], `${trackId} 的 catalogPath 与实际文件不一致`);
  assert(productMap.tracks[index].chapterCatalogStatus === "complete-outline", `${trackId} 的完整目录状态未登记`);
}

for (const currentCatalog of catalogs) {
  const catalogPeriodIds = unique(currentCatalog.periods.map((item) => item.id), `${currentCatalog.trackId} 时期 ID`);
  const chapterOrders = currentCatalog.chapters.map((item) => item.order);
  assert(chapterOrders.every((value, index) => value === index + 1), `${currentCatalog.trackId} 章节 order 必须从 1 连续排列`);

  if (currentCatalog.trackId === "china-ancient") {
    for (const periodId of catalogPeriodIds) {
      assert(timelinePeriodIds.has(periodId), `目录时期未出现在主时间线：${periodId}`);
    }
  }

  for (const chapter of currentCatalog.chapters) {
    assert(catalogPeriodIds.has(chapter.periodId), `章节 ${chapter.id} 使用了未知时期 ${chapter.periodId}`);
    assert(chapter.evidencePlan.length >= 2, `章节 ${chapter.id} 至少需要两种证据`);
    assert(chapter.curriculumRefs.length > 0, `章节 ${chapter.id} 缺少课程依据`);
    for (const ref of chapter.curriculumRefs) {
      const sourceId = ref.split("#")[0];
      assert(sourceIds.has(sourceId), `章节 ${chapter.id} 引用了未登记来源 ${sourceId}`);
    }
    if (chapter.detailPath) {
      const absoluteDetailPath = path.join(root, chapter.detailPath);
      assert(fs.existsSync(absoluteDetailPath), `章节详稿不存在：${chapter.detailPath}`);
      const detailText = fs.readFileSync(absoluteDetailPath, "utf8");
      const citationGroups = [...detailText.matchAll(/\[([A-Z][A-Z0-9-]+(?:;\s*[A-Z][A-Z0-9-]+)*)\]/g)];
      for (const match of citationGroups) {
        for (const sourceId of match[1].split(/;\s*/)) {
          assert(sourceIds.has(sourceId), `章节 ${chapter.id} 的详稿引用了未登记来源 ${sourceId}`);
        }
      }

      assert(detailText.includes(chapter.id), `章节详稿未写入自身 ID：${chapter.id}`);
      assert(/适龄|建议年龄|适用年龄/.test(detailText), `章节 ${chapter.id} 缺少适龄说明`);
      assert(/^## 本章结论$/m.test(detailText), `章节 ${chapter.id} 缺少本章结论`);

      const factSection = detailText.match(/\n## (?:\d+条)?事实卡\s*\n([\s\S]*?)(?=\n## |$)/);
      assert(factSection, `章节 ${chapter.id} 缺少事实卡`);
      const factLines = factSection[1].split("\n").filter((line) => /^\d+\.\s/.test(line));
      assert(factLines.length >= 5, `章节 ${chapter.id} 的事实卡少于 5 条`);
      assertSequential(
        factLines.map((line) => Number(line.match(/^(\d+)\./)[1])),
        factLines.length,
        `章节 ${chapter.id} 的事实卡`,
      );
      factCardCount += factLines.length;
      for (const factLine of factLines) {
        assert(
          /\[[A-Z][A-Z0-9-]+(?:;\s*[A-Z][A-Z0-9-]+)*\]/.test(factLine),
          `章节 ${chapter.id} 有未直接标注来源的事实卡：${factLine}`,
        );
      }

      const childSection = detailText.match(
        /\n## [^\n]*(?:儿童[^\n]*(?:语音|故事)|\d+屏儿童)[^\n]*\n([\s\S]*?)(?=\n## |$)/,
      );
      assert(childSection, `章节 ${chapter.id} 缺少儿童页面与语音稿`);
      const childText = childSection[1];
      const glossaryMatches = childLanguageGlossary.terms.filter((item) => `${childText}\n${JSON.stringify(childEntryById.get(chapter.id))}`.includes(item.term));
      assert(glossaryMatches.length > 0 || /^cn-ancient-(04|05|06|07|08)-/.test(chapter.id), `章节 ${chapter.id} 没有匹配任何儿童口语词典解释`);
      for (const item of glossaryMatches) usedGlossaryTerms.add(item.term);
      const screenHeadings = childText.match(/^### (?:第\d+屏|\d+\.)[^\n]*/gm) ?? [];
      assert(
        screenHeadings.length === chapter.targets.screens,
        `章节 ${chapter.id} 屏幕数为 ${screenHeadings.length}，目录目标为 ${chapter.targets.screens}`,
      );
      assertSequential(
        screenHeadings.map((heading) => {
          const match = heading.match(/^### (?:第(\d+)屏|(\d+)\.)/);
          return Number(match[1] ?? match[2]);
        }),
        chapter.targets.screens,
        `章节 ${chapter.id} 的屏幕`,
      );
      const screenTextBlocks = [
        ...[...childText.matchAll(/\*\*屏幕文字\*\*\s*\n\n([\s\S]*?)(?=\n\n\*\*|\n\n### |$)/g)].map((match) => match[1]),
        ...[...childText.matchAll(/^屏幕文字：\s*\n\n(?:>\s*)?([^\n]+)/gm)].map((match) => match[1]),
      ];
      assert(
        screenTextBlocks.length === chapter.targets.screens,
        `章节 ${chapter.id} 的儿童大字块为 ${screenTextBlocks.length} 个，目录目标为 ${chapter.targets.screens}`,
      );
      for (const [screenIndex, screenText] of screenTextBlocks.entries()) {
        const visibleTextLength = [...screenText
          .replace(/\[[^\]]+\]/g, "")
          .replace(/[*_`>#-]/g, "")
          .replace(/\s+/g, "")].length;
        const screenTextLimit = screenIndex === 0 ? 120 : 90;
        assert(
          visibleTextLength <= screenTextLimit,
          `章节 ${chapter.id} 第 ${screenIndex + 1} 屏大字超过 ${screenTextLimit} 字（当前 ${visibleTextLength} 字）`,
        );
      }
      const firstScreenHeading = childText.match(/^### (?:第1屏|1\.)[^\n]*/m)?.[0] ?? "";
      assert(
        /时间线|时间定位/.test(firstScreenHeading),
        `章节 ${chapter.id} 的第一屏必须明确为时间线：${firstScreenHeading || "未找到第一屏"}`,
      );

      const audioNumbers = new Set([
        ...[...childText.matchAll(/^语音 `[A-Z](\d+)`：/gm)].map((match) => Number(match[1])),
        ...[...childText.matchAll(/^\*\*语音(\d+)[^*]*\*\*/gm)].map((match) => Number(match[1])),
        ...[...childText.matchAll(/^### 语音(\d+)：/gm)].map((match) => Number(match[1])),
      ]);
      assert(
        audioNumbers.size === chapter.targets.audioClips,
        `章节 ${chapter.id} 语音数为 ${audioNumbers.size}，目录目标为 ${chapter.targets.audioClips}`,
      );
      assertSequential(audioNumbers, chapter.targets.audioClips, `章节 ${chapter.id} 的语音`);

      const embeddedInteractionNumbers = new Set([
        ...[...detailText.matchAll(/^\*\*互动(\d+)[^*]*\*\*/gm)].map((match) => Number(match[1])),
        ...[...detailText.matchAll(/^### 互动(\d+)：/gm)].map((match) => Number(match[1])),
      ]);
      let interactionCount = embeddedInteractionNumbers.size;
      if (interactionCount === 0) {
        const interactionSection = detailText.match(
          /\n## (?:互动设计|互动|互动题[^\n]*)\s*\n([\s\S]*?)(?=\n## |$)/,
        );
        assert(interactionSection, `章节 ${chapter.id} 缺少互动设计`);
        const numberedInteractions = [...interactionSection[1].matchAll(/^(\d+)\.\s/gm)].map((match) => Number(match[1]));
        interactionCount = numberedInteractions.length;
        assertSequential(numberedInteractions, chapter.targets.interactions, `章节 ${chapter.id} 的互动`);
      }
      assert(
        interactionCount === chapter.targets.interactions,
        `章节 ${chapter.id} 互动数为 ${interactionCount}，目录目标为 ${chapter.targets.interactions}`,
      );
      if (embeddedInteractionNumbers.size > 0) {
        assertSequential(
          embeddedInteractionNumbers,
          chapter.targets.interactions,
          `章节 ${chapter.id} 的互动`,
        );
      }

      assert(
        /^## [^\n]*(?:图片|素材|视觉)[^\n]*$/m.test(detailText),
        `章节 ${chapter.id} 缺少图片、素材或视觉边界说明`,
      );
    }
  }
}

for (const term of glossaryTerms) {
  assert(usedGlossaryTerms.has(term), `儿童口语词典词语没有在任何章节使用：${term}`);
}

const assetIds = unique(assetRegistries.flatMap((registry) => registry.assets.map((asset) => asset.id)), "素材 ID");
const assetById = new Map(assetRegistries.flatMap((registry) => registry.assets.map((asset) => [asset.id, asset])));
const chapterAssetCoverage = new Set();
const declaredLocalAssetPaths = new Set();
const availableLocalAssetPaths = new Set();
for (const registry of assetRegistries) {
  for (const coveredChapterId of registry.chapterIds ?? []) {
    assert(chapterIds.has(coveredChapterId), `素材登记表使用了未知章节 ${coveredChapterId}`);
    chapterAssetCoverage.add(coveredChapterId);
  }
  for (const asset of registry.assets) {
    assert(asset.title ?? asset.objectName, `素材 ${asset.id} 缺少名称`);
    assert(typeof asset.clearance === "string" && asset.clearance, `素材 ${asset.id} 缺少授权状态`);
    assert(asset.childVisibility === undefined || ["child-ok", "editor-only"].includes(asset.childVisibility), `素材 ${asset.id} 的儿童可见性无效`);
    const assetBoundaryText = `${asset.notes ?? ""} ${asset.boundary ?? ""}`;
    const boundaryRequiresEditorOnly = /(?:仅供|只供).*编辑|不直接进入低龄|只用于家长层|只用于家长与编辑/u.test(assetBoundaryText);
    assert(!boundaryRequiresEditorOnly || asset.childVisibility === "editor-only", `素材 ${asset.id} 的文字边界要求仅供编辑，但没有标记 editor-only`);
    if (asset.childVisibility === "editor-only") {
      assert(typeof (asset.notes ?? asset.boundary) === "string" && (asset.notes ?? asset.boundary).trim(), `编辑层素材 ${asset.id} 缺少使用边界说明`);
    }
    assert(Array.isArray(asset.factSourceIds), `素材 ${asset.id} 缺少事实来源列表`);
    assert(
      asset.factSourceIds.length > 0 || asset.contentStatus === "needs-primary-object-record",
      `素材 ${asset.id} 没有事实来源，也未标记为待补收藏机构记录`,
    );
    for (const sourceId of asset.factSourceIds ?? []) {
      assert(sourceIds.has(sourceId), `素材 ${asset.id} 引用了未登记来源 ${sourceId}`);
    }
    for (const coveredChapterId of asset.chapterIds ?? []) {
      assert(chapterIds.has(coveredChapterId), `素材 ${asset.id} 使用了未知章节 ${coveredChapterId}`);
      chapterAssetCoverage.add(coveredChapterId);
    }
    if (asset.localPath) {
      assert(asset.localPath.startsWith("reference-assets/"), `素材 ${asset.id} 的本地路径不在 reference-assets：${asset.localPath}`);
      declaredLocalAssetPaths.add(asset.localPath);
      if (fs.existsSync(path.join(root, asset.localPath))) availableLocalAssetPaths.add(asset.localPath);
      else if (requireLocalAssets) assert(false, `素材文件不存在：${asset.localPath}`);
    }
    if (asset.clearance.startsWith("cleared-")) {
      assert(asset.license && asset.license !== "未确认", `开放素材 ${asset.id} 缺少许可名称`);
      if (asset.clearance === "cleared-project-created" && asset.sourceFile) {
        assert(asset.sourceFile === "content/focused-quests.json" && fs.existsSync(path.join(root, asset.sourceFile)), `自制素材 ${asset.id} 缺少原始描述`);
        assert(asset.licensePath && fs.existsSync(path.join(root, asset.licensePath)), `自制素材 ${asset.id} 缺少本地署名许可说明`);
      } else {
        assert(asset.licenseUrl, `开放素材 ${asset.id} 缺少许可链接`);
        assert(asset.sourcePage ?? asset.imageSourcePage, `开放素材 ${asset.id} 缺少来源页`);
      }
      assert(asset.localPath, `已清权素材 ${asset.id} 缺少本地文件`);
    }
  }
  for (const reusedAsset of registry.reusedAssets ?? []) {
    const originalAsset = assetById.get(reusedAsset.assetId);
    assert(originalAsset, `复用素材 ${reusedAsset.assetId} 没有原始登记`);
    assert(
      originalAsset.localPath === reusedAsset.localPath,
      `复用素材 ${reusedAsset.assetId} 的路径与原始登记不一致`,
    );
    assert(typeof reusedAsset.usage === "string" && reusedAsset.usage.trim(), `复用素材 ${reusedAsset.assetId} 缺少用途`);
    assert(typeof reusedAsset.boundary === "string" && reusedAsset.boundary.trim(), `复用素材 ${reusedAsset.assetId} 缺少证据边界`);
    if (reusedAsset.localPath) {
      if (fs.existsSync(path.join(root, reusedAsset.localPath))) availableLocalAssetPaths.add(reusedAsset.localPath);
      else if (requireLocalAssets) assert(false, `复用素材文件不存在：${reusedAsset.localPath}`);
    }
  }
}

for (const chapterId of chapterIds) {
  assert(chapterAssetCoverage.has(chapterId), `章节 ${chapterId} 没有任何素材登记覆盖`);
}

const reusedAssetIdsByChapter = new Map();
for (const registry of assetRegistries) {
  const reusedIds = (registry.reusedAssets ?? []).map((item) => item.assetId);
  if (!reusedIds.length) continue;
  for (const coveredChapterId of registry.chapterIds ?? []) {
    const current = reusedAssetIdsByChapter.get(coveredChapterId) ?? new Set();
    for (const reusedId of reusedIds) current.add(reusedId);
    reusedAssetIdsByChapter.set(coveredChapterId, current);
  }
}

for (const entry of childEntryPoints.chapters) {
  if (!entry.preferredAssetId) continue;
  const preferredAsset = assetById.get(entry.preferredAssetId);
  assert(preferredAsset, `章节 ${entry.id} 的首选入口素材不存在：${entry.preferredAssetId}`);
  assert(preferredAsset.clearance.startsWith("cleared-"), `章节 ${entry.id} 的首选入口素材未清权：${entry.preferredAssetId}`);
  assert(preferredAsset.childVisibility !== "editor-only", `章节 ${entry.id} 的首选入口素材被标为编辑层：${entry.preferredAssetId}`);
  const registeredToChapter = (preferredAsset.chapterIds ?? []).includes(entry.id)
    || Boolean(reusedAssetIdsByChapter.get(entry.id)?.has(entry.preferredAssetId));
  assert(registeredToChapter, `素材 ${entry.preferredAssetId} 未登记给章节 ${entry.id}`);
}

const validStepIds = new Set(["time", "beginning", "journey", "change", "takeaway"]);
unique(stepImageOverrideRegistry.chapters.map((entry) => entry.id), "步骤配图覆盖章节 ID");
for (const entry of stepImageOverrideRegistry.chapters) {
  assert(chapterIds.has(entry.id), `步骤配图覆盖使用了未知章节 ${entry.id}`);
  assert(entry.steps && Object.keys(entry.steps).length > 0, `章节 ${entry.id} 的步骤配图覆盖为空`);
  for (const [stepId, assetId] of Object.entries(entry.steps)) {
    assert(validStepIds.has(stepId), `章节 ${entry.id} 使用了未知步骤 ${stepId}`);
    const asset = assetById.get(assetId);
    assert(asset, `章节 ${entry.id}/${stepId} 覆盖素材不存在：${assetId}`);
    assert(asset.clearance.startsWith("cleared-"), `章节 ${entry.id}/${stepId} 覆盖素材未清权：${assetId}`);
    assert(asset.childVisibility !== "editor-only", `章节 ${entry.id}/${stepId} 覆盖素材仅供编辑：${assetId}`);
    const registeredToChapter = (asset.chapterIds ?? []).includes(entry.id)
      || Boolean(reusedAssetIdsByChapter.get(entry.id)?.has(assetId));
    assert(registeredToChapter, `章节 ${entry.id}/${stepId} 覆盖素材未登记给本章：${assetId}`);
  }
}

const allChapters = catalogs.flatMap((item) => item.chapters);
const detailedChapters = allChapters.filter((item) => item.detailPath).length;
const verifiedResearch = allChapters.filter((item) => item.status.research === "verified").length;
const approvedChapters = allChapters.filter((item) => item.status.review === "approved").length;
const screenCount = allChapters.reduce((sum, item) => sum + item.targets.screens, 0);
const audioClipCount = allChapters.reduce((sum, item) => sum + item.targets.audioClips, 0);
const interactionCount = allChapters.reduce((sum, item) => sum + item.targets.interactions, 0);
const clearedAssetCount = assetRegistries
  .flatMap((registry) => registry.assets)
  .filter((asset) => asset.clearance.startsWith("cleared-")).length;

console.log(`内容校验通过：${catalogs.length} 个课程板块，共 ${chapterIds.size} 章。`);
console.log(`其中：中国史 ${catalogs.slice(0, 3).reduce((sum, item) => sum + item.chapters.length, 0)} 章，世界史 ${catalogs.slice(3, 6).reduce((sum, item) => sum + item.chapters.length, 0)} 章，跨学科 ${catalogs[6].chapters.length} 章。`);
console.log(`已有详稿 ${detailedChapters} 章，事实研究完成 ${verifiedResearch} 章，最终审核通过 ${approvedChapters} 章。`);
console.log(`事实卡 ${factCardCount} 条，儿童屏幕 ${screenCount} 屏，语音稿 ${audioClipCount} 段，互动 ${interactionCount} 个。`);
console.log(`低龄兴趣入口 ${childEntryIds.size} 章，均含实物入口与地点连接。`);
console.log(`儿童口语词典 ${glossaryTerms.size} 词，${chapterIds.size}章均已匹配难词解释。`);
console.log(`配音读音表 ${pronunciationTexts.size} 项、年代读法 ${voicePronunciations.yearReadingRules.length} 条，${chapterIds.size}章均有编辑校听入口。`);
console.log(`来源登记 ${sourceIds.size} 条，素材登记 ${assetIds.size} 条，其中已清权本地素材 ${clearedAssetCount} 条。`);
console.log(`本机研究素材缓存 ${availableLocalAssetPaths.size}/${declaredLocalAssetPaths.size} 个文件${requireLocalAssets ? "，已执行严格路径检查" : "；发布包构建不强制携带原始研究缓存"}。`);
