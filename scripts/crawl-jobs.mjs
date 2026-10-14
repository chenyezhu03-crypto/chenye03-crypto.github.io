#!/usr/bin/env node
/**
 * 中国岗位汇聚（大厂官招公开接口，无需登录）
 * - 腾讯官招
 * - 字节跳动官招（社招 + 校招）
 * - 京东官招（公开列表）
 * - BOSS 开源样本 CSV
 *
 * 用法：npm run crawl
 */
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../public/feeds/crawled-jobs.json')
const BOSS_CSV = path.join(__dirname, '../public/feeds/bosszp-hot-cities.csv')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function dedupe(jobs) {
  const map = new Map()
  for (const job of jobs) map.set(`${job.sourceId}:${job.externalId}`, job)
  return Array.from(map.values())
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  const headers = lines[0].split(',')
  return lines.slice(1).map((line) => {
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
  } catch {
    const url =
      'https://cdn.jsdelivr.net/gh/jhcoco/bosszp@master/全国-热门城市岗位数据.csv'
    const res = await fetch(url)
    if (!res.ok) throw new Error(`bosszp csv HTTP ${res.status}`)
    await mkdir(path.dirname(BOSS_CSV), { recursive: true })
    await writeFile(BOSS_CSV, Buffer.from(await res.arrayBuffer()))
  }
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
        requirementText: [
          `学历：${education}`,
          `经验：${years}`,
          r.job_benefits ? `福利：${r.job_benefits}` : '',
          `任职要求摘要：${education}学历；工作经验${years}；相关专业优先。`,
        ]
          .filter(Boolean)
          .join('\n'),
      }
    })
}

async function fetchTencent() {
  const pageSize = 100
  const first = await (
    await fetch(
      `https://careers.tencent.com/tencentcareer/api/post/Query?timestamp=${Date.now()}&keyword=&pageIndex=1&pageSize=${pageSize}&language=zh-cn&area=cn`,
    )
  ).json()
  const total = first.Data?.Count || 0
  const pages = Math.ceil(total / pageSize)
  const posts = [...(first.Data?.Posts || [])]
  console.log(`tencent list 1/${pages}: ${posts.length}/${total}`)
  for (let page = 2; page <= pages; page++) {
    const data = await (
      await fetch(
        `https://careers.tencent.com/tencentcareer/api/post/Query?timestamp=${Date.now()}&keyword=&pageIndex=${page}&pageSize=${pageSize}&language=zh-cn&area=cn`,
      )
    ).json()
    posts.push(...(data.Data?.Posts || []))
    console.log(`tencent list ${page}/${pages}`)
    await sleep(150)
  }

  const out = []
  let i = 0
  async function worker() {
    while (i < posts.length) {
      const idx = i++
      const post = posts[idx]
      try {
        const detail = await (
          await fetch(
            `https://careers.tencent.com/tencentcareer/api/post/ByPostId?timestamp=${Date.now()}&postId=${post.PostId}&language=zh-cn`,
          )
        ).json()
        const d = detail.Data || {}
        out.push({
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
          description: (d.Responsibility || post.Responsibility || '').slice(
            0,
            240,
          ),
          requirementText: [
            d.Requirement || '',
            d.Responsibility || post.Responsibility
              ? `岗位职责：\n${d.Responsibility || post.Responsibility}`
              : '',
            post.RequireWorkYearsName
              ? `经验标签：${post.RequireWorkYearsName}`
              : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
          applyUrl: post.PostURL,
        })
      } catch {
        /* skip */
      }
      if ((idx + 1) % 200 === 0) console.log(`tencent details ${idx + 1}`)
    }
  }
  await Promise.all(Array.from({ length: 8 }, () => worker()))
  console.log('tencent jobs', out.length)
  return out
}

async function fetchByteDance() {
  const jar = new Map()
  const store = (res) => {
    for (const c of res.headers.getSetCookie?.() || []) {
      const [kv] = c.split(';')
      const i = kv.indexOf('=')
      if (i > 0) jar.set(kv.slice(0, i), kv.slice(i + 1))
    }
  }
  const cookie = () =>
    [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')

  const H = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    Origin: 'https://jobs.bytedance.com',
    Referer: 'https://jobs.bytedance.com/experienced/position',
    'Content-Type': 'application/json',
  }

  const csrfRes = await fetch('https://jobs.bytedance.com/api/v1/csrf/token', {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ portal_entrance: 1 }),
  })
  store(csrfRes)
  const token = decodeURIComponent(jar.get('atsx-csrf-token') || '')
  if (!token) throw new Error('bytedance csrf missing')

  async function pull(recruitmentIds, maxItems) {
    const pageSize = 100
    const jobs = []
    let offset = 0
    let total = Infinity
    while (jobs.length < maxItems && offset < total) {
      const res = await fetch(
        'https://jobs.bytedance.com/api/v1/search/job/posts',
        {
          method: 'POST',
          headers: { ...H, Cookie: cookie(), 'x-csrf-token': token },
          body: JSON.stringify({
            keyword: '',
            limit: pageSize,
            offset,
            portal_type: 3,
            portal_entrance: 1,
            language: 'zh',
            recruitment_id_list: recruitmentIds,
          }),
        },
      )
      const data = await res.json()
      if (data.code !== 0) throw new Error(`bytedance ${data.message || res.status}`)
      total = data.data?.count ?? 0
      const rows = data.data?.job_post_list || []
      if (!rows.length) break
      for (const row of rows) {
        const cities = (row.city_list || [])
          .map((c) => c.name)
          .filter(Boolean)
        jobs.push({
          sourceId: 'bytedance',
          sourceName: '字节跳动官招',
          externalId: String(row.id),
          title: row.title,
          company: '字节跳动',
          city: cities[0] || row.city_info?.name || '中国',
          type: row.recruit_type?.parent?.name || row.recruit_type?.name || '全职',
          salary: '面议',
          tags: [
            row.job_category?.name,
            row.job_category?.parent?.name,
            row.recruit_type?.name,
          ].filter(Boolean),
          postedAt: row.publish_time
            ? new Date(Number(row.publish_time)).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          description: String(row.description || '').slice(0, 240),
          requirementText: [
            row.requirement || '',
            row.description ? `岗位描述：\n${row.description}` : '',
            cities.length ? `工作城市：${cities.join(' / ')}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
          applyUrl: `https://jobs.bytedance.com/experienced/position/${row.id}`,
        })
      }
      console.log(
        `bytedance ${recruitmentIds.join('+')} offset=${offset} +${rows.length} total=${jobs.length}/${total}`,
      )
      offset += pageSize
      await sleep(200)
    }
    return jobs
  }

  // 社招拉取上限 2500，校招尽量拉全
  const social = await pull(['101'], 2500)
  const campus = await pull(['201'], 3000)
  const all = dedupe([...social, ...campus])
  console.log('bytedance jobs', all.length)
  return all
}

