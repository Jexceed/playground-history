# 学具教学插画

2026-10-11，使用内置image_gen，供儿童历史游戏的功能学具使用。不是文物照片，不替代史料。原图保留，透明PNG运行副本只等比缩放。

## 琉璃小兽学具 · 教学新画
- 文件：reference-assets/history-lab-art/roof-beast-glazed-v1.png
- 作者：小小历史旅行团项目组（image_gen辅助绘制）；参考照片作者：秋水平湖
- 参考照片：[太和殿屋脊十只脊兽现状照片](https://commons.wikimedia.org/wiki/File:太和殿的脊獸.JPG)
- 参考许可：[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- 教学新画沿用参考素材的署名及适用共享条件，生成工具输出使用条款：https://openai.com/policies/terms-of-use/
- 提示词：docs/qa/2026-10-11-quality-review/art-prompts.json

## 长信宫灯功能学具 · 教学新画
- 文件：reference-assets/history-lab-art/palace-lamp-study-v1.png
- 作者：小小历史旅行团项目组（image_gen辅助绘制）；参考照片作者：Windmemories
- 参考照片：[西汉长信宫灯 · 文物照片](https://commons.wikimedia.org/wiki/File:20250118_Changxin_Palace_Lamp_01.jpg)
- 参考许可：[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
- 教学新画沿用参考素材的署名及适用共享条件，生成工具输出使用条款：https://openai.com/policies/terms-of-use/
- 提示词：docs/qa/2026-10-11-quality-review/art-prompts.json

## rammed-earth-section-v1

2026-10-11，使用内置 image_gen 独立生成夯土材质教学插画；原图完整保留。参考了项目已有故事画的用色，不复原某一段长城。不得作为历史照片或建筑施工证据。实际提示词：`docs/qa/2026-10-11-game-art-review/art-prompt.txt`。原图 SHA-256 见本轮QA。

## qin-wall-mountain-scene-v2 / qin-wall-mountain-gap-v2

2026-10-11，内置image_gen生成完整山地城墙教学场景，再以同一图编辑中央缺口。两张均为项目自制插画，非历史现场或具体遗址复原。使用原图记录和局部代码裁取，不改真实文物/遗址照片。提示词分别位于 `docs/qa/2026-10-11-wall-scene-redraw/scene-prompt.txt` 与 `gap-prompt.txt`。此前 `rammed-earth-section-v1` 因木板式表现被用户否定，原图与提示词保留，退出当前章节资源关联。

## 赵州桥过水学具 · 2026-10-16

- `zhaozhou-bridge-study-v2.png`：项目自制教学新画，内置 image_gen 生成，透明背景与五个开口保留。
- 先观察已登记的赵州桥今日照片 `zhaozhou-bridge-now`，事实依据为中国国家博物馆 [安济桥石栏板](https://www.chnmuseum.cn/zp/zpml/kgfjp/202111/t20211112_252139.shtml)；照片未作为本次生成输入。
- 现代教学模型，不是历史现场、文物照片或精确测绘。水位与提示由代码计算，不模拟水动力或承载力。
- 实际提示词：`docs/qa/2026-10-16-bridge-redraw/art-prompt.txt`。原始文件保留，运行副本按现有生成器导出；旧图由提交 `478d652` 的代码和本轮 App 改前截图留档。
