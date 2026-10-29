# 古诗与世界古代扩展：联合构建与本机验收记录

2026-10-23开始，2026-10-24完成最终工程检查与安装。**四章内容已实现并安装；真实App已验证13/20步，剩余7步及最终重开因Mac锁屏待验。** 具体证据与未覆盖范围见[App验收记录](APP-ACCEPTANCE.md)。不把工程通过写成全部实机通过。

## 范围与改动归属

用户要求继续制作新内容，重点包括古诗，并展开国外章节。此前仅中国的内容范围由本次要求更新；唯一产品与交付对象仍是 `/Applications/小小历史旅行团.app`。

| 本聊天负责的章节 | 本轮身份 | 主要学习关系 |
| --- | --- | --- |
| 孟浩然《春晓》 · `cn-ancient-06-12-meng-haoran-chunxiao` | 新增ID | 从清晨鸟鸣回想昨夜风雨，体会对春花的牵挂。 |
| 王之涣《登鹳雀楼》 · `cn-ancient-06-13-wang-zhihuan-tower` | 新增ID | 想看得远、再上一层与视野展开相互对应。 |
| 古埃及金字塔 · `world-ancient-01-02-river-civilizations` | 隐藏旧章升级并开放，沿用ID | 王室陵墓用途、真实石块与加工建造的劳动。 |
| 古罗马道路 · `world-ancient-01-05-rome-empire` | 隐藏旧章升级并开放，沿用ID | 起初服务军队移动与统治，后来也联系城市和物资往来。 |

完整库为114章/570步；本轮可见48章/240步、12站，其中中国46章、世界2章，其余66章保留。内容版本保持 `0.68.0`，继续使用原chapterId、存储键、五步机制和完成记录；新增专题只索引既有入口，不建立第二套进度。具体设计见[本轮设计](DESIGN.md)、[古诗内容与材料核对](POETRY-CONTENT.md)、[世界章节内容与材料核对](WORLD-CONTENT.md)。

另一个聊天同期深化10个原有章节。用户明确授权跨聊天协调后，双方先冻结源稿，再由主任务统一生成、配音、构建和安装。这10章不计为本聊天新增内容，也不计入本轮4章创作数量。[source-preservation.json](source-preservation.json)记录原44章中34章未变、10章为并行任务所有、意外改动为空；[joint-source-freeze-check.json](joint-source-freeze-check.json)记录10章冻结哈希全部匹配。4章ID、内容哈希及授权协调说明见[authored-scope.json](authored-scope.json)。

开始前的工作区、内容与安装状态分别保存在[status-before.txt](status-before.txt)、[hashes-before.json](hashes-before.json)、`before/`（仅本机源稿备份，不随Git提交）、[install-before.json](install-before.json)和[storage-before.json](storage-before.json)。本轮没有提交或推送。

## 新插画、真实材料与提示词

六张新插画均使用内置`image_gen`，制作前查看了项目参考图和角色约定。它们是现代教学情境，不是历史现场、文物照片或诗人肖像。旧参考与新原图都保留；项目引用仓库副本，不依赖工具默认输出目录。

| 新图与项目原文件 | 实际原图尺寸 | 实际提示词 |
| --- | --- | --- |
| [《春晓》四格分镜](../../../reference-assets/poetry-world-poetry/chunxiao-story-v1.png) | 1536×1024 | [chunxiao-story-v1.prompt.txt](../../../reference-assets/poetry-world-poetry/chunxiao-story-v1.prompt.txt) |
| [《登鹳雀楼》四格分镜](../../../reference-assets/poetry-world-poetry/tower-story-v1.png) | 1536×1024 | [tower-story-v1.prompt.txt](../../../reference-assets/poetry-world-poetry/tower-story-v1.prompt.txt) |
| [金字塔教学展厅](../../../reference-assets/poetry-world-world/egypt-pyramid-museum-v1.png) | 1536×1024 | [PROMPTS.md](../../../reference-assets/poetry-world-world/PROMPTS.md)，同名素材节 |
| [金字塔情境选择](../../../reference-assets/poetry-world-world/egypt-pyramid-choices-v1.png) | 1254×1254 | [PROMPTS.md](../../../reference-assets/poetry-world-world/PROMPTS.md)，同名素材节 |
| [罗马道路教学展厅](../../../reference-assets/poetry-world-world/rome-road-museum-v1.png) | 1536×1024 | [PROMPTS.md](../../../reference-assets/poetry-world-world/PROMPTS.md)，同名素材节 |
| [罗马道路情境选择](../../../reference-assets/poetry-world-world/rome-road-choices-v1.png) | 1254×1254 | [PROMPTS.md](../../../reference-assets/poetry-world-world/PROMPTS.md)，同名素材节 |

原图目录：[古诗素材](../../../reference-assets/poetry-world-poetry/)、[世界章节素材](../../../reference-assets/poetry-world-world/)。身份、许可、引用与边界分别见[古诗署名](../../../reference-assets/poetry-world-poetry/ATTRIBUTION.md)、[世界章节署名](../../../reference-assets/poetry-world-world/ATTRIBUTION.md)、[古诗登记](../../../content/assets/poetry-world-poetry-assets.json)及[世界章节登记](../../../content/assets/poetry-world-world-assets.json)。

