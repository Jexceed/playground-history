#!/bin/zsh

set -e

HISTORY_APP_PATH="/Applications/小小历史旅行团.app"

if [[ ! -d "$HISTORY_APP_PATH" ]]; then
  echo "尚未安装《小小历史旅行团》。请在项目目录运行 npm run mac:install 后重试。"
  exit 1
fi

HISTORY_APP_ID=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$HISTORY_APP_PATH/Contents/Info.plist")
if [[ "$HISTORY_APP_ID" != "com.jexceed.historytrip" ]]; then
  echo "同名应用不属于本项目，已停止启动。"
  exit 1
fi

open "$HISTORY_APP_PATH"
