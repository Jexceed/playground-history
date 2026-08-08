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
const sourceRegistry = readJson("content/sources.json");
const assetRegistryPaths = [
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
const sourceIds = unique(sourceRegistry.sources.map((item) => item.id), "来源 ID");
unique(productMap.tracks.map((item) => item.id), "内容板块 ID");

for (const source of sourceRegistry.sources) {
  assert(typeof source.title === "string" && source.title.trim(), `来源 ${source.id} 缺少标题`);
  assert(typeof source.institution === "string" && source.institution.trim(), `来源 ${source.id} 缺少机构`);
  assert(/^https?:\/\//.test(source.url), `来源 ${source.id} 的网址格式无效`);
  assert(typeof source.factUse === "string" && source.factUse.trim(), `来源 ${source.id} 缺少事实用途说明`);
}

assert(catalog.trackId === "china-ancient", "当前目录必须属于 china-ancient");
assert(catalog.periods.length === 8, `中国古代史目录应有 8 个时期，当前为 ${catalog.periods.length}`);
assert(catalog.chapters.length === 32, `中国古代史目录应有 32 章，当前为 ${catalog.chapters.length}`);
assert(catalogs[1].trackId === "china-modern", "第二份目录必须属于 china-modern");
assert(catalogs[1].periods.length === 6, `中国近代史目录应有 6 个阶段，当前为 ${catalogs[1].periods.length}`);
assert(catalogs[1].chapters.length === 14, `中国近代史目录应有 14 章，当前为 ${catalogs[1].chapters.length}`);
assert(catalogs[2].trackId === "china-contemporary", "第三份目录必须属于 china-contemporary");
assert(catalogs[2].periods.length === 4, `中国现代史目录应有 4 个阶段，当前为 ${catalogs[2].periods.length}`);
assert(catalogs[2].chapters.length === 10, `中国现代史目录应有 10 章，当前为 ${catalogs[2].chapters.length}`);
const expectedCatalogs = [
  ["china-ancient", 32],
  ["china-modern", 14],
  ["china-contemporary", 10],
  ["world-ancient", 10],
  ["world-modern", 10],
  ["world-contemporary", 10],
  ["cross-disciplinary", 5],
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
      assert(asset.licenseUrl, `开放素材 ${asset.id} 缺少许可链接`);
      assert(asset.sourcePage ?? asset.imageSourcePage, `开放素材 ${asset.id} 缺少来源页`);
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
console.log(`来源登记 ${sourceIds.size} 条，素材登记 ${assetIds.size} 条，其中已清权本地素材 ${clearedAssetCount} 条。`);
console.log(`本机研究素材缓存 ${availableLocalAssetPaths.size}/${declaredLocalAssetPaths.size} 个文件${requireLocalAssets ? "，已执行严格路径检查" : "；发布包构建不强制携带原始研究缓存"}。`);
