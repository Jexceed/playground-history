# 2026-10-23 国外两章内容与素材检查

本记录范围仅为古埃及金字塔、古罗马阿庇亚大道两章的内容、来源与图片制作。用户本轮明确要求展开国外章节，因而这两章可以从原隐藏研究进入当前玩法；不自动开放其余国外章节。本文件不记录另一个聊天正在深化的中国旧章，也不代表全库史实终审、真实儿童测试或内容冻结。

这里只记录已完成的源稿与静态检查。没有在本记录中声称完成macOS App安装、实际页面、声音播放、断网运行或重开记录验收；这些由本轮集成与App检查记录分别承担。

## 章节范围与正式入口

| 既有chapterId | 当前儿童标题 | 核心关系 | 五步安排 |
| --- | --- | --- | --- |
| `world-ancient-01-02-river-civilizations` | 金字塔为什么要建 | 王室陵墓建筑群的用途，与石材加工、运输、供给等劳动相连。 | 时间定位 → 听完整用途故事 → 真照片双轮找石块和现代游客 → 选择加工石材 → 向新来小伙伴说明陵墓用途。 |
| `world-ancient-01-05-rome-empire` | 罗马道路把哪里连起来 | 最初军事扩张与统治用途，和后来农业、城镇、日常运输相连。 | 时间定位 → 区分最初军事用途 → 真照片双轮找石块和接缝 → 模型道路维修应用 → 把备好的粮食运到另一城镇。 |

两章沿用原ID与统一`time / beginning / journey / change / takeaway`机制，不建立第二套完成记录。当前内容以[正式focused源稿](../../../content/focused-quests.json)、[学习地图](../../../content/learning-map.json)、[家长文化说明](../../../content/textbook-connections.json)为准。

`work/poetry-world-world.mjs`是本轮制作时供根代理合并的片段，不是以后覆盖正式内容的生成器。根代理合并后已将家长`companions[].note`压到46字以内，并为罗马家长年代说明加入`MET-ROMAN-EMPIRE`；这些正式精修没有反向重跑旧片段。本次检查读到的两章家长说明分别最长38字和41字。

## 原研究保留

- [埃及与两河源稿](../../../content/chapters/world-ancient-river-civilizations.md)保留原来的大河环境、两河城市、文字与法律等事实和长稿，新增当前App五步对应表、阅读方法和吉萨劳动证据。当前儿童只聚焦古埃及金字塔，没有把两河内容改写为埃及史或悄然删除。
- [罗马源稿](../../../content/chapters/world-ancient-rome.md)保留共和国、帝国、公民权、奴役与网络等原研究，新增阿庇亚大道五步对应表和阅读方法。没有把一条道路说成罗马历史的全部。
- 原目录中的六屏、七段语音、三个互动描述的是旧编辑长稿；本轮没有为了五步玩法修改旧长稿目标数。实际儿童界面取正式五步内容。
- 两个世界故事分别标明地点和年代。金字塔约公元前26世纪，阿庇亚大道公元前312年起；它们不在同一年，也不是一个文明替代另一个文明的单线顺序。

## 史实依据与核对范围

以下遗产、博物馆、大学及考古项目材料用于支持历史解释；开放文件页仅用于照片作者、日期和许可元数据。2026-10-23已在线读取前五项；罗马帝国年代参考由根代理在集成时补入家长来源，本记录读到正式登记，不将其另称为本分工重新进行的全文复核。

