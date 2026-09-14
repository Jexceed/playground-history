# 本机试玩语音的现有流程

核对日期：2026-09-14。

## 当前游戏实际使用的方案

`history/scripts/generate-voices.mjs` 调用已有 Python 环境 `../playground/local-tts/.venv/bin/python` 中的 **edge-tts 7.2.8**。当前声音为 `zh-CN-XiaoxiaoNeural`，语速 `-12%`、音高 `+2Hz`，由 `content/voice-interface-lines.json` 管理。上一轮与本轮均调用该脚本，没有用GPT合成语音，也没有为每次修改另造生成器。

edge-tts在合成阶段访问在线语音服务；生成后的MP3放在 `public/audio/voice/`，游戏从本机播放。准确说法是“预生成音频，本机播放”，不能把它称为完全离线的本机模型推理。

## 日常更新

1. 修改 `content/focused-quests.json` 中的故事、问题、选项或反馈；公共口令改 `content/voice-interface-lines.json`。
2. 多音字或指定读音改 `content/voice-pronunciations.json`。完整词语校音只影响合成输入，不改儿童看见的原词，不对单字全局盲替换。
3. 运行 `npm run voice:update`。这是对现有内容打包和现有语音生成脚本的串联，不是一套新引擎。
4. 脚本复用文字和音色未变化的音频；只生成新增、修改或缺失的条目。全部新片段合成成功后，再替换暂存文件与更新清单。
5. 试玩新片段的播放、暂停、重听，并人工听辨重点读音。自动清单检查不能代替人耳校听。

生成清单 `public/audio/voice-lines.json`、`public/audio/voice/manifest.json` 和内容运行包均不得手工改。

## 本机另有F5-TTS

`../playground/local-tts` 还部署了 F5-TTS。README、GENERATION说明和模型文件均在；本轮确认F5基础模型与Vocos文件存在，但没有重新跑F5推理验收。该方案需要参考音频与准确参考文本，当前游戏没有使用它的声音包。

F5的文档见 `../playground/local-tts/GENERATION.md`，已有入口包括 `start-gradio.sh` 和 `synthesize.sh`。如果后续选定参考音色再改用F5，应单独验证样音与批量成本；现阶段复用当前游戏脚本更新短声音。729篇编辑长稿的1154段正式配音仍遵守文字和音色冻结要求。
