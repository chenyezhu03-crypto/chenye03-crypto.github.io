/**
 * 将「27国考岗位表【合并版】.xlsx」转为前端可用的 JSON。
 * 用法: node scripts/import-guokao2027.mjs [xlsx路径]
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const input =
  process.argv[2] ||
  path.join(
    process.env.HOME || '',
    '.cursor/projects/workspace/uploads/27___________5778.xlsx',
  )

const wb = XLSX.readFile(input)
const sheet = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

const headerRow = rows.find(
  (r) => Array.isArray(r) && r[0] === '部门代码' && r[4] === '招考职位',
)
if (!headerRow) {
  console.error('未找到表头行（部门代码 / 招考职位）')
  process.exit(1)
}

const headerIndex = rows.indexOf(headerRow)
const dataRows = rows.slice(headerIndex + 1)

function cell(v) {
  if (v == null) return ''
  return String(v).replace(/\s+/g, ' ').trim()
}

function workCity(location) {
  const loc = cell(location)
  if (!loc) return '北京'
  const m = loc.match(/^(.+?[省市自治区])/)
  return m ? m[1].replace(/省$|市$|自治区$/, (x) => x) : loc.slice(0, 6)
}

const items = []
for (const row of dataRows) {
  if (!row || !row.length) continue
  const deptCode = cell(row[0])
  const positionCode = cell(row[8])
  if (!deptCode || !positionCode) continue

  const deptName = cell(row[1])
  const bureau = cell(row[2])
  const positionName = cell(row[4])
  const major = cell(row[12])
  const education = cell(row[13])
  const degree = cell(row[14])
  const political = cell(row[15])
  const grassroots = cell(row[16])
  const serviceProject = cell(row[17])
  const workLocation = cell(row[20])
  const remark = cell(row[23])
  const intro = cell(row[7])
  const examCategory = cell(row[10])
  const headcount = cell(row[11])

  const requirementParts = [
    education ? `${education}` : '',
    degree ? `${degree}` : '',
    major ? `专业：${major}` : '',
    political && political !== '不限' ? `政治面貌：${political}` : '',
    grassroots && grassroots !== '无限制'
      ? `基层工作最低年限：${grassroots}`
      : '',
    serviceProject && serviceProject !== '无限制'
      ? `服务基层项目：${serviceProject}`
      : '',
    remark ? `备注：${remark}` : '',
  ].filter(Boolean)

  const requirementText = requirementParts.join('；')

  const city = workCity(workLocation)
  const externalId = positionCode

  items.push({
    sourceId: 'guokao',
    sourceName: '2027国考职位表',
    externalId,
    title: positionName,
    company: deptName + (bureau ? ` · ${bureau}` : ''),
    city,
    district: workLocation,
    type: `公务员 · 国考 · ${examCategory || '综合管理类'}`,
    salary: headcount ? `招考 ${headcount} 人` : '按国家统一工资制度',
    tags: [
      examCategory || '国考',
      political !== '不限' && political ? political : null,
      grassroots !== '无限制' && grassroots ? `基层${grassroots}` : null,
    ].filter(Boolean),
    postedAt: '2026-10-14',
    description: intro || `${deptName}${positionName}（职位代码 ${positionCode}）`,
    requirementText,
    applyUrl: 'http://bm.scs.gov.cn/pp/gkweb/core/web/ui/business/home/gkhome.html',
    meta: {
      deptCode,
      positionCode,
      bureau,
      orgNature: cell(row[3]),
      positionAttr: cell(row[5]),
      positionDistribution: cell(row[6]),
      orgLevel: cell(row[9]),
      headcount,
      interviewRatio: cell(row[19]),
      settleLocation: cell(row[21]),
      deptWebsite: cell(row[24]),
      phones: [cell(row[25]), cell(row[26]), cell(row[27])].filter(Boolean),
    },
  })
}

const outDir = path.join(root, 'public/data')
await mkdir(outDir, { recursive: true })
const outPath = path.join(outDir, 'guokao2027-positions.json')
const payload = {
  version: 1,
  title: '2027国考岗位表（合并版）',
  importedAt: new Date().toISOString(),
  count: items.length,
  items,
}
await writeFile(outPath, JSON.stringify(payload), 'utf8')
console.log(`Wrote ${items.length} positions → ${outPath}`)
console.log(`Size: ${(JSON.stringify(payload).length / 1024 / 1024).toFixed(2)} MiB`)