真实材料包括孟浩然后世刻石拓像、现代重建鹳雀楼照片，以及复用的吉萨大金字塔、阿庇亚道照片。古诗原文、作品解释、图片身份与许可分别核对；《登鹳雀楼》的“入海”不解释为从楼上直接看见入海口。所有材料的具体来源和证据边界见上述两份内容核对记录。

## 已有运行验证证据

以下均为工程或静态证据，不代表App实际可见、可听或儿童已经理解。

| 检查 | 当前可确认结果 | 证据 |
| --- | --- | --- |
| 来源、素材与结构校验 | 已产出校验日志；联合生成日志也记录114章来源/路径校验通过。不同时间点的素材总数不混为同一快照。 | [assets.log](assets.log)、[voice-update.log](voice-update.log) |
| 完整内容打包 | 首次打包在旧“中国ID限定”审计断言处失败；保留该失败日志。后续联合`voice:update`中的`content:pack`已走完内容生成、缩图和结构审计。 | [首次content-pack.log](content-pack.log)、[后续voice-update.log](voice-update.log) |
| 全库结构审计 | 114章/570步；可见48章/240步。通过不等于隐藏66章内容重做、全库史实终审或儿童审核。 | [content-audit.log](content-audit.log) |
| 运行图与裁取 | 本轮10个材料/故事图的实际运行尺寸匹配登记，全部登记crop在原图范围内；记录局部有效像素，不把放大当细节增加。 | [runtime-art-review.json](runtime-art-review.json) |
| 聚焦回归 | 运行分辨率保留测试1项，以及内容范围、诗全文、末题语义、世界分组与兼容进度测试9项，均返回exitCode 0。 | [runtime-art-review.json](runtime-art-review.json) |
| lint、App类型检查 | 最终快照命令均exitCode 0。 | [lint-final.log](lint-final.log)、[typecheck-final.log](typecheck-final.log) |
| 完整`npm test`、最终`git diff --check` | 98项测试通过，0失败；最后差异检查通过。首轮发现旧方法项总数断言及新增可见照片的制作备注泄漏，已分别校准至90项和补读者边界，保留原notes。 | [test-final.log](test-final.log) |
| edge-tts声音增量 | exitCode 0，389段增量完成；全库3670段文字/音色一致，App必需2258段齐备。389包含两边冻结改动，不全部归为本聊天四章新增。 | [voice-update.log](voice-update.log)、[offline-preinstall-review.json](offline-preinstall-review.json) |

两首诗的全文已进入第2步`look-listen`实际语音源字段，家长页有全文、现代意译和材料说明；这是绑定与内容检查。MP3文件与文字匹配已核对；已在App检查春晓播放/暂停/续播与切页，详见实机记录；全量人耳校听仍待。

## 本轮唯一App验收尺寸

从已安装App实测：窗口1280×721逻辑像素，内容区1280×690；Retina物理窗口2560×1442、内容2560×1380，标题栏62物理像素。依据见[app-target.json](app-target.json)、[初始截图](app-before.png)和[初始辅助功能树](app-before-ax.txt)。仅以此窗口验收，不另加手机、平板或浏览器尺寸矩阵；临时调整后恢复原窗口。

安装前已记录App标识 `com.jexceed.historytrip`、可执行文件SHA和进程；当时4173、1420端口无开发服务。该记录只证明开始状态，不能替代本轮新构建安装后的离线验证。

## 实机结果与锁屏边界

详细逐项结果见[APP-ACCEPTANCE.md](APP-ACCEPTANCE.md)、[native-app-check.json](native-app-check.json)。两个世界章10步、春晓前3步已实际操作；反馈后主按钮在未滚动前完整可见。古诗/世界专题和地图、错误重试、两轮找图、选中大图、结束返回/再玩、暂停续播均有原生截图或AX证据。

春晓第4步操作前CUA明确报告Mac锁屏。未尝试绕过锁屏，已请求手动解锁。春晓后2步、登鹳雀楼5步、新材料弹层/家长全文展开、最终安装后重开仍待；最终去重版尚未在锁屏后重启确认。

最终安装的App、release和构建目录二进制SHA一致，`codesign --verify --deep --strict`通过；3008个离线资源文件与当前public哈希一致，开发端口4173/1420均无监听。证据见[install-verification.json](install-verification.json)、[mac-install-final.log](mac-install-final.log)。本机临时签名，未做Apple公证；没有关闭系统网络进行额外断网测试。

只读记录证明原17个整章标记全部保留，本轮原生试玩新增两个世界章标记，当前19个。春晓保存第3步及前三步完成状态；最终替换安装前后整个存储JSON一致，见[progress-partial-check.json](progress-partial-check.json)、[安装前存储](storage-before-final-install.json)、[安装后存储](storage-after-final-install.json)。本轮未注入、清空或覆盖存储，重开恢复仍需实测。

实现、工程检查、原生功能、真实儿童理解与史实终审是不同状态。未逐章通关全部48章，未完成真实儿童共玩、全量人耳校听或正式内容冻结。没有提交或推送；并行10章由另一聊天独立验收。
