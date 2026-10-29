# 明代诗词人物三章素材登记

核对日期：2026-10-28；项目角色、原诗与现代教学情境分别登记。

## 真实材料

- `tang-yin-portrait-1743.jpg`：清代华嵒1743年《唐寅像》局部，原作史密森尼弗利尔美术馆F1981.26。生平与作品年代取[馆方条目](https://asia.si.edu/explore-art-culture/collections/search/edanmdm%3Afsg_F1981.26/)。图像直接取[Commons开放文件](https://commons.wikimedia.org/wiki/File:Tang_Yin_Portrait_Detail.jpg)，标记PD-Art/Public Domain；未使用馆站声明受限的媒体下载。365×522原样保存，只作完整人物认识，不作辨字和局部放大。
- `yu-qian-portrait-gu-jianlong.jpg`：清代顾见龙后世于谦像，17世纪。取[Commons开放文件](https://commons.wikimedia.org/wiki/File:Yu_Qian_by_Gu_Jianlong.jpg)，标记PD-old-70-expired/Public Domain。文件引中国历史博物馆保管部编《中国历代名人画像谱》第一册，第173页（2003）。文件页只支持图像身份与许可；于谦生平和诗文事实另取教育局资源。
- `DP235630.jpg`：文徵明1551年《拙政园图诗》册中的《芭蕉槛》画页；`DP235631.jpg`为对应诗页。藏[大都会艺术博物馆](https://www.metmuseum.org/art/collection/search/39654)，Gift of Douglas Dillon, 1979，1979.458.1a–ii。馆方API `isPublicDomain=true`，遵循[Met Open Access CC0](https://www.metmuseum.org/hubs/open-access)。原图完整保留，运行仅缩放压缩。
- `DP235620.jpg`—`DP235637.jpg`其余页为研究比对下载，不进入运行包。用途是定位诗画配对、核读原文，未将其他园景误称芭蕉槛。DP235630/31已逐图目视检查；诗页实际写“秋声入枕凉”，不采用网络转录的“飘”。

两幅人物像都是晚于本人时代的画像；不冒充生前照片。文徵明画页是真实作品，却不是园林测绘或今日现状。儿童不需要认出书法小字。

## 现代读诗情境

以下三张均由项目使用内置imagegen工具生成，项目自制教学插画，供本项目使用，原图1536×1024。没有使用API/CLI，不含外来史料拼贴。

- `rooster-story-v1.png`；实际提示词`rooster-story-v1.prompt.txt`。输出原留 `/Users/chiang/.codex/generated_images/01a18250-d291-7950-bd35-ade5b76032bc/exec-a279f962-a91d-4b48-8101-bc54ffb44daa.png`。
- `garden-story-v1.png`；实际提示词`garden-story-v1.prompt.txt`。输出原留 `/Users/chiang/.codex/generated_images/01a18250-d291-7950-bd35-ade5b76032bc/exec-715faf8a-cbc9-437b-9d67-4811ea84b62a.png`。
- `lime-story-v1.png`；实际提示词`lime-story-v1.prompt.txt`。输出原留 `/Users/chiang/.codex/generated_images/01a18250-d291-7950-bd35-ade5b76032bc/exec-3d79219d-0d89-417a-8d98-f8e6f661bdbb.png`。

生成前看过`reference-assets/poetry-world-poetry/chunxiao-story-v1.png`并依照其角色与情境层次设计提示词。此参考未作为图片编辑输入，三张均为新生成。黄衣男孩翘发无眼镜，绿衣男孩圆框眼镜与齐刘海，女孩高马尾与花夹；图中他们均是现代虚构儿童。

逐图检查：鸡叫/啄米/开门清晨不同；雨天叶子与晴天叶影不同；归还笔盒与擦去鞋泥不同。石灰章没有火焰、敲碎或身体伤害画面，也不提供石灰实验。各图白色分格线位置不同，因此分别登记crop；选项卡与选中大图用相同裁取。runtimeMaxEdge=1536，保留每格有效约758×500像素，不用整图默认900px缩图后再放大半格。
