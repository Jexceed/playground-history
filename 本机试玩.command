#!/bin/zsh

set -e

PROJECT_DIR="${0:A:h}"
PREVIEW_PORT=4173

cd "$PROJECT_DIR"

# 旧试玩窗口会继续读取它启动时的静态资源清单。再次启动前，只停止本项目
# 在试玩端口上遗留的 vinext 服务，保证4173永远指向刚刚构建的版本。
for OLD_PORT in {4173..4199}; do
  for OLD_PID in $(lsof -tiTCP:"$OLD_PORT" -sTCP:LISTEN 2>/dev/null); do
    OLD_COMMAND=$(ps -p "$OLD_PID" -o command= 2>/dev/null || true)
    if [[ "$OLD_COMMAND" == *"$PROJECT_DIR/node_modules/.bin/vinext start --port $OLD_PORT"* ]]; then
      kill "$OLD_PID" 2>/dev/null || true
      for WAIT_COUNT in {1..20}; do
        kill -0 "$OLD_PID" 2>/dev/null || break
        sleep 0.1
      done
    fi
  done
done

if lsof -iTCP:"$PREVIEW_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "4173端口正在被其他应用使用，改用下一个空闲端口。"
  while lsof -iTCP:"$PREVIEW_PORT" -sTCP:LISTEN >/dev/null 2>&1; do
    PREVIEW_PORT=$((PREVIEW_PORT + 1))
  done
fi

PREVIEW_VERSION=$(date +%Y%m%d%H%M%S)
PREVIEW_URL="http://127.0.0.1:$PREVIEW_PORT/?version=$PREVIEW_VERSION"
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
