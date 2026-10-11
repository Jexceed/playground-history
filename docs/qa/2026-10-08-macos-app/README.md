# macOS App构建与清理 · 2026-10-08—09

本记录保留首次v1标识构建时的结果与摘要。随后用户要求Logo更明确表达历史并呼应主页；当前Logo与重新构建的分发包以[2026-10-09修订记录](../2026-10-09-logo-refinement/README.md)为准，下面的v1图片记录不再代表当前标识。

用户要求清理项目，参照`../playground`改造为Mac App，并提供Logo。参考项目实际使用Tauri 2 + Vite静态前端；本项目沿用相同方式，保留已有游戏组件、44章和五步状态机。相邻项目仅作为只读参考。

## 已完成

- 13个旧临时项（12个临时备份路径指针、1个Python字节码）先压缩、核验SHA256，再移除；实际原备份目录、研究原图与历史QA保留。恢复位置及每项摘要见`cleanup.json`。
- Tauri 2.11.5原生壳、静态Vite入口、离线Image适配、原生记录文件对话框和外部资料链接处理。Bundle ID固定为`com.jexceed.historytrip`，App版本0.1.0，Apple Silicon构建。
- 新Logo采用书页、时间河和拱桥，使用内置image_gen生成，PNG透明背景已检验；以系统工具导出1024px PNG、各尺寸图标与ICNS。原图在`reference-assets/branding/history-trip-logo-v1.png`，实际提示词、输出位置与摘要见`logo-prompt.txt`、`logo-output.json`。未使用API-key CLI。
- 家长页可导出/导入JSON学习记录；合并完成标记并保留兼容的继续位置。错误数据不覆盖原进度，实际个人记录不进入源码或分发包。
- 当前44章、11站、2044段游戏语音和2713个资源文件随包携带；每份复制文件与public源文件逐个哈希一致。研究原件与隐藏章节JSON不进入应用。
- 客户端模块清单确认只包含React、React DOM和scheduler等浏览器运行库，不含Next、Vinext、RSC、Drizzle或Wrangler服务器运行库。对应构建门禁与记录见`desktop-build.json`。
- 已安装到`/Applications/小小历史旅行团.app`；可独立复制的App、ZIP、DMG在`release/`，DMG带Applications快捷方式。`codesign --verify --deep --strict`、ZIP CRC和DMG校验通过。

## 已执行检查

- `npm run check:local`：严格素材、完整112章/560步内容审计、Web构建、68项测试、lint、app类型检查。
- `npm run mac:install`：静态资源构建、desktop类型检查、Tauri/Rust编译、临时签名、本机安装；最终日志`mac-install-final.log`。
- `cargo test --release --target aarch64-apple-darwin`：2项原生边界测试通过，日志`rust-tests.log`。
- `npm run mac:package -- --skip-build`：ZIP和DMG生成与校验，日志`package.log`。
- `cargo fmt --check`、最终lint和`git diff --check`通过。
- 可执行文件为arm64 Mach-O，动态链接仅为macOS系统库和框架；安装版与release版二进制摘要一致。
- 原4173服务只在核对确属本项目后停止，记录`local-server.json`。网页启动脚本改为只绑定127.0.0.1，端口冲突时报错，不静默换端口。

结构化结果及产物SHA256见`verification.json`。原字体/Image适配的alt警告已修正，最终lint无警告。

## 尚未完成的真实界面验收

**界面工具两次返回Mac已锁屏且无法自动解锁。已请求用户手动解锁，没有绕过锁屏。**

因此不能声称App已经启动成功、声音实际播放或原生交互通过。解锁后继续：

1. 用CUA打开安装的.app，记录实际内容区宽高。当前配置为1280×720，尚不是实测值。
2. 确认无4173服务时主页、真图与MP3能加载；实测选择、错选/重试、尺子操作、声音暂停/重播。
3. 关闭并重开，检查继续位置和完成标记。
4. 实测原生导出、取消、导入、错误文件拒绝；如迁移用户记录，导出文件只留在忽略的work目录，不提交。
5. 在家长层验证外部来源链接通过系统浏览器打开，游戏窗口保持。
6. 保存真实App截图，完成后再更新此处GUI状态；不得用浏览器截图冒充Mac应用截图。

Mac包是本机临时签名（ad-hoc），未配置Apple开发者签名或公证；这两种状态与本机验签分开。npm依赖审计记录了既有Web工具链Next的安全公告，未在此轮做全栈升级；Mac客户端构建已排除相关服务器运行库，原开发网页升级留在TODO。

## 官方实现参考

[Tauri与Vite](https://v2.tauri.app/start/frontend/vite/)、[窗口和CSP配置](https://v2.tauri.app/reference/config/)、[原生文件对话框](https://v2.tauri.app/plugin/dialog/)。本机原生行为仍以真实.app验收为准。
