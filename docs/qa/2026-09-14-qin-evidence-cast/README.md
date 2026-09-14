# 秦朝真文物开场、角色一致与语音复用

版本0.67.0，2026-09-14。本轮只调整秦朝任务及全站共用旅行团形象，其他33章逐题内容与本轮备份一致；完整103章与隐藏记录保留。未部署到公网。

## 第一屏

以河南博物院所藏“秦始皇廿六年诏书权”的真实照片作为主图，下方解释度、量、衡分别涉及长短、容量、轻重，另一侧选择秦朝或汉朝及其年代。手机改为上下排列。首步照片可放大并播放本地说明，家长折叠区分别提供：

- [河南博物院直接馆藏资料](https://www.chnmus.net/ch/collection/appraise/details.html?id=512159158709033041)：器物身份、出土与入藏经过、铭文及与统一度量衡的关系。
- [中国国家博物馆](https://www.chnmuseum.cn/zp/zpml/csp/202008/t20200826_247416.shtml)：秦统一度量衡的制度背景。
- [Zcm11照片原文件](https://commons.wikimedia.org/wiki/File:Qin_Weight_Iron.JPG)与[CC BY-SA 3.0许可](https://creativecommons.org/licenses/by-sa/3.0/)。这是开放授权的实物摄影，不称官方摄影；真实器物没有经过生成式修改。

秦尺照片仍待可靠断代与许可核实；已有汉代铜矩尺仅作明确标注的对照。

## 统一的旅行团素材

均用内置imagegen对原图局部编辑，一张只请求一次，无重试。三位伙伴设定为中国现代儿童，绿衣男孩的形象从主页到结尾保持一致。保留其他角色、动作、服装、长河场景、工坊和画风。原始旧图仍留档。

| 用途 | 项目内最终源图 | 运行文件 | 提示词 |
| --- | --- | --- | --- |
| 长河主页 | [971×1619 PNG](/Users/chiang/Documents/Projects/history/reference-assets/homepage-ui/history-tour-river-v3-source.png) | [WebP](/Users/chiang/Documents/Projects/history/public/images/history-tour-river-v3.webp) | [完整提示词](prompts/homepage.txt) |
| 秦朝相聚 | [1536×1024 PNG](/Users/chiang/Documents/Projects/history/reference-assets/qin-han/qin-friends-reunion-v2.png) | [JPEG](/Users/chiang/Documents/Projects/history/public/content/step-images/qin-friends-reunion-v2.jpg) | [完整提示词](prompts/reunion.txt) |
| 分享图 | [1731×909 PNG](/Users/chiang/Documents/Projects/history/reference-assets/homepage-ui/history-tour-social-card-v3-source.png) | [1200×630 PNG](/Users/chiang/Documents/Projects/history/public/images/history-tour-social-v3.png) | [完整提示词](prompts/social.txt) |

分享图还同步到public/og.png，页面元数据改用带版本的新路径，避免读取旧缓存。相聚图保留空桌面，刻度继续由原交互组件显示。

## 语音核对

本机确有F5-TTS 1.1.20、权重文件及原有启动/合成入口；当前游戏使用的是同一Python环境中的edge-tts 7.2.8，固定音色zh-CN-XiaoxiaoNeural。edge-tts合成时联网，MP3随后在本机播放。没有用GPT合成声音，也没有另造语音引擎。

`npm run voice:update`只串联现有内容打包和已有增量生成脚本。本轮新增或更新6段台词，再次执行需要生成0段；3010条声音与清单对应，无缺失或过期合成输入。F5本轮只核对安装和模型文件，没有重新做推理验收。后续维护见[语音流程](../../VOICE-WORKFLOW.md)。

## 浏览器验证

390×600走完五步，主动错选后可以重试；第一步下一按钮底部约590像素，无横向溢出。点真实文物能看到正确大图和来源折叠区，四个来源/许可链接均显示。对齐操作通过键盘移动后能继续。第五步与结束页显示新版三位伙伴，结束按钮完整可见。恢复正常窗口后核对长河主页，临时窗口尺寸已重置。

这不是4—6岁真实儿童验收，也没有把自动音频检查当作人耳校音。

最终检查：严格素材路径核对、完整构建、20项自动测试、lint、界面类型检查与diff格式检查通过。原始日志保存在本目录。
