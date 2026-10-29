# 宋明与世界11章实机收尾、苏轼封面区分

2026-10-29—30。接续“补完宋辽叙事并区分苏轼封面”会话，完成此前中断的本机验收。11章55步已在已安装的真实 Mac App 中检查；最终裁图、结束导航和退出重开已复验。范围仍为59章295步、13站，完整库121章605步、隐藏62章不变。

## 修改与保留

- 《水调歌头》任务卡保留赵孟頫的后世苏轼画像；《题西林壁》任务卡采用庐山2018年实景照片，任务内人物画像和故事插画继续各司其职。[前轮源数据核对](source-preservation.json)、[最终画像卡](resumed/song-final-covers.jpg)、[最终庐山卡](resumed/song-final-lushan-cover.jpg)。摄影、日期与CC BY 2.0授权登记见[素材记录](../../../reference-assets/song-poetry-expansion/ATTRIBUTION.md)。
- 范成大结束页原先因长回答挤出导航。共享结束页现在把 `FinishNavigation` 放在标题之后、图片和长回答之前，保持返回与重玩按钮完整可见。[旧问题](tianyuan-finish.jpg)、[最终展开回答](resumed/tianyuan-final-finish-expanded.jpg)。
- 实机发现朵拉维拉水池和雅典住家图卡上沿带入儿童半脸。仅调整正式 `objectView.crop`，同组选项仍使用同种画风和尺寸，选项与选中大图共用登记。朵拉维拉两项为700×585、y=350；雅典住家仍为750×700，y从250移至290。完整情境和原图保留，未重新生成图片或声音。[字段级核对](resumed/crop-source-preservation.json)、[水道](resumed/water-final-channel.jpg)、[蓄水池](resumed/water-final-pool.jpg)、[住家](resumed/athens-final-home.jpg)。

本次接续只改上述两章裁图及素材备注；前轮的苏轼封面和结束导航修复一并验收。内容版本仍为0.68.0，未改历史台词、题目、答案、声音引擎或记录格式。未提交或推送，原有未提交工作保留。

## 真实 App 检查

只操作 `/Applications/小小历史旅行团.app`，界面URL为 `tauri://localhost`。本轮沿用重新打开后的实际窗口，没有调整尺寸或新增多端矩阵。原始窗口截图2560×1442像素，按2倍Retina折算窗口约1280×721逻辑像素；图上标题栏约32逻辑像素，内容区约1280×689。以上是截图测量，不把配置文件的1280×720当作实测值。见[尺寸记录](resumed/app-target.json)。

每次选择反馈后先保存并目视检查截图，再继续下一步；未滚动五步页面来掩盖主按钮越界。历史站列表、家长资料和结束页加餐可按内容滚动。此处为逐页截图人工核对，没有声称执行浏览器DOM遮挡巡检。

| 章节 | 已检查的重点 | 证据 |
| --- | --- | --- |
| 王安石《元日》 | 五步、时间题、先后分镜、末题及结束 | [前轮事件](events.json)、[结束页](yuanri-finish.jpg) |
| 苏轼《题西林壁》 | 五步、错误重试、选中大图、完整诗文、家长材料与新封面 | [前轮事件](events.json)、[家长全文](xilin-parent-poem.txt)、[最终重开](resumed/resume-after-restart.jpg) |
| 杨万里《小池》 | 五步、材料放大、找图错选与换轮 | [前轮事件](events.json)、[结束页](xiaochi-finish.jpg) |
| 范成大田园诗 | 最终版重走五步，分镜、现代种植应用、长回答结束导航 | [最终分镜](resumed/tianyuan-final-journey.jpg)、[结束页](resumed/tianyuan-final-finish-expanded.jpg) |
| 唐寅《画鸡》 | 最终版重走五步，后世画像、画与诗两轮辨认、结束、亲子展开 | [末轮](resumed/rooster-final-round2.jpg)、[结束](resumed/rooster-final-finish.jpg)、[亲子展开后顶部](resumed/rooster-family-navigation.jpg) |
| 文徵明《芭蕉槛》 | 五步、原作诗页、错选改选、秋声联想、全文与意译、重玩回第1步 | [原诗](resumed/wen-full-poem.jpg)、[错误](resumed/wen-journey-wrong.jpg)、[家长全文](resumed/wen-parent-poem.txt)、[重玩](resumed/wen-replay.txt) |
| 于谦《石灰吟》 | 五步、颜色与品格、多轮错选与改选、展开结束回答 | [首轮](resumed/yu-find-round1.jpg)、[末轮](resumed/yu-takeaway-correct.jpg)、[结束](resumed/yu-finish-expanded.jpg) |
| 朵拉维拉 | 五步、池内/池壁两轮真实照片找图、引水与存水、材料说明和最终裁图 | [两轮末轮](resumed/water-find-round2.jpg)、[材料](resumed/water-material.jpg)、[最终裁图](resumed/water-final-pool.jpg) |
| 雅典神庙 | 五步、古建筑与现代房屋、神庙用途、住家选择和最终裁图 | [两轮末轮](resumed/athens-find-round2.jpg)、[神庙](resumed/athens-change-correct.jpg)、[最终住家](resumed/athens-final-home.jpg) |
| 欧洲手写书 | 五步、讲解者/听读者、抄写/装订、选项和大图 | [抄写](resumed/book-change-correct.jpg)、[装订](resumed/book-takeaway-correct.jpg)、[结束](resumed/book-finish.jpg) |
| 大津巴布韦 | 五步、石墙/塔两轮、当地建造与物品交流、证据局限 | [末轮](resumed/zimbabwe-find-round2.jpg)、[末题](resumed/zimbabwe-takeaway-correct.jpg)、[结束](resumed/zimbabwe-finish.jpg) |

