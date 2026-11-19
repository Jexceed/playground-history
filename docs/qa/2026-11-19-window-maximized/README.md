# 2026-11-19 · Mac App 启动默认最大展开（非全屏）QA

## 1. 目标与修改范围

按用户要求，将 `/Applications/小小历史旅行团.app` 启动默认窗口改为**最大展开（填满当前屏幕可用桌面区域 `NSScreen.visibleFrame`，保留系统顶部菜单栏、窗口标题栏红黄绿按钮与底部 Dock，不进入 macOS 全屏独立空间）**。

- `src-tauri/tauri.conf.json`：主窗口 `main` 增加 `"maximized": true`、`"fullscreen": false`，保留 `"resizable": true` 与还原基准尺寸 `"width": 1280, "height": 720`（最小尺寸 `1100×700`），并移除 `"center": true`。
  - **关键根因说明**：在 `tauri-runtime-wry 2.11.4` + `tao 0.35.3`（macOS）中，若同时保留 `"center": true` 与 `"maximized": true`，窗口构建时先异步调用 `ns_window.zoom(None)` 展开至 `visibleFrame`，随后又会异步调用 `window.set_outer_position(initial_position)` 按 `1280×720` 的居中坐标平移已展开的大窗口，导致窗口右/下侧移出屏幕；移除 `"center": true` 后，`tao` 在创建 `NSWindow` 时仍会先执行原生 `ns_window.center()` 记录居中的 `1280×720` 标准帧（供用户双击标题栏或 `Option+绿色按钮` 还原时使用），再干净地缩放至 `visibleFrame`。
- `src-tauri/src/main.rs`：新增 Rust 单元测试 `main_window_starts_maximized_without_fullscreen`，校验 `tauri.conf.json` 反序列化后的 `maximized == true`、`fullscreen == false`、`center == false`、`resizable == true`。
- `tests/desktop.test.mjs`：新增桌面配置回归测试，防止后续回退默认展开状态或误加 `center: true`。

本轮未改动题干、图片、声音、章节范围（62章310步、15站）或内容版本（`0.68.0`）。工作区中另一并行任务的未提交 `app/`、`content/`、`scripts/` 改动已原样保护、未覆盖。

## 2. 工程检查与本机安装验签

详细核验数据见 [verification.json](verification.json)。

| 检查项 | 结果 |
| --- | --- |
| 严格素材与全库校验 | `npm run content:validate:assets` 通过（121章、1232条素材、1227/1227本地缓存文件） |
| 前端构建、测试、Lint、类型检查 | `npm test`（`108/108` 通过，含新增桌面窗口配置测试）、`npm run lint`、`npm run typecheck:app` 零报错 |
| Rust 单元测试 | `cargo test --manifest-path src-tauri/Cargo.toml --target aarch64-apple-darwin` `3/3` 通过 |
| 本机 Mac App 构建安装与验签 | 构建、`release/小小历史旅行团.app` 与 `/Applications/小小历史旅行团.app` 三处二进制 SHA-256 同为 `e9539d27792f7ea44604837d207c50b94e5dacb0948f00f56ce6540bd6e9c30a`；`codesign --verify --deep --strict` 通过；离线包 62 章、2984 段声音、3950 个文件齐备；`4173` / `1420` 端口均无开发服务监听 |

## 3. 真实 Mac App 启动窗口与重开记录验证

- **屏幕与目标窗口实测**：当前 Apple Silicon Mac 主屏逻辑尺寸 `1512×982`（`scale = 2.0`），扣除顶部菜单栏 `33pt` 与底部 Dock `78pt` 后，`NSScreen.main.visibleFrame` 为 `1512×871`（CoreGraphics 顶左坐标 `X = 0, Y = 33, Width = 1512, Height = 871`）。
- **启动与重开几何核验**：分别通过 `open /Applications/小小历史旅行团.app` 与 `./本机试玩.command` 退出并重开真实已安装应用，CoreGraphics（`CGWindowListCopyWindowInfo`）实测主窗口均为：
  - `X = 0, Y = 33, Width = 1512, Height = 871`（内容区约 `1512×840` 逻辑像素 / `3024×1680` 物理像素），`kCGWindowLayer = 0`，`kCGWindowIsOnscreen = 1`。
  - 与 `NSScreen.main.visibleFrame` 逐像素一致，保留顶部 `33pt` 菜单栏与底部 `78pt` Dock，未进入 `1512×982` 的 macOS 原生全屏空间。
- **学习记录持久化核验**：在本机逐字节对比了退出前和重开后的学习记录。完成标记及续玩位置相同。[核验结果](verification.json)

## 4. 首轮检查范围

- 当前命令行宿主进程未获系统屏幕录制（`CGPreflightScreenCaptureAccess() == false`）与辅助功能（`AXIsProcessTrusted() == false`）权限，本轮未在命令行内截屏或通过 `System Events` 点击控件，仅以 CoreGraphics 实测窗口边界/层级与 WebKit 存储完成原生启动及重开核验，未改用网页替代。
- 构建阶段检测到工作区另有并行会话正在修改 `content/` 与 `scripts/prepare-focused-quests.mjs`，为保护并行未提交工作，本轮桌面二进制直接基于已验收通过的 62 章 `desktop-dist` 打包安装；合入前已用两组最终源码重新构建安装，实机测量及重开结果见[联合验收](../2026-11-19-content-text-review/README.md)。
