#!/usr/bin/env node
/**
 * 中国岗位汇聚（大厂官招公开接口，无需登录）
 * - 腾讯 / 字节 / 京东
 * - 飞书 ATS 租户：小米、蔚来、理想、小鹏、智谱、智元、商汤、莉莉丝
 * - 美团 / 网易 / 滴滴
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
    await sleep(120)
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

async function fetchFeishuTenant({
  sourceId,
  sourceName,
  company,
  host,
  applyPath = 'experienced/position',
  maxItems = 800,
}) {
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

  const origin = `https://${host}`
  const H = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    Origin: origin,
    Referer: `${origin}/${applyPath}`,
    'Content-Type': 'application/json',
  }

  const csrfRes = await fetch(`${origin}/api/v1/csrf/token`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ portal_entrance: 1 }),
  })
  store(csrfRes)
  const token = decodeURIComponent(jar.get('atsx-csrf-token') || '')
  if (!token) throw new Error(`${sourceId} csrf missing`)

  const pageSize = 100
  const jobs = []
  let offset = 0
  let total = Infinity
  while (jobs.length < maxItems && offset < total) {
    const res = await fetch(`${origin}/api/v1/search/job/posts`, {
      method: 'POST',
      headers: { ...H, Cookie: cookie(), 'x-csrf-token': token },
      body: JSON.stringify({
        keyword: '',
        limit: pageSize,
        offset,
        portal_type: 3,
        portal_entrance: 1,
        language: 'zh',
      }),
    })
    const data = await res.json()
    if (data.code !== 0) {
      throw new Error(`${sourceId} ${data.message || res.status}`)
    }
    total = data.data?.count ?? 0
    const rows = data.data?.job_post_list || []
    if (!rows.length) break
    for (const row of rows) {
      if (jobs.length >= maxItems) break
      const cities = (row.city_list || []).map((c) => c.name).filter(Boolean)
      jobs.push({
        sourceId,
        sourceName,
        externalId: String(row.id),
        title: row.title,
        company,
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
        applyUrl: `${origin}/${applyPath}/${row.id}/detail`,
      })
    }
    console.log(
      `${sourceId} offset=${offset} +${rows.length} total=${jobs.length}/${total}`,
    )
    offset += pageSize
    await sleep(160)
  }
  console.log(`${sourceId} jobs`, jobs.length)
  return jobs
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
      if (data.code !== 0) {
        throw new Error(`bytedance ${data.message || res.status}`)
      }
      total = data.data?.count ?? 0
      const rows = data.data?.job_post_list || []
      if (!rows.length) break
      for (const row of rows) {
        const cities = (row.city_list || []).map((c) => c.name).filter(Boolean)
        jobs.push({
          sourceId: 'bytedance',
          sourceName: '字节跳动官招',
          externalId: String(row.id),
          title: row.title,
          company: '字节跳动',
          city: cities[0] || row.city_info?.name || '中国',
          type:
            row.recruit_type?.parent?.name || row.recruit_type?.name || '全职',
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
      await sleep(160)
    }
    return jobs
  }

  const all = dedupe([
    ...(await pull(['101'], 2500)),
    ...(await pull(['201'], 3000)),
  ])
  console.log('bytedance jobs', all.length)
  return all
}

async function fetchJD() {
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

async function fetchMeituan(maxItems = 1200) {
  const origin = 'https://zhaopin.meituan.com'
  const headers = {
    'Content-Type': 'application/json',
    Origin: origin,
    Referer: `${origin}/web/social`,
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
  }
  const pageSize = 50
  const ids = []
  for (const jobType of ['1', '2', '3']) {
    let page = 1
    while (ids.length < maxItems) {
      const body = {
        page: { pageNo: page, pageSize },
        jobShareType: '1',
        keywords: '',
        cityList: [],
        department: [],
        jobType: [{ code: jobType, subCode: [] }],
      }
      const res = await fetch(`${origin}/api/official/job/getJobList`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      const data = await res.json()
      const rows = data?.data?.list || []
      if (!rows.length) break
      for (const row of rows) {
        if (ids.length >= maxItems) break
        ids.push({
          jobUnionId: String(row.jobUnionId),
          jobType: String(row.jobType || jobType),
          name: row.name,
          city: row.cityList?.[0]?.name || '中国',
          family: row.jobFamily,
          group: row.jobFamilyGroup,
        })
      }
      const totalPage = data?.data?.page?.totalPage || page
      console.log(
        `meituan type=${jobType} page=${page}/${totalPage} collected=${ids.length}`,
      )
      if (page >= totalPage) break
      page++
      await sleep(120)
    }
  }

  const out = []
  let i = 0
  async function worker() {
    while (i < ids.length) {
      const idx = i++
      const item = ids[idx]
      try {
        const res = await fetch(`${origin}/api/official/job/getJobDetail`, {
          method: 'POST',
          headers: {
            ...headers,
            Referer: `${origin}/web/position/detail?jobUnionId=${item.jobUnionId}`,
          },
          body: JSON.stringify({ jobUnionId: item.jobUnionId }),
        })
        const data = await res.json()
        const d = data?.data || {}
        const highlight = item.jobType === '3' ? 'social' : 'campus'
        out.push({
          sourceId: 'meituan',
          sourceName: '美团官招',
          externalId: item.jobUnionId,
          title: d.name || item.name,
          company: '美团',
          city: d.cityList?.[0]?.name || item.city,
          type: item.jobType === '3' ? '社招' : item.jobType === '2' ? '实习' : '校招',
          salary: '面议',
          tags: [d.jobFamily || item.family, d.jobFamilyGroup || item.group].filter(
            Boolean,
          ),
          postedAt: (d.refreshTime || d.firstPostTime || '')
            .toString()
            .slice(0, 10),
          description: String(d.jobDuty || d.desc || '').slice(0, 240),
          requirementText: [
            d.jobRequirement || '',
            d.jobDuty ? `岗位职责：\n${d.jobDuty}` : '',
            d.workYear ? `经验标签：${d.workYear}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
          applyUrl: `${origin}/web/position/detail?jobUnionId=${item.jobUnionId}&jobShareType=1&highlightType=${highlight}`,
        })
      } catch {
        /* skip */
      }
      if ((idx + 1) % 100 === 0) console.log(`meituan details ${idx + 1}`)
    }
  }
  await Promise.all(Array.from({ length: 6 }, () => worker()))
  console.log('meituan jobs', out.length)
  return out
}

