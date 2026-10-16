#!/usr/bin/env node
/** 用已生成的 dist/ 在固定端口提供站点，并打开 http://localhost:5174/ */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const PORT = process.env.TRAVEL_PORT || '5174'
const URL = `http://127.0.0.1:${PORT}/`
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('还没有 dist/，请先运行：npm run travel:build')
  process.exit(1)
}

function openBrowser(url) {
  if (process.platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore', detached: true }).unref()
  } else if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', detached: true }).unref()
  } else {
    spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref()
  }
}

async function waitForServer(maxMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(URL, { method: 'HEAD' })
      if (res.ok) return true
    } catch {
      /* retry */
    }
    await sleep(300)
  }
  return false
}

console.log(`正在打开 ${URL}（静态 dist/）…`)
const child = spawn(
  'npm',
  ['run', 'preview', '--', '--host', '127.0.0.1', '--port', PORT],
  { cwd: root, stdio: 'inherit', shell: false },
)

child.on('exit', (code) => process.exit(code ?? 0))
process.on('SIGINT', () => child.kill('SIGINT'))

const ok = await waitForServer()
if (ok) {
  openBrowser(URL)
  console.log('\n浏览器应已打开；关本窗口（Ctrl+C）即停止。\n')
} else {
  console.log(`请手动打开：${URL}\n`)
}
