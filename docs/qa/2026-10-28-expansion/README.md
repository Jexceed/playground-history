# 宋朝站名、宋明诗词与世界故事扩充

本轮制作：2026-10-28—29；实机收尾：2026-10-30。11章内容接入、声音、工程检查与59章Mac App安装已完成；原锁屏阻断的11章55步真实App验收已补齐，封面、结束导航、裁图和重开复验见[收尾QA](../2026-10-29-native-completion/README.md)。下文保留原制作轮的证据与当时阻断过程。

## 交付范围

- 时间地图、历史站和家长层统一取正式目录的“宋朝”，显示960—1279年。原并立政权章保留，明确辽、西夏、金与两宋先后并立，不把辽916年的起点作为宋朝起点。
- 新增宋代4、明代3个ID，升级4个世界旧ID。当前59章295步、13站：中国古代53章、世界古代6章。完整库121章605步、7板块，隐藏62章源稿和兼容进度保留。
- 原48章逐题对象不改写（[逐章哈希复核](source-final-review.json)），内容版本0.68.0保持；新故事继续使用同一五步、进度、材料、声音和结束机制。

| 题材 | 儿童主旨与主要动作 | 正式源稿 |
| --- | --- | --- |
| 王安石《元日》 | 观察旧桃符换新，排列过程，联系送旧迎新的诗意 | [源稿](../../../content/chapters/wang-anshi-yuanri.md) |
| 苏轼《题西林壁》 | 比较山岭、山峰与山谷视野，理解换位置补充观察 | [源稿](../../../content/chapters/su-shi-xilin.md) |
| 杨万里《小池》 | 区分嫩荷叶与圆叶、停立与飞行，再找泉流，解释拟人语气 | [源稿](../../../content/chapters/yang-wanli-xiaochi.md) |
| 范成大田园诗 | 辨白天耘田与夜里绩麻，分清成年“儿女”和“童孙”，联系今天种子观察 | [源稿](../../../content/chapters/fan-chengda-tianyuan.md) |
| 唐寅《画鸡》 | 读完整诗，联系鸣叫和人家清晨，区分静图与读诗想象 | [源稿](../../../content/chapters/ming-tang-yin-rooster.md) |
| 文徵明《芭蕉槛》 | 对照1551年真实图诗册页与现代想象，感受诗补出的声音、凉意和绿荫 | [源稿](../../../content/chapters/ming-wen-zhengming-garden.md) |
| 于谦《石灰吟》 | 先读物象，再区分白墙的颜色与归还借物所表达的品格 | [源稿](../../../content/chapters/ming-yu-qian-lime.md) |
| 朵拉维拉蓄水 | 区分引水与存水，观察遗址空间，结合雨少时的需要 | [源稿](../../../content/chapters/world-ancient-india.md) |
| 雅典神庙 | 先讲敬奉雅典娜的用途，再比较神庙与日常住家 | [源稿](../../../content/chapters/world-ancient-greek-city-states.md) |
| 欧洲手写书 | 分清抄写和装订，理解文字怎样留存、翻阅与传递 | [源稿](../../../content/chapters/world-ancient-medieval-europe.md) |
| 大津巴布韦 | 石墙支持当地建造本领，远方物品支持贸易联系；两种证据不能相互替代 | [源稿](../../../content/chapters/world-ancient-africa-americas.md) |

## 内容与画面复核

先确定主旨、证据、动作与可观察回应，见[制作对应表](DESIGN.md)、[宋代交接](song-review.md)、[明代复核](ming-content-review.md)、[世界复核](WORLD-CONTENT.md)。新增11章经过制作与独立内容复核，但尚未做真实儿童理解验证或正式史实终审。

主要修订：

- 《元日》说明桃符而非直接换成现代红纸春联；教学画省略板上文字，酒与爆竹只介绍旧俗。
- 《小池》材料定位到《诚斋集》卷七的江户初期抄本，非作者手稿；“尖尖角”是嫩荷叶，末步改找泉流，减少同一选项反复作答。
- 范成大诗稿在《石湖诗集》后世印本第8幅跨页核对；夜间插画玻璃灯改为陶质油灯，旧版保留。
- 文徵明《芭蕉槛》诗页按原迹核为“秋声入枕凉”；把雨声明确说成一种现代读诗联想，不作为“秋声”的唯一解释。
- 《石灰吟》按教育局通行选篇读诗，保留署名、异文与写作年代的讨论；不编少年作诗现场，不提供烧制或敲击活动。末步分别确认颜色与品格，不以衣服或皮肤颜色判断人。
- 手稿讲课图采用柏林馆当前身份记录，明确是14世纪画家想象亚里士多德授课；相关旧研究表述同步修正，不把画作当课堂实录。
- 世界史按独立地区和年代分组；大津巴布韦的外来物品不被用于推断外来人建城，圆锥塔用途保留不确定性。
- 选项与选中图共用登记取景，运行图保留1536像素长边。手写书插画定点编辑为v2，移除会被选项裁成半脸的背景人物，保留抄写与装订动作。

