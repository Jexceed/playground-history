# 六组图卡与小裁图放大修复 · 2026-10-16

已修复上一轮新确认的苏轼、李白、汉武帝铸钱、元代驿站、承德、杜甫6组图卡，并修复共用显示和导出问题。已构建、安装并打开 `/Applications/小小历史旅行团.app`；6组关键步骤及共享保护实际检查完成。当前App停在新的元代驿站第4步，便于直接查看。

## 修改内容

1. 使用内置 **image_gen** 重绘6组、12幅完整选项情境。同组人物尺度、画风和取景比例对应；月亮、书信、花叶、船灯不再从背景小块直接放大，称钱/串钱和解释/记录不再截断人物。驿站有送信人、文书包、备马和走出站门的动作。
2. 三处生成细节经定向编辑纠正：苏轼文学情境中的右侧人物为男性；钱串穿过中央方孔，不串在外缘；驿站文书包改为平整包裹和系绳，移除现代三角信封样式。首轮候选保留，不随App打包。
3. `SceneCardArt`读取实际运行图片像素和显示区域尺寸，仅对**选中的图卡**启用清晰度保护。局部放大超过1.5倍逻辑尺寸时，改显示周围情境并标出原取景。情境保留可见对象，避免重新露出旧工坊图下方用于放置学具的大片空桌面。找图热点和分镜几何不走这条回退逻辑。
4. 现有生成器对选项使用的来源图改按1600长边、88质量导出，仍尊重素材显式登记的尺寸；其他图片保持原规则。只提高清晰度不能补出小原图缺少的细节，因此与重绘和显示保护一起处理。
5. 汉代第5步原来没有 `selectionFraming: detail`。初次实机检查发现双幅合图会显示错误半幅，已补齐正式源配置，并加回归断言，要求所有同组情境图卡选中后沿用登记取景。

题干、正确答案、讲述与回应、声音ID、章节ID、学习目标、五步完成机制、44章11站与0.68.0内容版本均保持；没有重新合成声音。源稿变更范围见 [authored-scope.json](authored-scope.json)。此前赵州桥修改保持。

## 素材与设计

核心内容、材料依据、动作与可观察理解对应表见 [DESIGN.md](DESIGN.md)。

| 章节 | 原图（项目内保留） | 选项与大图 |
| --- | --- | --- |
| 苏轼 | [sushi-moon-letter-v3.png](../../../reference-assets/choice-art-fix/sushi-moon-letter-v3.png) | [预览](sushi-moon-letter-v3-preview.png) |
| 李白 | [libai-home-moon-v3.png](../../../reference-assets/choice-art-fix/libai-home-moon-v3.png) | [预览](libai-home-moon-v3-preview.png) |
| 汉代 | [han-weigh-string-v3.png](../../../reference-assets/choice-art-fix/han-weigh-string-v3.png) | [预览](han-weigh-string-v3-preview.png) |
| 元驿 | [yuan-depart-feed-v3.png](../../../reference-assets/choice-art-fix/yuan-depart-feed-v3.png) | [预览](yuan-depart-feed-v3-preview.png) |
| 承德 | [chengde-explain-record-v3.png](../../../reference-assets/choice-art-fix/chengde-explain-record-v3.png) | [预览](chengde-explain-record-v3-preview.png) |
| 杜甫 | [dufu-leaves-lantern-v3.png](../../../reference-assets/choice-art-fix/dufu-leaves-lantern-v3.png) | [预览](dufu-leaves-lantern-v3-preview.png) |

实际提示词见 [art-prompts.json](art-prompts.json)，定向修订见 [art-corrections.json](art-corrections.json)，输出对应见 [art-output-map.json](art-output-map.json)，登记取景见 [crops.json](crops.json)，总览见 [cards-gallery.png](cards-gallery.png)。素材身份与边界登记于 `content/assets/choice-art-fix-assets.json`，署名在 `reference-assets/choice-art-fix/ATTRIBUTION.md`。原图不进入普通Git或App。

新图均为现代教学插画，不冒充历史证据、人物肖像或准确器物复原；原文、文物照片和史料入口继续独立保留。旧原图不删除；不再被引用的旧汉代市场JPEG由原生成器移出运行包，研究原件仍在。

## 清晰度检查

