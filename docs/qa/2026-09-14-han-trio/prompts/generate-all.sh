#!/bin/zsh
# 生成三章的六张故事插画；每张只生成一次，失败即停并报告。
set -e
cd /Users/chiang/Documents/Projects/history
REFS=(-i reference-assets/homepage-ui/history-tour-river-v4-source.png -i reference-assets/qin-han/qin-workshop-story-v1.png -i reference-assets/qin-han/qin-friends-reunion-v3.png -i reference-assets/qin-han/qin-wall-site-story-v2.png)
for name in han-market-story-v1 han-market-friends-reunion-v1 silk-post-story-v1 silk-post-friends-reunion-v1 han-paper-workshop-story-v1 han-paper-friends-reunion-v1; do
  echo "=== $name ==="
  (cat "docs/qa/2026-09-14-han-trio/prompts/$name.txt"; echo " 只生成并保存这一张图到 reference-assets/qin-han/$name.png，不要修改仓库里任何其他文件。") \
    | /Applications/ChatGPT.app/Contents/Resources/codex exec -s workspace-write "${REFS[@]}" - 2>&1 | tail -3
done
echo "=== all done ==="; ls -la reference-assets/qin-han/ | grep -E "han-|silk-"