诗文依据包括[教育局《元日》](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS1_17.pdf)、[《小池》](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS1_18.pdf)、[《画鸡》](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS1_19.pdf)、[《石灰吟》](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS2_18.pdf)，以及[大都会文徵明1551年图诗册](https://www.metmuseum.org/art/collection/search/39654)。宋与并立政权的关系参考[国博陈列资料](https://www.chnmuseum.cn/portals/0/web/zt/gudai/detail7.html)。各章具体来源ID、原文位置与照片许可在源稿和素材登记内分别维护。

最终图片使用内置imagegen制作，原图、弃用旧版与实际提示词均保存项目，未采用CLI/API替代流程：

- [宋代素材与提示词记录](../../../reference-assets/song-poetry-expansion/ATTRIBUTION.md)
- [明代素材与提示词记录](../../../reference-assets/ming-poetry-expansion/ATTRIBUTION.md)
- [世界素材与提示词记录](../../../reference-assets/2026-10-28-world-expansion/ATTRIBUTION.md)

## 工程与离线检查

| 检查 | 结果与证据 |
| --- | --- |
| 严格素材、完整内容 | 121章通过；[日志](assets-final.log) |
| 运行包与全库结构 | 完整121章605步、当前59章295步通过；[日志](content-pack.log) |
| 完整测试 | 103/103通过，包含新章可听前提、完整诗文入口、宋站名称与进度兼容；[日志](test-final.log) |
| lint / App类型 / diff | 均通过；[lint](lint-final.log)、[类型](typecheck-final.log) |
| 增量声音 | edge-tts生成494段成功；全库4084段，清单与台词逐条一致，未声称逐条人耳校听；[日志](voice-update.log) |
| Mac构建安装 | `npm run mac:install`完成；标识`com.jexceed.historytrip`，本地临时签名验证通过；[日志](mac-install-final.log) |
| 安装内容一致 | 构建、release、Applications三个二进制SHA-256相同；[记录](install-verification.json) |
| 离线包 | 59章、13站、2752段声音、3660个文件齐备，与源输入逐项哈希一致；[记录](offline-assets.json) |
| 旧记录 | 安装前后存储JSON一致，19个整章标记与登鹳雀楼继续位置保留；[安装前](storage-before.json)、[安装后](storage-after-install.json) |

初轮测试在语音暂存期间运行，曾发现声音清单未切换；在全部语音完成后重跑，103项全部通过。其他检查发现并修正了新章年代卡误标插画选项、三张新开放照片把编辑像素说明带进家长层、素材复用登记与长稿编号等问题。保留失败日志供核对，不把它们计入最终通过。

家长独立的文化说明区允许完整原文、意译及材料边界（每条最多240字），儿童原有大字与首屏上限保持。单篇权威原始馆藏或教育资料完整支持一个课本联系时可独立登记，所有引用ID与素材许可仍逐项校验，不以凑来源数量替代证据质量。

## 原制作轮真实App验收状态（后续已完成，见上方收尾QA）

本轮最初实测的窗口为1512×871逻辑像素，内容1512×839；未增加多端矩阵。尺寸证据见[记录](app-target.json)。

宋站名版已经实际退出、重开、打开时间地图和宋朝站：标题“宋朝”、960—1279年、并立政权故事均可见；原继续入口与完整存储保留。见[实测记录](station-native-check.json)、[原尺寸截图](station-original-size.jpg)。

进入59章版实机验收时，CUA返回：`The Mac is locked and automatic unlock could not unlock it. Ask the user to unlock the Mac manually before continuing.` 已请求用户手动解锁，未尝试绕过，也未使用网页替代验收。见[阻断记录](native-blocker.json)。

解锁后必须先退出旧进程，再从`/Applications/小小历史旅行团.app`重开最终版本，恢复上述目标尺寸，然后验证新11章55步的画面、答案前提、重试、找图多轮、选中大图、材料与家长全文、声音控制、结束去向。每次反馈后、下一次动作前核对主按钮完整可见；最后退出重开验证记录。

真实儿童共玩、全量人工校听、全库史实终审与内容冻结继续独立待办。本轮未提交或推送，原有未提交工作已保留。