| 来源ID与链接 | 本章采用内容 | 使用边界 |
| --- | --- | --- |
| `UNESCO-MEMPHIS-PYRAMIDS`：[孟菲斯与金字塔遗产记录](https://whc.unesco.org/en/list/86/) | 古埃及王室墓地、金字塔及周边墓葬建筑。 | 不由遗产名录推导全部施工过程或具体劳动待遇。 |
| `MET-EGYPT-OLD-KINGDOM`：[The Met古王国概述](https://www.metmuseum.org/essays/egypt-in-the-old-kingdom-ca-2649-2150-b-c) | 胡夫及第四王朝年代，金字塔、神庙与堤道的建筑群关系。 | 儿童用约公元前26世纪定位，不把建筑群模型的尺寸、位置当作遗址测绘。 |
| `HARVARD-GIZA-SCHOOL-FAQ`：[Harvard Digital Giza学校问答](https://giza.fas.harvard.edu/faq/) | 采用“What is a pyramid”“Pyramid Complexes”“Who built the pyramids”三节，支持王室陵墓、附属建筑和石材劳动。 | 不采用人数估算，不把某种搬石方案当成唯一已证实过程。 |
| `AERA-GIZA-PYRAMID-SETTLEMENT`：[AERA吉萨聚落研究](https://aeraweb.org/projects/lost-city/) | 正文第1—9段中的工匠、管理、工作坊、工具与食物供给。 | 聚落主要对应哈夫拉、孟卡拉工程；胡夫联系仍为“可能”，不改成已确定的胡夫专属工人城。 |
| `UNESCO-VIA-APPIA`：[阿庇亚道遗产记录](https://whc.unesco.org/en/list/1708/) | 公元前312年开始建设，此后数百年发展；最初军事扩张目的及后来城市、农业、贸易联系。 | 不把2014年照片中单段铺面代表全线、各时代和所有罗马道路。 |
| `MET-ROMAN-EMPIRE`：[The Met罗马帝国概述](https://www.metmuseum.org/essays/the-roman-empire-27-b-c-393-a-d) | 家长层区别前312年开始修路和前27年进入罗马帝国时期。 | 儿童主线称“古罗马时期”，不将前312年说成帝国时期。 |

## 真照片身份、授权与落位

| 素材ID | 项目原图与原登记 | 摄影身份与许可 | 当前用途 |
| --- | --- | --- | --- |
| `great-pyramid-giza-2010-photo` | [项目原图](../../../reference-assets/world-ancient-river-civilizations/great-pyramid-giza-2010.jpg)；[原素材登记](../../../content/assets/world-ancient-river-civilizations-assets.json) | Kallerna，2010年；[Commons文件页](https://commons.wikimedia.org/wiki/File:Great_Pyramid_of_Giza.jpg)，[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)。 | 历史站真实封面、首步年代依据、第三步石块/游客找图与独立材料入口。 |
| `via-appia-terracina-2014-photo` | [项目原图](../../../reference-assets/world-ancient-rome/via-appia-terracina-2014.jpg)；[原素材登记](../../../content/assets/world-ancient-rome-assets.json) | Carole Raddato，2014-06-30；[Commons文件页](https://commons.wikimedia.org/wiki/File:Forum_Aemilianum,_stretch_of_the_Via_Appia,_Tarracina_(Anxur),_Terracina,_Italy_(15224581792).jpg)，[CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)。 | 历史站真实封面、首步年代依据、第三步铺石/接缝找图与独立材料入口。 |

两张照片的作者、日期、许可于2026-10-23在线复核。阿庇亚照片的网页工具读取失败后，使用同一公开Commons文件页HTML确认作者、日期和许可字段；没有换用搜索摘要推定授权。继续保留原照片署名与许可，不登记为项目自制。

金字塔项目原图为2200×1375，原Commons文件为2960×1850；道路项目原图为2200×1459，原Commons文件为4829×3203。现有运行缩图曾分别读到900×562和900×597；这只是本次观察时的文件大小，不替代最终打包与App加载验证。

金字塔照片中央前景的热点对应骑马游客，已查看2200×1375源图确认。左远景另有骆驼，未纳入该游客热点，也未作为题目要求辨认的动物。儿童任务是区分现代游客与古老建筑，不做动物物种考核。

## 新插画、实际提示词与保存路径

工具为内置`image_gen`，四张均一次生成，未进行二次改绘。制作前查看了既有兵马俑博物馆故事图和[角色约定](../../CHARACTERS.md)，以明确现代三位小伙伴的识别特征。新图为项目自制教学插画，不能当作文物照片、历史现场或特定博物馆展陈。

四次实际传入工具的完整提示词逐字保存在[PROMPTS.md](../../../reference-assets/poetry-world-world/PROMPTS.md)，以素材ID分节；[ATTRIBUTION.md](../../../reference-assets/poetry-world-world/ATTRIBUTION.md)记录项目用途、图像身份与复用真照片的署名。正式元数据位于[专用素材登记](../../../content/assets/poetry-world-world-assets.json)。

| 素材ID与项目保存文件 | 实测原始尺寸 | 实际提示词对应节与画面 |
| --- | --- | --- |
| `egypt-pyramid-museum-v1`：[PNG](../../../reference-assets/poetry-world-world/egypt-pyramid-museum-v1.png) | 1536×1024 | 同名提示词节；三位现代儿童、讲解员、金字塔及附属建筑模型、独立闭合石棺教具。 |
| `egypt-pyramid-choices-v1`：[PNG](../../../reference-assets/poetry-world-world/egypt-pyramid-choices-v1.png) | 1254×1254 | 同名提示词节；四格分别为陵墓群教学展陈、家庭居住、石材加工、现代积木。 |
| `rome-road-museum-v1`：[PNG](../../../reference-assets/poetry-world-world/rome-road-museum-v1.png) | 1536×1024 | 同名提示词节；三位儿童观察连接农田、桥、城镇及运输活动的道路模型。 |
| `rome-road-choices-v1`：[PNG](../../../reference-assets/poetry-world-world/rome-road-choices-v1.png) | 1254×1254 | 同名提示词节；四格分别为军队移动、运粮、修路、仓储。 |

生成工具保留的原输出目录为`/Users/chiang/.codex/generated_images/01a168fc-17b9-79d0-9dc0-d5cfee69ebb5/`。对应原文件依次为：

1. `exec-fb0218b6-1770-4bbf-ba81-7b38044a803c.png`
2. `exec-d6aba255-dd1a-4df2-99ad-95d11b62d260.png`
3. `exec-41e06388-0af8-4eb4-9801-f3721ce42b5a.png`
4. `exec-0af95cd9-f27b-49e7-951b-ca3382e167c1.png`

项目使用上表中的本仓库副本，不依赖工具默认目录。已查看四张原图：三位儿童的发型、眼镜、花发夹可分辨；人物与操作物完整，四格各有具体人物和动作。此项是原图人工观察，不是App内缩图或选中大图验收。

四格取景共用同一登记：`sourceWidth=sourceHeight=1254`，每格`609×609`，左上分别为`(8,8)`、`(637,8)`、`(8,637)`、`(637,637)`，避开白色格缝。选项与选中主图显式使用同一crop。原始有效局部为609×609，不能因任何后续放大宣称增加细节。

主图`runtimeMaxEdge=1536`，四格`runtimeMaxEdge=1254`，目标为保留原始像素。QA撰写时没有读到两张新四格的运行JPG，因此本文件不记运行图尺寸检查通过；实际生成文件、缩图清晰度与App落位由集成记录核验。

## 必须保留的内容边界

1. 金字塔第二步实际朗读解释“陵墓是安葬去世者的地方”，并把神庙活动说成古人敬神、纪念去世的国王；不只让孩子听到抽象词语。该故事现为64字。宗教观念作为历史信仰介绍，不作为孩子必须模仿的活动。
2. 金字塔故事图中的展厅墙上图也属于生成插画，不是额外真实材料。真实照片始终通过独立证据入口及第三步使用。闭合石棺只是教学教具，不宣称为胡夫原棺；没有遗体、木乃伊或恐怖画面。
3. 金字塔模型的建筑位置、神庙外形、工匠服饰与工具不能证明古代精确结构。儿童学习用途与劳动配合，不演示唯一坡道、搬石秘方或确定劳动人数。
4. 罗马道路始建于共和国时期，前27年才进入帝国时期。士兵图包含后来的常见军装意象，已明确标为“罗马时期用路的教学想象，不是前312年施工或行军实景复原”，实际入场声音没有指认其为开工当年的军队。
5. 罗马军事扩张和统治目的进入开场、第二步与结束，不仅收在家长层；不模拟搏杀，不按征服、阵营或人群高低给分。后来的运输用途并不抹掉军事历史。
6. 维修题给出“模型里路面坏了”的前提，是学习应用，不冒称某次古代维修记录。储粮和运输都是合理工作；题目只问当前目标需要哪项动作，不把仓储说成错误生活方式。

## 已完成的静态检查

本次只读检查正式合并后的两个chapterId，没有运行会改写共享运行包或语音的命令。

| 项目 | 结果与可证明范围 |
| --- | --- |
| 五步与选项结构 | 两章各5步；普通题两选项且一项正确，阅读与找图按既有结构登记。 |
| 儿童文字长度 | 金字塔story最长64字、question最长16字；罗马story最长57字、question最长17字，均在90/28限制内。找图每轮问题、反馈和重试均不超过32字。 |
| 连续故事摘要 | 金字塔beat最长29字、罗马最长27字；加入生成器叙事前缀后仍低于64字。 |
| 实际入场语音源字段 | 普通`pick/timeline`的narration显式以question结尾，避免只播放故事而漏问问题；`scene-find/look-listen`分别保留完整故事与共享后续读问机制。只检查绑定源字段，未试听生成音频。 |
| 来源与素材 | 两章步骤引用的来源ID均存在；4个新资产原文件、提示词与署名文件存在。首步/找图的inspection照片均在各章evidenceAssetIds中。 |
| 裁取与热点 | 4个609方形crop均未越界；真照片热点按同一未裁取原图归一化坐标登记。已人工看照片所指内容，未将其记为App命中测试。 |
| 源图像素 | 使用`sips -g pixelWidth -g pixelHeight`确认两张主图1536×1024、两张四格1254×1254。新四格运行JPG在该次读取时未出现，未宣称其尺寸通过。 |
| 源稿空白检查 | 对两份世界章节Markdown运行`git diff --check -- <两份文件>`通过；这是指定文件检查，不等于整个并行工作区检查。 |
| 家长集成精修 | 已只读确认正式companions说明不超过46字，罗马家长sourceIds含UNESCO-VIA-APPIA和MET-ROMAN-EMPIRE。 |

未由本分工完成：共享内容打包、全库结构审计、全套工程检查、声音增量合成及人耳试听、真实App的当前窗口测量、答题重试与主按钮可见性、断网资源和退出重开记录。相应结论必须依据根代理的实际执行记录，不能由本文件的静态通过推定。
