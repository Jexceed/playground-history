# 秦汉素材署名与使用边界

核验日期：2026-08-06。所有文件保留原始宽高比，只下载 Wikimedia Commons 生成的等比例缩略图；未裁切、未调色。

| 本地文件 | 作品与作者 | 许可 | 必须同时显示的边界 |
| --- | --- | --- | --- |
| `qin-standard-weight.jpg` | *Qin Weight Iron.JPG*，Zcm11 | CC BY-SA 3.0 | 单件铁权不能证明各地立刻完全统一执行。 |
| `banliang-mould.jpg` | *Mould for Casting Banliang Copper Coins 01.jpg*，Gary Lee Todd, Ph.D. | CC0 1.0 | 铸范说明工艺；不说每枚半两钱实际重量完全相同。 |
| `yangling-pottery-animals.jpg` | *Pottery Animals, Yang Ling Tomb of Emperor Jing of Western Han*，Gary Lee Todd, Ph.D. | CC0 1.0 | 帝陵随葬品不是普通家庭生活照片。 |
| `wuzhu-coins.jpg` | *五铢钱 海昏侯国遗址1.JPG*，三猎 | CC BY-SA 4.0 | 墓葬中一批钱币不能代表全社会财富。 |
| `yumen-pass.jpg` | *玉门关 遗址 - panoramio.jpg*，guan | CC BY 3.0 | 今天的遗址不是汉代原貌，关隘也不是整条丝路。 |
| `xuanquan-seal-tag.jpg` | *悬泉置封检.jpg*，三猎 | CC BY-SA 4.0 | 不为封检编造具体收发人或旅程。 |
| `western-han-paper.jpg` | *Western Han Paper (10095191884).jpg*，Gary Lee Todd, Ph.D. | CC0 1.0 | 不能称为蔡伦所造或一定写过字的书页。 |
| `mawangdui-silk-scroll.jpg` | *Silk scroll - Yin Yang and Five Elements, Western Han dynasty, Hunan Museum.jpg*，Huangdan2060 | CC0 1.0 | 这是帛书实物；不把《阴阳五行》本身误称为医学书。 |
| `daoyin-reconstruction.jpg` | *Daoyin tu… Wellcome L0036007.jpg*，Wellcome Collection | CC BY 4.0 | 必须标注“现代复原”，不可冒充出土原件。 |
| `qin-great-wall-connection-child-illustration.png` | 项目组AI辅助生成 | 项目自制 | 秦连接、修缮和增筑北方墙段的儿童艺术表现；不是遗址照片、秦代现场或精确施工复原。 |

完整来源页、许可链接、章节用途和事实核验来源见 `content/assets/qin-han-assets.json`。

## 秦朝量布任务工坊插画（2026-09-13）

文件：`qin-workshop-story-v1.png`，1536×1024。使用内置 imagegen，参考项目原时间长河插画的画风生成。提示词见 `docs/qa/2026-09-13-qin/workshop-art-prompt.txt`。本项目自制，用于本项目；没有另行声明公共开放许可。

这是现代故事插画，非秦代现场、真实人物或工艺复原；准确的尺格、对齐位置与选择反馈由通用交互组件绘制，不依赖图像模型画刻度。秦铁权继续使用上面的真实照片和原有署名许可。

## 三位伙伴在工坊分享发现（2026-09-13）

`qin-friends-reunion-v1.png`，1536×1024。使用内置imagegen生成一次，沿用原旅行团三位小朋友的外形及秦朝工坊参考图的画风。用于虚构旅伴结束情节，不是秦代现场或实际人物的证据。空桌面约从y=490开始，交互尺子放在图的55%高度以下。未修改旧图或真实铁权照片。

完整生成提示词见 `docs/qa/2026-09-13-qin-story/reunion-prompt.txt`。生成原件在项目本地研究缓存，页面缩略图由统一内容脚本制作。


## 汉代铜矩尺对照照片（2026-09-14）

- 文件：`han-bronze-ruler-gary-todd.jpg`；摄影 Gary Todd；2009年；原图4752×3168。
- 照片与许可：https://commons.wikimedia.org/wiki/File:Han_Bronze_Ruler_(9948006553).jpg ，CC0 1.0。
- 馆藏及年代：陕西省文物局一级文物名录序号4876，陕西历史博物馆藏“汉铜矩尺”，年代汉。
- 用途边界：仅作“汉代，秦之后”的真实尺子对照；不称秦尺，不用于据图数刻度，不作为统一度量衡时秦尺实物的证据。原图保存在研究缓存，运行图由脚本等比例缩小。


## 2026-09-14角色统一与实物依据

`qin-friends-reunion-v2.png`：内置imagegen对原相聚图做局部编辑，绿衣小伙伴与主页保持同一角色。原v1留档，不再用于游戏。空白桌面继续由界面叠放准确的学习尺。

