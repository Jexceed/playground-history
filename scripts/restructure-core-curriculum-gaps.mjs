import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const writeJson = (relativePath, value) => fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);

const catalog = readJson("content/catalog.json");
catalog.contentVersion = "0.13.0";
catalog.editorialNote = "课程内容范围依据教育部《义务教育历史课程标准（2022年版）》中国古代史1.1—1.7；儿童时间河以中国国家博物馆“古代中国”总脉络为依据。秦、汉、隋、唐、五代十国、宋、元、明、清分别成站；辽、西夏、金的并立故事收在宋站同一窗口内，但明确为与两宋先后并立的不同政权，不写成宋的下属或单线朝代。";
catalog.periods = catalog.periods.filter((period) => period.id !== "liao-xia-jin");
for (const period of catalog.periods) {
  if (period.id === "song") {
    period.label = "宋朝（与辽·西夏·金并立）";
    period.years = "916—1279年（宋960年起）";
  }
}
catalog.periods.forEach((period, index) => {
  period.order = index + 1;
});

const byId = new Map(catalog.chapters.map((chapter) => [chapter.id, chapter]));
Object.assign(byId.get("cn-ancient-04-01-qin-unification"), {
  title: "秦朝为什么要用同一把尺",
  coreQuestion: "一只铁权、一把尺和一只量杯，怎样把统一度量衡带到各地？",
  throughline: "从秦铁权诏文进入长度、容量、重量三类共同标准，再跟官员、工匠和使用者追踪校准、执行、便利与负担。",
  evidencePlan: ["artifact", "document", "technology"],
});
Object.assign(byId.get("cn-ancient-07-01-parallel-regimes"), { periodId: "song" });
Object.assign(byId.get("cn-ancient-07-03-song-inventions"), {
  title: "毕昇的活字怎样排成一页",
  coreQuestion: "一个个能移动的字，怎样被排成书页又重新使用？",
  throughline: "从唐代雕版进入北宋毕昇泥活字，沿制字、拣字、排版、刷印、校对和拆版理解活字原理，并解释雕版与活字为什么长期并用。",
  evidencePlan: ["technology", "document", "artifact"],
});

