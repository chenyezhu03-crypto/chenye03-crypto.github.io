#!/usr/bin/env node
/**
 * 仅中国岗位汇聚：
 * 1) 腾讯官招公开 API（列表 + 详情任职要求）
 * 2) 开源 BOSS 样本 CSV（jhcoco/bosszp）
 * 用法：npm run crawl
 */
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../public/feeds/crawled-jobs.json')
const BOSS_CSV = path.join(__dirname, '../public/feeds/bosszp-hot-cities.csv')
const UA = {
  'User-Agent':
    'Mozilla/5.0 (compatible; toujian-cn-crawler/1.0; +local research)',
  Accept: 'application/json',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url) {
  const res = await fetch(url, { headers: UA })
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
  return res.json()
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  const headers = lines[0].split(',')
  return lines.slice(1).map((line) => {
    // naive CSV (dataset has no quoted commas in practice for these fields)
    const cols = line.split(',')
    const row = {}
    headers.forEach((h, i) => {
      row[h.trim()] = (cols[i] || '').trim()
    })
    return row
  })
}

async function ensureBossCsv() {
  try {
    await stat(BOSS_CSV)
    return
  } catch {
    // download once
  }
  const url =
    'https://raw.githubusercontent.com/jhcoco/bosszp/master/%E5%85%A8%E5%9B%BD-%E7%83%AD%E9%97%A8%E5%9F%8E%E5%B8%82%E5%B2%97%E4%BD%8D%E6%95%B0%E6%8D%AE.csv'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`bosszp csv HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(path.dirname(BOSS_CSV), { recursive: true })
  await writeFile(BOSS_CSV, buf)
}

function fromBossCsv(rows) {
  return rows
    .filter((r) => r.job_name && r.com_name)
    .map((r, i) => {
      const area = r.job_area || ''
      const city = area.split('·')[0] || '中国'
      const district = area.split('·')[1]
      const education = r.education || '不限'
      const years = r.work_year || '经验不限'
      const requirementText = [
        `岗位：${r.job_name}`,
        `公司：${r.com_name}（${r.com_type || ''} · ${r.com_size || ''} · ${r.finance_stage || ''}）`,
        `地点：${area}`,
        `薪资：${r.job_salary || '面议'}`,
        `经验：${years}`,
        `学历：${education}`,
        r.job_benefits ? `福利：${r.job_benefits}` : '',
        `任职要求摘要：${education}学历；工作经验${years}；欢迎相关专业背景候选人。`,
      ]
        .filter(Boolean)
        .join('\n')

      return {
        sourceId: 'bosszp-open',
        sourceName: 'BOSS开源样本',
        externalId: `bosszp-${i}-${r.job_name}`,
        title: r.job_name,
        company: r.com_name,
        city,
        district,
        type: '全职',
        salary: r.job_salary || '面议',
        tags: [r.com_type, education, years].filter(Boolean),
        postedAt: new Date().toISOString().slice(0, 10),
        description: `${r.com_name}招聘${r.job_name}，${area}，${r.job_salary || '薪资面议'}。`,
        requirementText,
        applyUrl: undefined,
      }
    })
}

async function fetchTencentList(pageSize = 100) {
  const first = await getJson(
    `https://careers.tencent.com/tencentcareer/api/post/Query?timestamp=${Date.now()}&keyword=&pageIndex=1&pageSize=${pageSize}&language=zh-cn&area=cn`,
  )
  if (first.Code !== 200) throw new Error('tencent list failed')
  const total = first.Data.Count || 0
  const pages = Math.ceil(total / pageSize)
  const posts = [...(first.Data.Posts || [])]
  console.log(`tencent list page 1/${pages}: ${posts.length}/${total}`)

  for (let page = 2; page <= pages; page++) {
    const data = await getJson(
      `https://careers.tencent.com/tencentcareer/api/post/Query?timestamp=${Date.now()}&keyword=&pageIndex=${page}&pageSize=${pageSize}&language=zh-cn&area=cn`,
    )
    const chunk = data.Data?.Posts || []
    posts.push(...chunk)
    console.log(`tencent list page ${page}/${pages}: +${chunk.length}`)
    await sleep(200)
  }
  return posts
}

async function mapPool(items, concurrency, worker) {
  const out = new Array(items.length)
  let i = 0
  async function run() {
    while (i < items.length) {
      const idx = i++
      out[idx] = await worker(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => run()))
  return out
}

async function fetchTencentDetails(posts) {
  let ok = 0
  let fail = 0
  const results = await mapPool(posts, 8, async (post, idx) => {
    try {
      const data = await getJson(
        `https://careers.tencent.com/tencentcareer/api/post/ByPostId?timestamp=${Date.now()}&postId=${post.PostId}&language=zh-cn`,
      )
      const d = data.Data || {}
      ok += 1
      if ((idx + 1) % 100 === 0) {
        console.log(`tencent details ${idx + 1}/${posts.length} ok=${ok} fail=${fail}`)
      }
      const requirement = d.Requirement || ''
      const responsibility = d.Responsibility || post.Responsibility || ''
      return {
        sourceId: 'tencent',
        sourceName: '腾讯官招',
        externalId: String(post.PostId),
        title: post.RecruitPostName,
        company: '腾讯',
        city: post.LocationName || '中国',
        type: '全职',
        salary: '面议',
        tags: [post.CategoryName, post.ProductName, post.BGName]
          .filter(Boolean)
          .slice(0, 6),
        postedAt: (post.LastUpdateTime || '')
          .replace(/年|月/g, '-')
          .replace(/日/g, '')
          .slice(0, 10),
        description: responsibility.slice(0, 240),
        requirementText: [
          requirement,
          responsibility ? `岗位职责：\n${responsibility}` : '',
          post.RequireWorkYearsName
            ? `经验标签：${post.RequireWorkYearsName}`
            : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
        applyUrl: post.PostURL,
      }
    } catch {
      fail += 1
      return null
    }
  })
  console.log(`tencent details done ok=${ok} fail=${fail}`)
  return results.filter(Boolean)
}

function dedupe(jobs) {
  const map = new Map()
  for (const job of jobs) map.set(`${job.sourceId}:${job.externalId}`, job)
  return Array.from(map.values())
}

console.log('CN crawl start…')
await ensureBossCsv()
const csvText = await readFile(BOSS_CSV, 'utf8')
const bossJobs = fromBossCsv(parseCsv(csvText))
console.log('bosszp csv:', bossJobs.length)

const posts = await fetchTencentList(100)
const tencentJobs = await fetchTencentDetails(posts)
console.log('tencent jobs:', tencentJobs.length)

const jobs = dedupe([...tencentJobs, ...bossJobs])
const payload = {
  crawledAt: new Date().toISOString(),
  region: 'CN',
  sources: {
    tencent: tencentJobs.length,
    'bosszp-open': bossJobs.length,
  },
  total: jobs.length,
  jobs,
}

await mkdir(path.dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(payload))
const info = await stat(OUT)
console.log(
  JSON.stringify(
    {
      file: OUT,
      total: jobs.length,
      sources: payload.sources,
      bytes: info.size,
      samples: jobs
        .slice(0, 6)
        .map((j) => `${j.sourceName}: ${j.company} · ${j.title} · ${j.city}`),
    },
    null,
    2,
  ),
)
