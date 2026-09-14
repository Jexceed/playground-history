# 儿童首页自制主视觉与图标

生成与核验日期：2026-08-11—12。以下素材均由“小小历史旅行团”项目组使用 OpenAI imagegen 辅助生成，按 OpenAI 使用条款持有输出使用权。

| 本地母版 | 页面衍生文件 | 用途 | 必须同时显示的边界 |
| --- | --- | --- | --- |
| `history-tour-river-v2-source.png` | `public/images/history-tour-river-v2.webp` | 儿童首页旅行团主视觉 | 全部是旅行地图插画，不是历史现场、精确地图或文物复原；人物不是历史人物。 |
| `history-tour-social-card-v2-source.png` | `public/og.png` | 首页社交分享图 | 与首页相同的旅行地图插画边界；图中文字是产品标题与邀请语，不是史料文字。 |
| `history-clue-icons-v2-source.png` | `public/images/history-clue-{fire,camel,moon,ship}-v2.webp` | 首页四个旅行线索徽章 | 图标只帮助辨认主题，不能用于判断文物尺寸与原貌、诗文内容、航船结构或桥梁年代。 |
| `history-stations-ancient-source.png` | `public/images/history-stations/{early,states,change,united,meeting,tang}.webp` | 中国古代前六站徽章 | 多个时代线索的儿童组合图，不是文物、城市或历史现场的精确复原。 |
| `history-stations-split-dynasties-v1-source.png` | `public/images/history-stations/{han,sui,five-dynasties,liao-xia-jin,yuan,qing}.webp` | 汉至清拆分时期补充徽章 | 只作时期入口；不是国旗、精确地图、文物原貌或事件现场，辽夏金图也不表示三个政权始终同时不变。 |
| `history-stations-late-source.png` | `public/images/history-stations/{cities,later,lateqing,republic,modernlife,newroad}.webp` | 辽宋至革命新道路六站徽章 | 图中船、信、火车、报纸和书本只提示主题；空白纸页不含史料原文。 |
| `history-stations-modern-source.png` | `public/images/history-stations/{resistance,liberation,founding,exploration,reform,newera}.webp` | 抗战至新时代六站徽章 | 战争时期不画武器和战斗；城门、列车、蓝图、市场与卫星都是概括提示。 |
| `history-world-boards-source.png` | `public/images/history-stations/{world-ancient,world-modern,world-contemporary,cross-disciplinary}.webp` | 世界史与跨学科四板块徽章 | 每枚图标组合多个时空提示物，只区分板块，不表示它们曾在同一现场出现。 |
| `quest-five-step-badges-v1-source.png` | `public/images/quest-steps/{time,beginning,journey,change,takeaway}.webp` | 99章五步任务阶段徽章 | 五枚图只提示时间、发现、旅程、变化和回答的操作阶段；不是历史地图、文物复原或历史人物画像。 |

视觉线索分别以 `NMC-PEKING-MAN-ASH`、`SHAANXI-SANCAI-CAMEL-509`、`CCDI-LIBAI-JINGYESI` 与 `UNESCO-SONG-YUAN-QUANZHOU` 核对主题边界；完整登记见 `content/assets/homepage-ui-assets.json`。


## 2026-09-14角色统一版

`history-tour-river-v3-source.png` 与 `history-tour-social-card-v3-source.png`：使用内置imagegen对原图做局部编辑，统一绿衣小伙伴形象；保留其绿色衣服、紫色背包，以及其他两位伙伴、长河风景和文字。运行图为 `public/images/history-tour-river-v3.webp`、`public/images/history-tour-social-v3.png` 与 `public/og.png`。原v2源图留档。所有图均为项目自制故事插画，不是历史现场。完整提示词见 `docs/qa/2026-09-14-qin-evidence-cast/prompts/`。


## 2026-09-14两个男孩的辨识度修订

`history-tour-river-v4-source.png`（971×1620）与 `history-tour-social-card-v4-source.png`（1731×909）为内置imagegen在旧版上局部修改的角色区分版本。绿衣男孩增加圆框眼镜与齐刘海，黄衣男孩保持原翘短发。主页源图比旧图高1像素，不另行裁切。运行图为v4 WebP与1200×630分享PNG；旧版留档。 完整提示词见 `docs/qa/2026-09-14-character-distinction/prompts/`。
