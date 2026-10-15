#!/bin/bash
cd "$(dirname "$0")"
echo "正在更新并启动公考选岗助手…"
git pull origin main 2>/dev/null || true
if ! command -v npm >/dev/null; then
  echo "未找到 npm，请先安装 Node.js: https://nodejs.org/"
  read -r -p "按回车关闭…"
  exit 1
fi
npm install --no-fund --no-audit 2>/dev/null
npm run pick
