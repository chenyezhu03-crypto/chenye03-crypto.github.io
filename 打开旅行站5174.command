#!/bin/bash
cd "$(dirname "$0")"
if ! command -v npm >/dev/null; then
  echo "请先安装 Node.js"
  read -r -p "按回车关闭…"
  exit 1
fi
if [ ! -f dist/index.html ]; then
  echo "首次需要生成网页，请稍候…"
  npm install --no-fund --no-audit 2>/dev/null
  npm run travel:build
else
  npm run travel:serve
fi
