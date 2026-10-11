# 白底App Logo · 2026-10-10

## 用户确认与范围

用户认可前一轮集中构图并明确授权替换，同时认为浅薄荷底板偏弱，提出纯白可能更好。本轮采用白色底板，保留三位固定小伙伴、展开地图、蓝色时间河与长城；没有重新设计角色身份或改变主页旅行插画。

本轮源码变更限于当前Logo源图与素材登记、图标导出入口、共享品牌资源缓存版本，以及相关设计和交付记录。工作区此前已有较多未提交改动，逐行更新品牌引用，没有提交或推送。

## 图像来源与导出

- 内置 image_gen 完成底色修改，实际提示词：[prompt.txt](prompt.txt)。
- 参考图：`reference-assets/branding/history-trip-logo-v3-candidate.png`。
- 工具生成原图：`reference-assets/branding/history-trip-logo-v3-white-source.png`。
- 当前品牌源图：`reference-assets/branding/history-trip-logo-v3.png`，1254×1254 RGBA。
- 图像生成输出路径、SHA-256和边缘检查：[image-check.json](image-check.json)。

生成图的边缘仍包含不规则浅色残点，因此通过[原生图标导出脚本](export-icon.swift)把空白外缘限定为统一圆角边界，并将底板承托设为不透明白色。外框留白5%，圆角半径为画布的18%；仅裁定空白边缘，没有用代码重画或修改角色、地图、河流与长城。图像主体来自内置image_gen。

`npm run mac:icon`从v3源图导出共享PNG与完整ICNS尺寸。原v1、v2、v3候选和生成白底原图保留；来源和自制品牌身份见`reference-assets/branding/ATTRIBUTION.md`与`content/assets/homepage-ui-assets.json`。

![白底定稿](icon-512.png)

## 图像检查

已查看源图和32/64/128像素缩图。128像素可分辨三位伙伴、圆框眼镜、地图、蓝河与城楼；64像素可分辨三人、地图和蓝河，城楼为金色色块；32像素依靠三人配色与地图主体识别，不宣称能看清所有细节。

导出图外侧60像素范围非透明像素为0，中央底板非不透明像素为0，边缘清楚，无生成残点；图像检查见`image-check.json`。所有关键角色与地图均完整，未通过裁切人物换取圆角。

## 真实Mac App

打开的对象为`/Applications/小小历史旅行团.app`，包标识`com.jexceed.historytrip`。已执行`npm run mac:install`构建、验签并安装，退出旧进程后重新打开安装版。

本轮目标沿用当时真实窗口：3024×1742物理像素，显示器2倍缩放对应1512×871窗口，内容区约1512×839。安装后启动的默认窗口先恢复到原有目标大小再核对；`app-home-target.jpg`记录这一尺寸下的实际App首页，资源地址为`tauri://localhost`。新白底Logo在顶部品牌入口可见，主插画、出发与家长入口完整。

- 安装后首页：`app-after-install.jpg`，启动默认大小，不作为本轮另加的验收目标。
- 原目标窗口：`app-home-target.jpg`。
- 本地语音播放、暂停、续播的实际控件状态：`voice-playing.txt`、`voice-paused.txt`、`voice-resumed.txt`，均核对成功；不据此宣称全部声音经过人耳校听。
- 重开后家长页确认原有1个完成标记：`records-after-reopen.txt`和`records-after-reopen.jpg`。该补充记录截图处于默认窗口，只用于保存状态核对，不是新增布局适配目标。
- 只读核对App的WebKit本地存储，安装前与重开后完全一致：`storage-verified.json`。原孔子章节完成标记保留，current仍为null；没有清空或回写记录。

系统Dock工具返回超时，Finder核对又被用户切换窗口打断，未取得可用于验收的系统图标截图，不声称Dock的实时缓存显示已确认。已核对安装包内ICNS与当前源ICNS的SHA-256完全相同，实际App品牌图已确认更新。

验收期间同一工作区和安装App还出现后续修改：安装二进制从本轮初装的`45dc749321a98e061eb57642f27f0405eaf744dde1ec307b412fe4fc1b7b3a4a`变为最终记录的版本。没有回滚这些变更；最后再次核对当前安装版与release二进制一致，白底ICNS仍与本轮资源完全相同。最终指纹以[delivery.json](delivery.json)为准。图标替换的检查与其它工作区改动分别记录。

## 工程与包验证

- `npm run check:local`通过，见[日志](check-local.log)：严格素材门禁、内容打包、完整112章/560步审计、构建、74项测试、lint与App类型检查。
- `npm run mac:install`通过，见[日志](mac-install.log)：静态桌面构建、Desktop类型检查、Tauri构建、签名核对与安全替换。
- `npm run mac:package -- --skip-build`通过，见[日志](mac-package.log)：ZIP/DMG同步更新，DMG校验通过。
- 包内仍为44章、11站、2044段本地游戏声音、2713个资源文件，内容版本0.68.0；运行时没有4173或1420开发服务器监听。
- 教学逐题源稿、学习地图、展示范围和声音清单SHA-256保持，见`content-preserved.json`。没有运行语音生成器。
- `git diff --check`通过。未运行全库逐章实际通关；本轮只验品牌资源和必要的App回归。
- 本机临时签名核验通过，未配置Apple开发者签名或公证。

源码修改前备份在`work/logo-white-2026-10-10/before/`。本QA不代表史实终审、全量人耳校听或真实儿童测试。
