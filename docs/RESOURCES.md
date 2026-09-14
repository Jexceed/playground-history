# 资源索引与维护规则

## 2026-09-14 · 角色图区分版

主页/分享图改用v4，秦朝相聚改用v3，绿衣男孩的圆框眼镜和齐刘海与黄衣男孩区分。旧图留档，素材登记971项。角色持续约定见[角色识别](CHARACTERS.md)。

## 2026-09-14更新

当前来源978条、素材969项，角色图v3（主页/分享）与v2（秦朝相聚）已登记，旧版仅留档。秦朝开场真实铁权身份以河南博物院直接馆藏资料核对，图片许可仍按Zcm11的CC BY-SA 3.0登记。语音3010条，当前使用已有edge-tts增量脚本；F5-TTS是本机另有的方案，区别和统一更新入口见[语音流程](VOICE-WORKFLOW.md)。

## 2026-09-13本轮资源补充

新增505个去重自制SVG学习图，由 `content/focused-quests.json` 与 `scripts/lib/study-visuals.mjs` 生成。正式登记在 `content/assets/focused-quests-assets.json`，本地来源和许可说明在 `reference-assets/focused-quests/ATTRIBUTION.md`；不虚构外部来源URL，不另行声称公共CC授权。界面副本在 `public/content/study-scenes/`。图形不伪造文物原稿、肖像或精确地图。

完整103章运行包与34章展示包分别是 `public/content/manifest.json`、`public/content/preview-manifest.json`。新增来源3条，并补换太和殿正文链接、指南针正文域名。以下旧资源数量为此前里程碑记录，以新生成清单为准。


更新日期：2026-09-12

## 一、课程与叙事依据

- `content/product-map.json`：七个课程板块和总叙事策略。
- `content/timeline.json`：中国古代史八段主时间线。
- `content/catalog*.json`：103章顺序、核心问题、前后连接和制作状态。
- `content/chapters/*.md`：事实卡、儿童页面、语音稿、互动和图片边界。
- `content/REPRESENTATIVE-CHAPTER-REVIEW.md`：12个代表章第一轮人工复核。
- `content/FULL-LIBRARY-EDITORIAL-REVIEW.md`：91章前七项编辑复核、低龄入口与素材显示检查。
- `content/REVIEW-CHECKLIST.md`：每章八项最终确认门槛。
- `content/child-entry-points.json`：103章儿童标题、问题、回答、人物、地点、实物、文化连接与展示边界。
- `content/quest-story-paths.json`：103章309条专属“先—接着—最后”连续拍点；运行包必须逐条一致，不允许截断省略号。
- `content/child-language-glossary.json`：80个抽象词的儿童口语解释。

中国史正文优先使用教育部、人民教育出版社、中国国家博物馆、故宫博物院、中国社会科学院考古研究所、中国科学院自然科学史研究所、国家档案局和其他中国官方机构资料。世界史使用相应国家的博物馆、国家图书馆、档案馆、大学馆藏及联合国教科文组织资料。

## 二、事实来源

- 机器登记：`content/sources.json`
- 人工阅读索引：`content/references.md`
- 链接核验记录：`content/SOURCE-LINK-AUDIT.md`
- 当前数量：973条
- 其中新增8条人民教育出版社小学语文教材目录、教材说明与经典教育资源，只用于证明“课本里的老朋友”熟悉度及改编边界，不替代逐章历史事实来源。

每条来源必须记录机构、网址、事实用途和图片用途。链接可打开不等于事实支持关系正确；章节事实仍需逐句人工核对。

## 三、素材登记

- 机器登记：`content/assets/*.json`
- 当前素材：459项
- 已清权并登记本地路径：457项
- 未清权、仅供研究参考：2项
- 已清权但明确只供家长或编辑核对：20项

已清权不等于直接给儿童看。刺激画面、头骨模型、英文研究图、含个人信息的票证和只适合家长解释的材料另标为 `editor-only`；生成器和门禁会把它们排除在儿童任务之外。

素材登记是正式依据，至少包含题名、年代或时期、来源页、许可、用途、证据边界和本地路径。复制品、现代复原、遗址今景、艺术表现和路线示意必须明确标注。

## 四、本机研究原图缓存

目录：`reference-assets/`

当前缓存：

- 454个被素材登记直接引用的本地文件；
- 59份 `ATTRIBUTION.md`；
- 原文件合计约750MiB。

少数素材可共用同一个原文件；另有PDF、替代格式或辅助研究图保留在缓存中，不进入发布素材计数。严格校验目前为454/454，无缺失路径。

媒体原文件保留在本机，不进入普通Git；59份署名说明和本目录说明进入Git。这样避免仓库膨胀，同时保留来源、许可和证据边界记录。

严格核对本机缓存：

```text
npm run content:validate:assets
```

未来若要跨机器同步全部原图，应采用Git LFS或独立对象存储，并为每个对象保留校验值；不要直接提交到普通Git历史。

## 五、运行内容包

- `public/content/manifest.json`：运行总目录。
- `public/content/chapters/`：103份章节JSON。
- `public/content/thumbnails/`：103张本地审核缩略图。
- `public/content/step-images/`：240张当前任务实际引用、按素材ID去重的步骤图；103章每一步都通过 `assetId` 明确引用，生成时自动移除不再使用的旧步骤图。唯一合适证据可在同章重复，不为数量换入弱相关图片。
- `content/runtime/content-manifest.json`：页面编译时读取的同版总目录。
- `public/images/history-stations/`：23枚中国历史站与3枚世界板块及1枚跨学科透明旅行徽章；母版和边界说明登记在 `content/assets/homepage-ui-assets.json` 与 `reference-assets/homepage-ui/ATTRIBUTION.md`。
- `public/images/quest-steps/`：时间、起点、旅程、变化和回答5枚透明任务徽章；同样只作儿童导航，不是史料、地图或历史现场复原。

这些是脚本生成文件，不手工修改。修改章节、来源或素材登记后运行 `npm run content:pack`。

## 六、语音资源

- `content/voice-interface-lines.json`：试玩界面的音色参数和公共基础声音；其余五步任务声音由内容包确定性生成。
- `public/audio/voice-lines.json`：103章试玩页的2210条去重声音文字与稳定ID，由内容打包脚本生成。
- `public/audio/voice/`：2210段本地MP3及完整清单，覆盖章介绍、秦至清34段课本连接介绍、309条逐章故事拍点、515段逐步图片说明、提问、选项、反馈与结束回答。
- `content/voice-auditions.json`：A/B音色试听配置。
- `content/voice-pronunciations.json`：155项人名、地名和多音字，以及7条年代读法规则；当前为待校听基线。
- `public/audio/auditions/`：2种方案×3段材料，共6段试听。
- 701篇编辑长讲稿的正式扩展配音：尚未生成；当前结构为1126段短稿。它与试玩界面声音分开管理。

正式批量生成必须等文字和音色冻结。合成失败不得覆盖已有MP3。

## 七、资源增加流程

1. 先把事实来源登记到 `content/sources.json`。
2. 把素材元数据登记到相应 `content/assets/*.json`。
3. 将研究原文件放进对应 `reference-assets/<主题>/`，更新该目录的 `ATTRIBUTION.md`。
4. 运行严格素材校验，确认本地路径、许可和来源齐全。
5. 只有 `clearance` 已确认的素材才能生成运行缩略图或进入儿童页面。
6. 更新本资源索引中的数量，并在里程碑更新 `docs/CHANGELOG.md`。
