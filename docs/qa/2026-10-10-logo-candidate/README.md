# App Logo 构图候选 · 2026-10-10

后续：用户已认可本候选构图并授权替换，要求加强底板表现；白底定稿、实际安装与验收见[白底Logo记录](../2026-10-10-logo-white/README.md)。以下保留首次预览时的状态。

状态：仅生成预览，待用户确认；没有替换应用图标、品牌资源或已安装 App。

用户认为现有 Logo 内容合适，但排版仍偏场景插画，要求先生成新图再决定是否替换。

## 构图目标与不变量

保留三位固定小伙伴、共同展开的旅行地图、时间河与长城线索。黄衣男孩保留翘短发且无眼镜；绿衣男孩保留齐刘海与圆框透明眼镜；女孩保留高马尾、橙色花发夹。它们属于自制品牌意象，不是特定朝代或地点的史料复原。

候选去掉金色厚边与远山树林，将三人和地图集中为一个主体，采用浅薄荷底色和更清楚的四周留白。时间河主要保留在地图上，长城作为次要历史线索。

## 文件与生成方式

使用内置 image_gen，未调用 API-key CLI。原始输入为 `reference-assets/branding/history-trip-logo-v2.png`。

- 初稿提示词：[prompt.txt](prompt.txt)。
- 构图精修提示词：[refine-prompt.txt](refine-prompt.txt)。
- 外缘清理提示词：[cleanup-prompt.txt](cleanup-prompt.txt)。
- 初稿：`reference-assets/branding/history-trip-logo-v3-candidate-draft.png`。
- 清理前稿：`reference-assets/branding/history-trip-logo-v3-candidate-precleanup.png`。
- 当前候选：`reference-assets/branding/history-trip-logo-v3-candidate.png`，1254 × 1254，带 alpha。
- 当前候选 SHA-256：`2652d297c26699a70fa8d97aecd4dc89010771afc7552a06bc6ddcd6618a3a7e`。
- 32 / 64 / 128 / 512 像素缩图由系统 sips 导出；不通过代码重画或编辑人物。

原始工具输出依次为：
`/Users/chiang/.codex/generated_images/01a124df-8e91-7dd3-a622-45563c721050/exec-74133111-0154-4f21-b848-569d6768ac36.png`
`/Users/chiang/.codex/generated_images/01a124df-8e91-7dd3-a622-45563c721050/exec-eb83c991-f577-4ad5-8c22-028b13fd142b.png`
`/Users/chiang/.codex/generated_images/01a124df-8e91-7dd3-a622-45563c721050/exec-ba403ff3-5b8b-4547-8a52-29b946093b33.png`

## 图像检查与未完成项

已查看大图及 32 / 64 / 128 像素缩图。128 像素可辨三人、眼镜、地图、蓝河和城楼；64 像素可辨三人、地图与蓝河，城楼主要保留金色轮廓；32 像素主要依赖人物配色和地图整体轮廓。

生成工具清理后，外缘仍可见少量浅色残点；不能将它标为可直接发布的最终图标。此轮供用户选择构图方向，正式替换前仍需精修透明边缘并复查。

![当前构图候选](icon-512.png)

## 当前产品保护与验收边界

在操作前后核对，下列文件 SHA-256 完全相同：
- 原 v2：`4e3a869797b447bf88590378e2d5dc059319dc205544f5fee60dc9f6a4737aa9`。
- `public/images/brand/history-trip-logo.png` 与 `src-tauri/icons/icon.png`：`a6acfdbdbc23a14bea86be8cfae90d709046dc1b331946fd5d1c807d3046a8b9`。
- `src-tauri/icons/icon.icns`：`542f708fd4e3e40259f7c3696b5543ebf3d2643610276620e2755151f8e32095`。

没有运行素材生成器、内容打包、语音更新或 Mac 构建安装，没有改产品素材登记、内容版本和进度。用户明确要求先看图；本次不把静态图像检查记为真实 App 验收，也不将候选写入正式设计基线。后续获选并替换时再同步素材登记、产品记录与 Mac 验收。
