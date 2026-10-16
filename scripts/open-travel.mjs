#!/usr/bin/env node
/** 一键启动文旅站并打开浏览器（开发模式，改代码即热更新） */
import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const PORT = process.env.TRAVEL_PORT || '5173'
const HOST = process.env.TRAVEL_HOST || '0.0.0.0'
const URL = `http://127.0.0.1:${PORT}/`

function lanUrls() {
  const nets = os.networkInterfaces()
  const urls = []
  for (const list of Object.values(nets)) {
    if (!list) continue
    for (const ni of list) {
      const v4 = ni.family === 'IPv4' || ni.family === 4
      if (!v4 || ni.internal) continue
      urls.push(`http://${ni.address}:${PORT}/`)
    }
  }
  return urls
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

async function waitForServer(maxMs = 25000) {
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

console.log('正在启动全球中文旅行文旅…')
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const child = spawn(
  'npm',
  ['run', 'dev', '--', '--host', HOST, '--port', PORT],
  { stdio: 'inherit', cwd: root, shell: false },
)

child.on('exit', (code) => process.exit(code ?? 0))
process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))

;(async () => {
  const ok = await waitForServer()
  if (ok) {
    console.log('\n—— 本机 ——')
    console.log(URL)
    console.log(`应用：${URL}travel`)
    const lan = lanUrls()
    if (HOST === '0.0.0.0' && lan.length) {
      console.log('\n—— 局域网 ——')
      for (const u of lan) console.log(u)
    }
    console.log('\n按 Ctrl+C 停止\n')
    openBrowser(URL)
  } else {
    console.warn(`\n请手动打开：${URL}\n`)
  }
})()
