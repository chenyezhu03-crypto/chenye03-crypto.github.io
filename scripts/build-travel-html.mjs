#!/usr/bin/env node
/**
 * 生成「一个 HTML 文件」，双击即可在浏览器打开，不需要 npm run dev / localhost。
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distIndex = path.join(root, 'dist', 'index.html')
const outDir = path.join(root, 'release')
const outFile = path.join(outDir, '全球中文旅行文旅-双击打开.html')

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: root, stdio: 'inherit', shell: false })
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))))
  })
}

console.log('正在打包成单个 HTML（约 1–2 分钟）…')
await run('npm', ['run', 'build'])

if (!fs.existsSync(distIndex)) {
  console.error('构建失败：找不到 dist/index.html')
  process.exit(1)
}

fs.mkdirSync(outDir, { recursive: true })
fs.copyFileSync(distIndex, outFile)

console.log('\n✓ 完成！请用浏览器双击打开：\n')
console.log(outFile)
console.log('\n无需 localhost，无需终端。Safari / Chrome 均可。\n')

if (process.platform === 'darwin') {
  spawn('open', [outFile], { stdio: 'ignore', detached: true }).unref()
}
