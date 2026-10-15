#!/usr/bin/env node
/**
 * 一键启动选岗助手并在本机打开浏览器（macOS / Linux / Windows）
 */
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const PORT = process.env.PICK_PORT || '5173'
const HOST = process.env.PICK_HOST || '127.0.0.1'
const URL = `http://${HOST}:${PORT}/pick`

function openBrowser(url) {
  const platform = process.platform
  if (platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore', detached: true }).unref()
  } else if (platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', detached: true }).unref()
  } else {
    spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref()
  }
}

async function waitForServer(maxMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(URL, { method: 'HEAD' })
      if (res.ok) return true
    } catch {
      /* retry */
    }
    await sleep(400)
  }
  return false
}

console.log('正在启动选岗助手…')
const vite = require.resolve('vite/bin/vite.js')
const child = spawn(
  process.execPath,
  [vite, '--host', HOST, '--port', PORT, '--strictPort'],
  {
    stdio: 'inherit',
    cwd: path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
  },
)

child.on('exit', (code) => process.exit(code ?? 0))

process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))

;(async () => {
  const ok = await waitForServer()
  if (ok) {
    console.log(`\n已打开：${URL}\n`)
    openBrowser(URL)
  } else {
    console.warn(`\n服务启动较慢，请手动打开：${URL}\n`)
  }
})()
