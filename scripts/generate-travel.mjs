#!/usr/bin/env node
/**
 * 直接生成旅行站静态文件（dist/），并本地预览打开浏览器。
 * 生成物在 dist/，可整包拷贝到你的服务器或 OSS。
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const PORT = process.env.TRAVEL_PREVIEW_PORT || '4173'
const URL = `http://127.0.0.1:${PORT}/`

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: root, stdio: 'inherit', shell: false })
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))))
  })
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

console.log('① 正在生成静态网页（npm run build）…')
await run('npm', ['run', 'build'])
console.log('\n✓ 已生成到 dist/ 目录，可直接上传部署。\n')

console.log('② 启动本地预览…')
const preview = spawn(
  'npm',
  ['run', 'preview', '--', '--host', '127.0.0.1', '--port', PORT],
  { cwd: root, stdio: 'inherit', shell: false },
)

preview.on('exit', (code) => process.exit(code ?? 0))
process.on('SIGINT', () => preview.kill('SIGINT'))

const ok = await waitForServer()
if (ok) {
  console.log(`\n预览：${URL}`)
  console.log('按 Ctrl+C 停止预览\n')
  openBrowser(URL)
} else {
  console.log(`\n预览未就绪，可手动：npm run preview -- --port ${PORT}\n`)
}