`qin-standard-weight.jpg`：真实照片作者Zcm11，CC BY-SA 3.0；原图及许可页：https://commons.wikimedia.org/wiki/File:Qin_Weight_Iron.JPG 。对应器物身份、出土经过与铭文依据河南博物院官方资料：https://www.chnmus.net/ch/collection/appraise/details.html?id=512159158709033041 。照片是开放授权实物摄影，不标作官方摄影；只作等比例缩小，不用AI修改实物。


## 2026-09-14两个男孩的辨识度修订

`qin-friends-reunion-v3.png`（1536×1024）为内置imagegen局部修改的圆框眼镜与齐刘海版本。保持其他角色、表情、动作、画风和空桌面。旧版留档。 完整提示词见 `docs/qa/2026-09-14-character-distinction/prompts/`。


## 2026-09-14统一工具选项

尺子与砝码的交互学习道具由项目代码 `app/ObjectWorkbench.tsx` 绘制；两项使用同一套SVG呈现方式，选择后复用同一组件。道具不属于背景位图，也不是出土器物的外形复原；真实铁权照片、摄影者与CC BY-SA许可仍按原记录保留。

## 2026-09-14秦长城章故事插画（codex + gpt-6 image-gen）

`qin-wall-site-story-v1.png`（1536×1024）：山脚工地场景，两段中间有缺口的低矮旧墙，黄衣男孩与无名工匠。`qin-wall-friends-reunion-v1.png`（1536×1024）：三位小伙伴与工匠在连起来的旧墙段前相聚。均使用 codex exec + gpt-6 image-gen 各生成一次，参考主页v4角色、秦朝工坊v1与相聚v3的画风；角色外形按 `docs/CHARACTERS.md`。提示词见 `docs/qa/2026-09-14-qin-han-wall/prompts/`。

两图均为现代虚构故事插画，不是秦代现场、遗址照片或精确施工复原；下部留空区域由界面叠放学习道具。真实材料继续使用玉门关遗址照片（guan，CC BY 3.0，标注秦之后的汉代）与上文登记素材。

## 2026-09-14场景插画v2（远景蜿蜒长墙）

用户反馈初版“看不出长城的感觉”。`qin-wall-site-story-v2.png`（1536×1024）在v1基础上把远景改为沿山脊蜿蜒到天边的一长串土石墙，黄衣男孩改为指向远方；其余角色、画风与下方留白不变。同为codex image-gen一次生成的故事插画，不是历史现场。v1留档不再进入游戏。

## 2026-09-14汉三章故事插画（codex + gpt-6 image-gen）

各一次生成、无重试，参考主页v4角色与秦朝工坊/相聚画风，角色外形按 `docs/CHARACTERS.md`，下部留空供交互道具。完整提示词见 `docs/qa/2026-09-14-han-trio/prompts/`。

- `han-market-story-v1.png` / `han-market-friends-reunion-v1.png`：汉代集市钱摊场景与相聚（五铢钱章）。
- `silk-post-story-v1.png` / `silk-post-friends-reunion-v1.png`：戈壁驿站备粮与送行（丝路章）。
- `han-paper-workshop-story-v1.png` / `han-paper-friends-reunion-v1.png`：造纸工坊与晾纸架相聚（造纸章）。

均为现代虚构故事插画，不是汉代现场、遗址照片或工艺复原；真实材料继续使用海昏侯五铢钱（三猎，CC BY-SA 4.0）、玉门关遗址（guan，CC BY 3.0）、悬泉置封检（三猎，CC BY-SA 4.0）、西汉纸残片（Gary Lee Todd，CC0 1.0）与马王堆帛书（Huangdan2060，CC0 1.0）等已登记照片。


## 2026-09-14长城接力故事优化

`qin-wall-teamwork-story-v1.png` 为内置imagegen生成的运料、垒墙协作故事插画，沿用山边场景和既有黄衣小伙伴、工匠形象。仅作教学叙事，不作为秦代服装、工具、人员或精确施工的证据；孩子只观察，墙段操作是学习模型。提示词见 `docs/qa/2026-09-14-qin-wall-refinement/teamwork-prompt.txt`。

金山岭照片沿用Severin.stalder摄影、Brandmeister降低蓝色饱和度的Commons编辑版本，CC BY-SA 3.0；本项目只生成缩图，儿童页使用宽幅构图，大图保留全幅。金山岭的明代身份另据河北省文物局资料。玉门关照片仍供原有汉代任务使用，不再用于本章证明秦墙的风化或外貌。

## 长城守关与观察故事图（2026-09-15）

`qin-wall-guard-story-v1.png`：小小历史旅行团项目使用内置imagegen制作的虚构教学插画，供本项目使用。以原协作图为角色与画风参考，新增守关、观察远方的情境；生成后局部修正高处守卫的多余手臂。不是秦代现场、服饰建筑复原或真实人物自述。依据UNESCO长城记录与上海市绿化和市容管理局的亭障用途介绍，只说明防御功能，不据图推断具体装备或通报信号。

