# 两个男孩的辨识度修订

2026-09-14。本轮只修改绿衣男孩：深棕圆框眼镜、透明镜片与平齐短刘海；黄衣男孩仍保留原蓬松翘短发，马尾女孩保持原造型。衣服、背包、动作、表情、主体构图与画风延续。

## 最终素材

使用内置imagegen做3次局部编辑，每张一次，无重试。原始旧图留档。

| 用途 | 项目源图 | 运行文件 | 实际完整提示词 |
| --- | --- | --- | --- |
| 长河主页 | [PNG 971×1620](/Users/chiang/Documents/Projects/history/reference-assets/homepage-ui/history-tour-river-v4-source.png) | [WebP](/Users/chiang/Documents/Projects/history/public/images/history-tour-river-v4.webp) | [提示词](prompts/homepage.txt) |
| 秦朝相聚 | [PNG 1536×1024](/Users/chiang/Documents/Projects/history/reference-assets/qin-han/qin-friends-reunion-v3.png) | [JPEG](/Users/chiang/Documents/Projects/history/public/content/step-images/qin-friends-reunion-v3.jpg) | [提示词](prompts/reunion.txt) |
| 分享图 | [PNG 1731×909](/Users/chiang/Documents/Projects/history/reference-assets/homepage-ui/history-tour-social-card-v4-source.png) | [PNG 1200×630](/Users/chiang/Documents/Projects/history/public/images/history-tour-social-v4.png) | [提示词](prompts/social.txt) |

主页源图比旧图高1像素，保留生成原图，未另行裁切。相聚图发顶保留少量自然发梢，主要发型轮廓与圆眼镜已能区分两位男孩。分享图的标题与副标题目视核对一致。未进行像素级不变量比对。

## 验证

目视核对三张图的角色、镜框与眼睛、场景和文字。浏览器检查桌面主页及390×844手机主页：绿衣男孩的圆镜和齐刘海在实际显示尺寸下清楚，黄衣男孩的无眼镜造型与翘发仍可区分。相聚图检查完整原图与生成后的运行文件；本轮只改图片，没有重复五步交互全流程。

题目与语音没有改写或重新合成。内容版本保持0.67.0；已核对语音源稿、读音规则、生成台词清单、音频清单及产品内容版本文件的SHA-256与修订前一致。全部旧完成记录的存储机制保持不变。

当前来源978条、素材971项、声音3010段。自动检查日志和结果在本目录。真实儿童识别度与用户最终体验仍待确认。

最终结果：严格素材检查、内容打包、构建、20项自动测试、lint和diff格式检查通过。桌面与手机主页已目视确认，临时窗口尺寸已重置。仅本机更新，未部署或提交。
