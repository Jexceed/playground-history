# 资源索引与维护规则

更新日期：2026-08-08

## 一、课程与叙事依据

- `content/product-map.json`：七个课程板块和总叙事策略。
- `content/timeline.json`：中国古代史八段主时间线。
- `content/catalog*.json`：91章顺序、核心问题、前后连接和制作状态。
- `content/chapters/*.md`：事实卡、儿童页面、语音稿、互动和图片边界。
- `content/REPRESENTATIVE-CHAPTER-REVIEW.md`：12个代表章第一轮人工复核。
- `content/REVIEW-CHECKLIST.md`：每章八项最终确认门槛。

中国史正文优先使用教育部、人民教育出版社、中国国家博物馆、故宫博物院、中国社会科学院考古研究所、中国科学院自然科学史研究所、国家档案局和其他中国官方机构资料。世界史使用相应国家的博物馆、国家图书馆、档案馆、大学馆藏及联合国教科文组织资料。

## 二、事实来源

- 机器登记：`content/sources.json`
- 人工阅读索引：`content/references.md`
- 链接核验记录：`content/SOURCE-LINK-AUDIT.md`
- 当前数量：951条

每条来源必须记录机构、网址、事实用途和图片用途。链接可打开不等于事实支持关系正确；章节事实仍需逐句人工核对。

## 三、素材登记

- 机器登记：`content/assets/*.json`
- 当前素材：422项
- 可发布、已登记许可与本地路径：420项
- 仅供编辑参考、不得进入发布层：2项

素材登记是正式依据，至少包含题名、年代或时期、来源页、许可、用途、证据边界和本地路径。复制品、现代复原、遗址今景、艺术表现和路线示意必须明确标注。

## 四、本机研究原图缓存

目录：`reference-assets/`

当前缓存：

- 428个图片、PDF、SVG或视频原文件；
- 58份 `ATTRIBUTION.md`；
- 原文件合计约708.5MiB。

其中417个唯一文件路径被422项素材登记直接引用（少数素材共用同一个原文件）；另有11个PDF、替代格式或辅助研究图保留在缓存中，不进入发布素材计数。严格校验目前为417/417，无缺失路径。

媒体原文件保留在本机，不进入普通Git；58份署名说明和本目录说明进入Git。这样避免仓库膨胀，同时保留来源、许可和证据边界记录。

严格核对本机缓存：

```text
npm run content:validate:assets
```

未来若要跨机器同步全部原图，应采用Git LFS或独立对象存储，并为每个对象保留校验值；不要直接提交到普通Git历史。

## 五、运行内容包

- `public/content/manifest.json`：运行总目录。
- `public/content/chapters/`：91份章节JSON。
- `public/content/thumbnails/`：91张本地审核缩略图。
- `content/runtime/content-manifest.json`：页面编译时读取的同版总目录。

这些是脚本生成文件，不手工修改。修改章节、来源或素材登记后运行 `npm run content:pack`。

## 六、语音资源

- `public/audio/voice-lines.json`：当前隋唐试玩关卡的12条旁白与反馈文字。
- `public/audio/voice/`：当前12段可播放本地MP3及清单。
- `content/voice-auditions.json`：A/B音色试听配置。
- `public/audio/auditions/`：2种方案×3段材料，共6段试听。
- 91章正式语音：尚未生成；当前结构为1092段短音频。

正式批量生成必须等文字和音色冻结。合成失败不得覆盖已有MP3。

## 七、资源增加流程

1. 先把事实来源登记到 `content/sources.json`。
2. 把素材元数据登记到相应 `content/assets/*.json`。
3. 将研究原文件放进对应 `reference-assets/<主题>/`，更新该目录的 `ATTRIBUTION.md`。
4. 运行严格素材校验，确认本地路径、许可和来源齐全。
5. 只有 `clearance` 已确认的素材才能生成运行缩略图或进入儿童页面。
6. 更新本资源索引中的数量，并在里程碑更新 `docs/CHANGELOG.md`。