完整提示词和修正记录：`docs/qa/2026-09-15-wall-purpose/`。既有工地、运料与相聚图保留。

## 长城相册真实照片（2026-09-15）

运行照片只做等比例缩小和JPEG压缩，未重画、未生成补全；原图与文件页快照保留在本目录及source-pages。历史身份由已登记权威资料支持，Commons仅核对作者、拍摄对象与许可。

- `yumen-pass.jpg`：guan，[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)；[文件页](https://commons.wikimedia.org/wiki/File:%E7%8E%89%E9%97%A8%E5%85%B3_%E9%81%97%E5%9D%80_-_panoramio.jpg)。今天的玉门关遗址和周围戈壁景观。
- `jinshanling-panorama.jpg`：Severin.stalder；色彩编辑 Brandmeister，[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)；[文件页](https://commons.wikimedia.org/wiki/File:The_Great_Wall_of_China_at_Jinshanling-edit.jpg)。金山岭长城沿山脊蜿蜒的全景。金山岭为明代修建段，比秦朝晚很多。
- `jinshanling-walkway.jpg`：Saad Akhtar，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)；[文件页](https://commons.wikimedia.org/wiki/File:Greatwall-SA2.jpg)。墙顶的通道、台阶与两侧墙体。
- `jinshanling-tower-close.jpg`：Saad Akhtar，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)；[文件页](https://commons.wikimedia.org/wiki/File:Ruins_of_the_guard_tower.jpg)。不完整城楼内部的空间与拱形洞口。
- `han-wall-detail.jpg`：N509FZ，[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)；[文件页](https://commons.wikimedia.org/wiki/File:Site_of_Han_Dynasty_Great_Wall_at_Yumenguan_(20230917105206).jpg)。汉代土筑墙体的分层纹理与远处高台遗迹。
- `yumen-pass-close.jpg`：Popolon，[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)；[文件页](https://commons.wikimedia.org/wiki/File:Dunhuang.yumenguan.jpg)。小方盘城的土墙转角和门洞。
- `jinshanling-tower.jpg`：Jakub Hałun，[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)；[文件页](https://commons.wikimedia.org/wiki/File:20090529_Great_Wall_8159.jpg)。沿山脊相连的墙体和城楼；候选取景与全景重复，本轮未进入儿童相册。
- `dunhuang-han-wall.jpg`：Kunwang1990，[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)；[文件页](https://commons.wikimedia.org/wiki/File:%E6%95%A6%E7%85%8C%E6%B1%89%E9%95%BF%E5%9F%8E%E9%81%97%E5%9D%80.JPG)。现代标识石占据前景，本轮改选墙体更清楚的照片。

玉门关、小方盘城与敦煌土墙明确标为汉代遗址；明代金山岭/司马台照片不作秦墙复原。完整选片与使用位置见docs/qa/2026-09-15-wall-album/。


## 2026-09-18 五铢钱章

- `han-wuzhu-stone-mould.jpg`：上海博物馆西汉五铢石范参观照片，摄影 **猫猫的日记本**，2014-07-13，CC BY-SA 4.0。原文件页 <https://commons.wikimedia.org/wiki/File:Coin_Mould_in_Shanghai_Museum_03_2014-07.JPG>；许可 <https://creativecommons.org/licenses/by-sa/4.0/>。保留原图；运行图仅等比例缩小和格式压缩。器物身份根据照片内馆方展签，不冒称上林三官遗物或博物馆官方摄影。页面快照见 `source-pages/han-wuzhu-stone-mould.html`。
- `han-mint-workshop-v1.png`：内置 image_gen 生成的现代教学故事插画；沿用项目黄衣小伙伴与青衣工匠。不是历史照片或工坊复原，天平是简化称量学具。提示词与生成过程记在 `docs/qa/2026-09-18-han-wuzhu/`。旧集市与团聚插画原件继续保留。


## 2026-09-18 汉朝其余两章

`silk-post-messages-v2.png` 与 `han-paper-materials-v2.png` 使用内置 image_gen 生成；同项目已有插画仅作风格与角色参考，旧图保留。新图分别用于后来的汉代驿站文书/补给、蔡伦改进所涉原料观察。现代教学插画，不是张骞、蔡伦肖像或考古现场复原；不为木简生成可当史料引用的文本。两份实际提示词见 `docs/qa/2026-09-18-han-silk-paper/` 下对应 `-prompt.txt`。未增加外部照片；沿用四张已登记清权照片，出处链接另补当前权威说明。

`han-paper-materials-v3.png`为v2的局部编辑：只把圆棍状物改为薄平简片编成的简册，保留角色、树皮、渔网、旧布、纸页与背景。内置 image_gen；实际提示词为 `han-paper-materials-v3-prompt.txt`。v2标为editor-only但不删除，儿童页面统一使用v3。
