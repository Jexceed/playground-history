# 历史游戏内容库

这套内容库用于把“先讲故事”改成“先看时间线，再从实物证据进入故事”。内容采用平台无关的 JSON、Markdown 和本地媒体，网页版与后续微信小程序共用同一套历史资料。

当前基线是7个板块、99章第一版内容；99章均进入同一套五步故事任务，但真实4—6岁儿童复述测试尚未进行，最终审核通过仍为0章。总建设阶段见 `../docs/BUILD-PLAN.md`，资源维护见 `../docs/RESOURCES.md`，下一步见 `../docs/TODO.md`。

## 产品中的固定顺序

1. 首页先出现中华文明时间线，让孩子先知道“现在讲的是哪一段”。
2. 进入时代后只提出一个核心问题，例如“为什么说唐代长安是一座开放的城市？”
3. 用地图、遗址、文物三类证据回答，不让文物代替真人自述历史。
4. 每一屏只保留一个核心问题、一张主图和一个大字块；语音可拆成主讲与证据提醒，并能单独暂停、重播。
5. 事实正文和故事角色分开：事实必须有出处；虚构角色必须标注“故事角色”。

## 事实等级

- `A`：国家课程标准、国家统编教材目录、国家级或省级博物馆、考古机构、联合国教科文组织等直接资料，可进入儿童正文。
- `B`：开放授权图片页、博物馆公开展签转录等，可用于补充元数据或授权信息；事实需与 A 级来源交叉核对。
- `C`：旅游文章、商业媒体、百科式二手整理，只能用于发现线索，不能直接进入正文。

## 写作边界

可以说：

- “这件骆驼俑出土于唐墓，是唐代人制作的随葬艺术品。”
- “俑上的乐舞人物和乐器，为我们观察唐代乐舞与文化交流提供了证据。”
- “考古人员在唐长安东市遗址发现了道路、水井、排水设施和带有‘酒店’字样的残片。”

不能直接说：

- “这只骆驼真的从西域一路走到长安。”——文物是陶俑，不是某次旅行的记录。
- “它背上驮的是商队货物。”——载乐骆驼表现的是乐舞或百戏，不应写成商队。
- “长安是当时世界第一大城市”“有一百万人口。”——除非为具体数字找到可核验的一手学术来源，否则不进入儿童正文。
- “胡人都来自同一个国家。”——“胡人”是古代文献中的宽泛称呼，不能当成单一民族或国籍。

## 已整理文件

- `content-model.md`：网页版与微信小程序共用内容的结构边界。
- `product-map.json`：中国史、世界史和跨学科学习的完整产品范围。
- `timeline.json`：八段中国古代史主时间线。
- `catalog.json`：中国古代史 32 章完整目录、问题链与制作状态。
- `catalog-china-modern.json`：中国近代史 6 段、14 章完整目录。
- `catalog-china-contemporary.json`：中国现代史 4 段、10 章完整目录。
- `catalog-world-ancient.json`：世界古代史 2 段、10 章完整目录。
- `catalog-world-modern.json`：世界近代史 6 段、10 章完整目录。
- `catalog-world-contemporary.json`：世界现代史 5 段、10 章完整目录。
- `catalog-cross-disciplinary.json`：5 个跨学科证据任务。
- `sources.json`：可机器读取的权威来源登记。
- `schema/chapter-catalog.schema.json`：章节目录的数据格式。
- `chapters/tang-changan.md`：第一章的事实链、儿童文案和语音脚本底稿。
- `chapters/ancient-origins-*.md`：远古时期 3 章的事实卡、儿童页面与分段语音稿。
- `chapters/xia-shang-zhou-*.md`：夏商西周 3 章的事实卡、儿童页面与分段语音稿。
- `chapters/spring-autumn-warring-states-*.md`：春秋战国 3 章的事实卡、儿童页面与分段语音稿。
- `chapters/qin-han-*.md`：文件名沿用旧素材域，运行目录已拆为秦1章、汉3章。
- `chapters/three-kingdoms-jin-northern-southern-*.md`：三国两晋南北朝 4 章的事实卡、儿童页面与分段语音稿。
- `chapters/sui-unification-canal.md`、`chapters/tang-*.md`：运行目录已拆为隋、唐、五代十国独立时期；`tang-decline.md` 已重写为五代十国章。
- `chapters/liao-song-xia-jin-yuan-*.md`：文件名沿用旧素材域，运行目录已拆为宋、辽·西夏·金（与宋并行）和元。
- `chapters/ming-qing-*.md`：文件名沿用旧素材域，运行目录已拆为明、清，并在清末危机章连接1840年后的中国近代史。
- `assets/ancient-origins-assets.json`：远古时期真实遗址、化石复制品和文物照片的许可登记。
- `assets/xia-shang-zhou-assets.json`：夏商西周真实遗址、甲骨与青铜器照片的许可登记。
- `assets/spring-autumn-warring-states-assets.json`：春秋战国铁器、水利、度量衡、货币和竹简照片的许可登记。
- `assets/qin-han-assets.json`：秦汉度量衡、钱币、墓葬、关隘、简牍、纸与帛书照片的许可登记。
- `assets/three-kingdoms-jin-northern-southern-assets.json`：三国形势图、北朝陶俑、青瓷、书法摹本与云冈石窟照片的许可登记。
- `assets/sui-tang-five-dynasties-assets.json`：大运河遗址、钱币、塔寺、手稿与铁券照片的许可登记。
- `assets/liao-song-xia-jin-yuan-assets.json`：现代形势图、壁画、画卷、纸币印版、活字、技术图、桥梁与瓷器素材的许可登记。
- `assets/ming-qing-assets.json`：故宫今景、航线与疆域研究图、碑刻、画像、古籍书页、现代戏曲传承和工业技术图的许可登记。
- `assets/tang-changan-assets.json`：文物图片候选、授权与署名信息。
- `references.md`：所有事实来源与使用范围。
- `PROGRESS.md`：当前覆盖率和下一批工作。
- `../reference-assets/tang/ATTRIBUTION.md`：已下载开放授权图片的署名清单。
- `../reference-assets/origins/ATTRIBUTION.md`：远古时期开放授权图片的署名清单。
- `../reference-assets/xia-shang-zhou/ATTRIBUTION.md`：夏商西周开放授权图片的署名清单。
- `../reference-assets/spring-autumn-warring-states/ATTRIBUTION.md`：春秋战国开放授权图片的署名清单。
- `../reference-assets/qin-han/ATTRIBUTION.md`：秦汉开放授权图片的署名清单。
- `../reference-assets/three-kingdoms-jin-northern-southern/ATTRIBUTION.md`：三国两晋南北朝开放授权图片的署名清单。
- `../reference-assets/sui-tang-five-dynasties/ATTRIBUTION.md`：隋唐五代补充开放授权图片的署名清单。
- `../reference-assets/liao-song-xia-jin-yuan/ATTRIBUTION.md`：辽宋夏金元开放授权图片的署名与证据边界清单。
- `../reference-assets/ming-qing/ATTRIBUTION.md`：明清开放授权图片的署名与证据边界清单。

## 下一步制作原则

当前不再扩张章节目录。下一步是本机儿童试玩、其余79章人工复核、420项可发布素材逐张确认和正式语音定音。只有91章内容与玩法通过用户最终确认后，才转换微信小程序。图片只有在 `clearance` 已确认时才进入儿童正式页面。
