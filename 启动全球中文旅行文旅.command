#!/bin/bash
cd "$(dirname "$0")"
echo "全球中文旅行文旅 — 一键打开"
if ! command -v npm >/dev/null; then
  echo "请先安装 Node.js: https://nodejs.org/"
  read -r -p "按回车关闭…"
  exit 1
fi
npm install --no-fund --no-audit 2>/dev/null
npm run travel