async function fetchNetease(maxItems = 1500) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
    Referer: 'https://hr.163.com/',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  }
  const jobs = []
  for (const workType of ['0', '1']) {
    let page = 1
    while (jobs.length < maxItems) {
      const res = await fetch(
        'https://hr.163.com/api/hr163/position/queryPage',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            currentPage: page,
            pageSize: 50,
            workType,
          }),
        },
      )
      const data = await res.json()
      const rows = data?.data?.list || []
      if (!rows.length) break
      for (const row of rows) {
        if (jobs.length >= maxItems) break
        const cities = row.workPlaceNameList || []
        jobs.push({
          sourceId: 'netease',
          sourceName: '网易官招',
          externalId: String(row.id),
          title: row.name,
          company: '网易',
          city: cities[0] || '中国',
          type: workType === '0' ? '社招' : '校招/实习',
          salary: '面议',
          tags: [row.firstPostTypeName, row.reqEducationName, row.reqWorkYearsName]
            .filter(Boolean),
          postedAt: (row.updateTime || '').toString().slice(0, 10),
          description: String(row.description || '').slice(0, 240),
          requirementText: [
            row.requirement || '',
            row.description ? `岗位描述：\n${row.description}` : '',
            row.reqEducationName ? `学历标签：${row.reqEducationName}` : '',
            row.reqWorkYearsName ? `经验标签：${row.reqWorkYearsName}` : '',
            cities.length ? `工作城市：${cities.join(' / ')}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
          applyUrl: `https://hr.163.com/job-detail.html?id=${row.id}`,
        })
      }
      const pages = data?.data?.pages || page
      console.log(
        `netease workType=${workType} page=${page}/${pages} collected=${jobs.length}`,
      )
      if (page >= pages) break
      page++
      await sleep(120)
    }
  }
  console.log('netease jobs', jobs.length)
  return jobs
}

