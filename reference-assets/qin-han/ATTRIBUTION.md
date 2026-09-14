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