const status = { outline: "verified", research: "verified", script: "first-draft", assets: "verified", audio: "not-started", review: "in-progress" };
const additions = [
  {
    after: "cn-ancient-04-01-qin-unification",
    chapter: {
      id: "cn-ancient-04-05-qin-great-wall",
      periodId: "qin",
      title: "秦长城不是从空地里突然长出来的",
      coreQuestion: "秦朝怎样把更早的北方城墙连接成防御系统？",
      throughline: "先找战国旧墙段，再看秦怎样连接、修缮和增筑，并把墙、关口、道路、烽燧与驻守放进同一防御系统；同时区分秦代遗址与明代砖石长城。",
      curriculumRefs: ["MOE-HISTORY-CURRICULUM-2022#1.3", "NMC-ANCIENT-CHINA#秦汉", "UNESCO-GREAT-WALL"],
      evidencePlan: ["site", "map", "system"],
      worldLink: { topic: "不同地区边地防御与大型工程", status: "planned" },
      targets: { durationMinutes: 8, screens: 6, audioClips: 7, interactions: 3 },
      detailPath: "content/chapters/qin-han-qin-great-wall.md",
      status: { ...status },
    },
  },
  {
    after: "cn-ancient-06-02-tang-governance",
    chapter: {
      id: "cn-ancient-06-08-zhenguan-governance",
      periodId: "tang",
      title: "贞观之治是谁一起做出来的",
      coreQuestion: "田地、奏章和不同意见，怎样让唐初生活慢慢安定？",
      throughline: "从唐初恢复生产进入奏章传递和纳谏，再让地方官、农人、工匠与居民完成执行接力，理解贞观之治不是单人奇迹或完美时代。",
      curriculumRefs: ["MOE-HISTORY-CURRICULUM-2022#1.5", "PEP-HISTORY-REVISION-2024#七下第一单元", "NMC-SUI-TANG-FIVE-DYNASTIES#唐前期"],
      evidencePlan: ["document", "people", "daily-life"],
      worldLink: { topic: "7世纪欧亚大陆不同政权的恢复与治理", status: "planned" },
      targets: { durationMinutes: 8, screens: 6, audioClips: 7, interactions: 3 },
      detailPath: "content/chapters/tang-zhenguan-governance.md",
      status: { ...status },
    },
  },
  {
    after: "cn-ancient-07-03-song-inventions",
    chapter: {
      id: "cn-ancient-07-07-song-compass-navigation",
      periodId: "song",
      title: "小小指南针为什么不能独自开船",
      coreQuestion: "指南针和星辰、风向、水深怎样一起帮助海船辨认方向？",
      throughline: "从磁针方向线索进入天空、海岸、风向和水深的航海工具链，再让船上成年人观察、记录、商量并不断修正航路。",
      curriculumRefs: ["MOE-HISTORY-CURRICULUM-2022#1.6", "PEP-HISTORY-REVISION-2024#七下第二单元", "NMC-LIAO-SONG-XIA-JIN-YUAN#科技文化"],
      evidencePlan: ["technology", "document", "navigation"],
      worldLink: { topic: "航海知识在欧亚海路上的使用与交流", status: "planned" },
      targets: { durationMinutes: 8, screens: 6, audioClips: 7, interactions: 3 },
      detailPath: "content/chapters/song-compass-navigation.md",
      status: { ...status },
    },
  },
  {
    after: "cn-ancient-07-07-song-compass-navigation",
    chapter: {
      id: "cn-ancient-07-08-song-gunpowder-records",
      periodId: "song",
      title: "火药知识怎样被安全记进书里",
      coreQuestion: "长期观察怎样变成书中记录，再发展出不同用途？",
      throughline: "只追踪观察、记录、传播和用途变化，不提供配方、比例、混合或点火步骤；以《武经总要》传世图像练习文献证据边界。",
      curriculumRefs: ["MOE-HISTORY-CURRICULUM-2022#1.6", "PEP-HISTORY-REVISION-2024#七下第二单元", "NMC-LIAO-SONG-XIA-JIN-YUAN#科技文化"],
      evidencePlan: ["technology", "document", "safety"],
      worldLink: { topic: "火药知识在不同地区的传播、改造与风险", status: "planned" },
      targets: { durationMinutes: 8, screens: 6, audioClips: 7, interactions: 3 },
      detailPath: "content/chapters/song-gunpowder-records.md",
      status: { ...status },
    },
  },
];

let chapters = catalog.chapters.filter((chapter) => !additions.some(({ chapter: item }) => item.id === chapter.id));
for (const { after, chapter } of additions) {
  const index = chapters.findIndex((item) => item.id === after);
  if (index < 0) throw new Error(`Missing insertion target: ${after}`);
  chapters.splice(index + 1, 0, chapter);
}
chapters.forEach((chapter, index) => {
  chapter.order = index + 1;
});
catalog.chapters = chapters;
writeJson("content/catalog.json", catalog);

const timeline = readJson("content/timeline.json");
timeline.editorialNote = "总脉络和年代依据中国国家博物馆“古代中国”基本陈列、课程标准与统编教材。儿童导航把辽、西夏、金的并立故事收进宋站同一窗口，便于孩子看到同一时间的多政权地图；正文仍明确它们与两宋先后并立，不写成宋的下属或单线先后。";
timeline.periods = timeline.periods.filter((period) => period.id !== "liao-xia-jin");
for (const period of timeline.periods) {
  if (period.id === "song") {
    period.label = "宋朝（与辽·西夏·金并立）";
    period.years = "916—1279年（宋960年起）";
    period.sourceSummary = "两宋时期农业、手工业、商业、城市、科技文化和海外贸易显著发展；辽、西夏、金与两宋先后并立，在战争、议和、贸易、迁徙和制度文化交流中形成不断变化的多政权格局。";
    period.childSummary = "在同一个时间窗口里看宋与辽、西夏、金：地图边界会变，城市、商旅、印刷、指南针和书本也在继续发展。";
    period.sourceIds = ["NMC-ANCIENT-CHINA", "NMC-LIAO-SONG-XIA-JIN-YUAN", "PEP-HISTORY-REVISION-2024"];
  }
}
timeline.periods.forEach((period, index) => {
  period.order = index + 1;
});
writeJson("content/timeline.json", timeline);

const productMap = readJson("content/product-map.json");
productMap.contentVersion = "0.61.0";
writeJson("content/product-map.json", productMap);
