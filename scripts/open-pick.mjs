#!/usr/bin/env node
/**
 * 一键启动选岗助手并在本机打开浏览器（macOS / Linux / Windows）
 */
import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const PORT = process.env.PICK_PORT || '5173'
/** 0.0.0.0 = 本机 + 局域网（手机同 WiFi 可访问） */
const HOST = process.env.PICK_HOST || '0.0.0.0'
const URL = `http://127.0.0.1:${PORT}/pick`

function lanUrls(): string[] {
  const nets = os.networkInterfaces()
  const urls: string[] = []
  for (const list of Object.values(nets)) {
    if (!list) continue
    for (const ni of list) {
      if (ni.family !== 'IPv4' || ni.internal) continue
      urls.push(`http://${ni.address}:${PORT}/pick`)
    }
  }
  return urls
}

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
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const child = spawn(
  'npm',
  ['run', 'dev', '--', '--host', HOST, '--port', PORT, '--strictPort'],
  { stdio: 'inherit', cwd: root, shell: false },
)

child.on('exit', (code) => process.exit(code ?? 0))

process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))

;(async () => {
  const ok = await waitForServer()
  if (ok) {
    console.log('\n—— 本机浏览器 ——')
    console.log(URL)
    const lan = lanUrls()
    if (HOST === '0.0.0.0' && lan.length) {
      console.log('\n—— 局域网（手机 / 平板同一 WiFi）——')
      for (const u of lan) console.log(u)
    }
    console.log('\n按 Ctrl+C 停止服务\n')
    openBrowser(URL)
  } else {
    console.warn(`\n服务启动较慢，请手动打开：${URL}\n`)
  }
})()