async function fetchDidi(maxItems = 1000) {
  const headers = {
    Accept: 'application/json, text/plain, */*',
    Referer: 'https://talent.didiglobal.com/',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  }
  const size = 16
  const items = []
  let page = 1
  let total = Infinity
  while (items.length < maxItems && (page - 1) * size < total) {
    const res = await fetch(
      `https://talent.didiglobal.com/recruit-portal-service/api/job/front/list?page=${page}&size=${size}`,
      { headers },
    )
    const data = await res.json()
    if ((data.meta?.code ?? 0) !== 0) {
      throw new Error(`didi ${data.meta?.message || res.status}`)
    }
    total = data.data?.total ?? 0
    const rows = data.data?.items || []
    if (!rows.length) break
    items.push(...rows)
    console.log(`didi list page=${page} collected=${items.length}/${total}`)
    page++
    await sleep(100)
  }
  const slice = items.slice(0, maxItems)
  const out = []
  let i = 0
  async function worker() {
    while (i < slice.length) {
      const idx = i++
      const row = slice[idx]
      const jdId = row.jdId
      try {
        const res = await fetch(
          `https://talent.didiglobal.com/recruit-portal-service/api/job/front/view/${jdId}`,
          { headers },
        )
        const data = await res.json()
        const d = data?.data || {}
        out.push({
          sourceId: 'didi',
          sourceName: '滴滴官招',
          externalId: String(jdId),
          title: d.jobName || row.jobName,
          company: '滴滴',
          city: d.workArea || row.workArea || '中国',
          type: String(row.jdNo || '').startsWith('JR') ? '校招' : '社招',
          salary: '面议',
          tags: [d.jobType || row.jobTypeName, d.deptName || row.deptName].filter(
            Boolean,
          ),
          postedAt: (d.refreshTime || row.refreshTime || '')
            .toString()
            .slice(0, 10),
          description: String(d.jobDesc || '').slice(0, 240),
          requirementText: [
            d.qualification || '',
            d.jobDesc ? `岗位描述：\n${d.jobDesc}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
          applyUrl: `https://talent.didiglobal.com/campus#/position/${jdId}/detail`,
        })
      } catch {
        /* skip */
      }
      if ((idx + 1) % 100 === 0) console.log(`didi details ${idx + 1}`)
    }
  }
  await Promise.all(Array.from({ length: 6 }, () => worker()))
  console.log('didi jobs', out.length)
  return out
}

const FEISHU_TENANTS = [
  {
    sourceId: 'xiaomi',
    sourceName: '小米官招',
    company: '小米',
    host: 'xiaomi.jobs.f.mioffice.cn',
    applyPath: 'campus/position',
    maxItems: 900,
  },
  {
    sourceId: 'nio',
    sourceName: '蔚来官招',
    company: '蔚来',
    host: 'nio.jobs.feishu.cn',
    applyPath: 'campus/position',
    maxItems: 900,
  },
  {
    sourceId: 'liauto',
    sourceName: '理想汽车官招',
    company: '理想汽车',
    host: 'li.jobs.feishu.cn',
    applyPath: 'campus/position',
    maxItems: 800,
  },
  {
    sourceId: 'xpeng',
    sourceName: '小鹏官招',
    company: '小鹏汽车',
    host: 'xiaopeng.jobs.feishu.cn',
    applyPath: 'campus/position',
    maxItems: 800,
  },
  {
    sourceId: 'zhipu',
    sourceName: '智谱官招',
    company: '智谱AI',
    host: 'zhipu-ai.jobs.feishu.cn',
    applyPath: 'campus/position',
    maxItems: 300,
  },
  {
    sourceId: 'agibot',
    sourceName: '智元机器人官招',
    company: '智元机器人',
    host: 'agirobot.jobs.feishu.cn',
    applyPath: 'campus/position',
    maxItems: 800,
  },
  {
    sourceId: 'sensetime',
    sourceName: '商汤官招',
    company: '商汤科技',
    host: 'sensetime.jobs.feishu.cn',
    applyPath: 'campus/position',
    maxItems: 200,
  },
  {
    sourceId: 'lilith',
    sourceName: '莉莉丝官招',
    company: '莉莉丝游戏',
    host: 'lilithgames.jobs.feishu.cn',
    applyPath: 'campus/position',
    maxItems: 200,
  },
]

console.log('CN multi-source crawl start…')
await ensureBossCsv()
const bossJobs = fromBossCsv(parseCsv(await readFile(BOSS_CSV, 'utf8')))
console.log('bosszp', bossJobs.length)

const tasks = [
  ['tencent', fetchTencent],
  ['bytedance', fetchByteDance],
  ['jd', fetchJD],
  ['meituan', () => fetchMeituan(1200)],
  ['netease', () => fetchNetease(1500)],
  ['didi', () => fetchDidi(1000)],
  ...FEISHU_TENANTS.map((t) => [
    t.sourceId,
    () => fetchFeishuTenant(t),
  ]),
]

const settled = await Promise.allSettled(tasks.map(([, fn]) => fn()))
const sources = { 'bosszp-open': bossJobs.length }
const merged = [...bossJobs]
settled.forEach((result, i) => {
  const name = tasks[i][0]
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
        .slice(0, 12)
        .map((j) => `${j.sourceName}: ${j.company} · ${j.title} · ${j.city}`),
    },
    null,
    2,
  ),
)
