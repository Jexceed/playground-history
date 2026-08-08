#!/bin/zsh

set -e

PROJECT_DIR="${0:A:h}"
PREVIEW_PORT=4173

while lsof -iTCP:"$PREVIEW_PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PREVIEW_PORT=$((PREVIEW_PORT + 1))
done

PREVIEW_URL="http://127.0.0.1:$PREVIEW_PORT"

cd "$PROJECT_DIR"
clear
echo "正在准备《小小历史旅行团》本机试玩版……"
echo "第一次启动会稍等一会儿，请不要关闭这个窗口。"

npm run build

(
  for ATTEMPT in {1..80}; do
    if curl --silent --fail --output /dev/null "$PREVIEW_URL"; then
      open "$PREVIEW_URL"
      exit 0
    fi
    sleep 0.25
  done
) &

echo ""
echo "试玩地址：$PREVIEW_URL"
echo "试玩结束后，回到这个窗口按 Control + C 即可停止。"
echo ""

npm run start -- --port "$PREVIEW_PORT"