新的逐页状态和截图索引在[接续事件](resumed/events.json)；[覆盖核对](resumed/coverage.json)按11章汇总五步完成状态和结束页证据。最终版的裁图回归使用自由跳转，第5步通过后正确显示“去第1步”，未把跳过的步骤补记完成。结束页“返回时间河”已实际返回主页，“再玩本章”已实际回到本章封面并从第1步进入。

语音已检查材料重听、暂停、继续播放和页面切换；[暂停状态](resumed/audio-paused.txt)、[续播状态](resumed/audio-resumed.txt)与本地资源检查相互印证。没有录制扬声器回环，也没有把状态检查记作逐条人耳校听。材料来源展开与文徵明原文、现代意译均在实际家长入口核对。

最初旧进程界面读取超时，通过正常退出后重开最终安装版恢复。之后一度出现自动输入不生效，用户确认手动操作正常；重新同步界面后坐标与控件操作均恢复。未将此归为产品缺陷，未绕过锁屏或改用浏览器替代。

## 工程、离线与记录

| 检查 | 结果 |
| --- | --- |
| 严格素材与全库内容 | 121章通过；[日志](resumed/assets-final.log) |
| 内容打包、121章605步结构审计、构建与测试 | `npm test`包含打包；103/103通过；[日志](resumed/tests-final.log) |
| lint、App类型、diff | 通过；[lint](resumed/lint-final.log)、[类型](resumed/typecheck-final.log)、[diff](resumed/diff-check.txt) |
| 本机构建安装 | `npm run mac:install`完成；[日志](resumed/mac-install-final.log) |
| 安装与签名 | 构建、release、Applications三个二进制哈希相同，签名验证通过；[记录](resumed/install-verification.json) |
| 离线资源 | 59章、13站、2752段声音、3661个资源文件，无缺失或源文件哈希差异；[记录](resumed/offline-assets.json) |
| 开发服务器 | 4173与1420端口无监听，App从本地包运行；[记录](resumed/dev-server-check.json) |
| 退出重开 | 30个完成标记和《题西林壁》第2步位置保持，重开前后存储完全一致；[记录](resumed/progress-verification.json) |

接续开始时已有23个完成标记（含前轮宋代4章QA），结束时30个；原扩充前19个也全部保留。新增标记来自本轮成人/代理验收，不代表真实儿童学习结果。重开后点继续并出发，实际回到《题西林壁》第2步，未把跳过的第1步记为完成。

最终安装二进制SHA-256：`9f417c86b4034b0fb80bae9a18d95fa58462aa8143ec2d768ae9c70811d90643`。本机临时签名，未进行Apple开发者签名或公证。

## 保留的边界

本轮关闭的是11章扩充、苏轼任务卡封面和结束页修复的App验收欠项。此前其他10章深化等历史验收欠项没有据此批量关闭。真实4—6岁儿童共玩、全量人工校听、全库史实终审和正式内容冻结继续独立待办。