async function fetchJD() {
  // 公开列表目前稳定返回热门岗；保留接入，便于后续扩分页
  const res = await fetch('https://zhaopin.jd.com/web/job/job_list', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pageIndex: 1, pageSize: 50 }),
  })
  const rows = await res.json()
  if (!Array.isArray(rows)) return []
  return rows.map((row) => ({
    sourceId: 'jd',
    sourceName: '京东官招',
    externalId: String(row.positionId || row.id || row.reqNumber),
    title: row.positionNameOpen || row.positionName,
    company: '京东',
    city: row.workCity || '中国',
    type: '全职',
    salary: '面议',
    tags: [row.jobType, row.positionDeptName].filter(Boolean),
    postedAt: row.formatPublishTime || new Date().toISOString().slice(0, 10),
    description: String(row.workContent || '').slice(0, 240),
    requirementText: [
      row.qualification || '',
      row.workContent ? `岗位职责：\n${row.workContent}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    applyUrl: row.reqNumber
      ? `https://zhaopin.jd.com/web/job/job_detail?jobId=${row.positionId}`
      : undefined,
  }))
}

console.log('CN multi-source crawl start…')
await ensureBossCsv()
const bossJobs = fromBossCsv(parseCsv(await readFile(BOSS_CSV, 'utf8')))
console.log('bosszp', bossJobs.length)

const settled = await Promise.allSettled([
  fetchTencent(),
  fetchByteDance(),
  fetchJD(),
])

const names = ['tencent', 'bytedance', 'jd']
const sources = { 'bosszp-open': bossJobs.length }
const merged = [...bossJobs]
settled.forEach((result, i) => {
  const name = names[i]
  if (result.status === 'fulfilled') {
    sources[name] = result.value.length
    merged.push(...result.value)
    console.log(name, 'ok', result.value.length)
  } else {
    sources[name] = 0
    console.error(name, 'fail', result.reason?.message || result.reason)
  }
})

const jobs = dedupe(merged)
const payload = {
  crawledAt: new Date().toISOString(),
  region: 'CN',
  sources,
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
      sources,
      bytes: info.size,
      samples: jobs
        .slice(0, 8)
        .map((j) => `${j.sourceName}: ${j.company} · ${j.title} · ${j.city}`),
    },
    null,
    2,
  ),
)