- 12幅新图有效运行裁图宽度均超过900像素，在目标主图区均使用细节显示；[逐图数值](new-card-quality.json)。
- 当前100张单幅情境选项中，低于200像素宽的裁图为0；在686×457逻辑像素的筛查框下，4张仍应保留情境：长城望远、水粮、徐霞客画桥、黄道婆纱线。实际显示按各页框的尺寸判断，不使用固定断点或第二套玩法。[全量单幅图卡检查](all-card-quality.json)
- 与本轮开始快照比较，共37个既有步骤图片路径发生变化，包含重导出和不再使用的旧JPEG；新增6个JPEG。范围见 [generated-media-scope.json](generated-media-scope.json)。其他38章正式逐题源稿保持，隐藏68章运行JSON保持；共享图片导出和显示规则的结构影响检查覆盖112章560步。

## 真实 App 验收

唯一窗口保持原状：截图2560×1442物理像素，标题栏62、内容2560×1380；2倍Retina下窗口1280×721、内容1280×690逻辑像素。没有启动浏览器诊断，也没有用静态预览替代App。

| 项目 | 实测结果与截图 |
| --- | --- |
| 苏轼第3步 | [缩图](sushi-options.png)、[错选书信](sushi-wrong.png)、[正确月景](sushi-correct.png)清楚，同图对应；下一步实际到第4步 |
| 李白第4步 | [缩图](libai-options.png)、[错选](libai-wrong.png)、[正确](libai-correct.png)中人物与想象完整，按钮完整可见 |
| 汉代第5步 | 发现并修正旧取景配置后，重新安装复验：[缩图](han-final-options.png)、[串钱错选](han-final-wrong.png)、[称钱正确](han-final-correct.png)对应；真材料入口仍可见 |
| 元驿第4步 | [缩图](yuan-options.png)、[备草错选](yuan-wrong.png)、[离站正确](yuan-correct.png)能区分动作；最终构建再次打开新离站图，见 [交付画面](delivered-yuan.png) |
| 承德第4步 | [缩图](chengde-options.png)、[记录员](chengde-wrong.png)、[解释者](chengde-correct.png)取景完整，主按钮可见 |
| 杜甫第5步 | [缩图](dufu-options.png)、[船灯](dufu-wrong.png)、[花叶](dufu-correct.png)能看见船体与水滴；跳入末步后按钮正确指向未完成的第1步，没有提前结算整章 |
| 共享保护 | 最终构建在张骞第3步实测[水粮情境定位](context-guard-final.png)，避免放大小块和空桌面；重试后切回[记见闻细节](context-to-detail.png)，反馈和图同步 |
| 本地声音 | 重播原回应，暂停显示“继续播放声音”，续播恢复“暂停声音”；[暂停状态](voice-paused-ax.txt)。仅验证播放控制，不冒称全量人耳校听 |
| 重开记录 | 退出并重开最终App，续玩回元驿第4步且完成标记保留；[重开状态](reopened-ax.txt)。原12个整章完成记录完全保持；[记录核对](progress-check.json) |

反馈截图均在下一次点击或滚动之前检查；没有靠滚动露出主按钮。6组分别检查两项选择，错选均可重试，正确项才标记通过。初次汉代错误显示证据 `han-wrong.png`、最初情境回退留白证据 `context-guard.png`保留，以上最终截图覆盖它们的验收结论。汉代修正及情境取景修正后均重新安装，针对受影响行为复验；其他5组已验的素材、取景和细节分支未再修改。

## 工程和交付边界

- 严格素材检查、内容打包与完整结构审计通过。`npm test`最终85项通过，包含原80项、清晰度与情境取景5项；同组裁图回归断言已加入原测试。`npm run lint`、`npm run typecheck:app`、desktop类型检查、`git diff --check`通过。
- `npm run mac:install`最终成功；构建、release、已安装App可执行文件哈希一致，签名验证通过，见 [install-verification.json](install-verification.json)。这是本机临时签名，不是Apple公证。
- [离线资源核对](offline-assets.json)：44章、11站、2044段声音、2725个资源文件；6张新JPEG全部在打包输入中且哈希匹配。候选图、研究原图不随包发布。4173和1420无监听，运行不依赖开发服务器；本轮未关闭系统网络。
- 原12个整章完成记录保持。为方便查看，本轮正常试玩把续玩位置留在元驿第4步；没有注入、清空或覆盖存储。
- 未逐章通关全部44章，未做真实儿童理解测试或全量人工校听；指南针、织布、屋脊的独立美术待办尚未在本轮重绘。
- 本轮修改未提交、未推送，未另行更新DMG/ZIP。先前赵州桥和审查记录、`.qa-tmp/`与其他已有改动均保留。
