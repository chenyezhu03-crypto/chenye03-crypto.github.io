#!/usr/bin/env node
/**
 * 知名企业补源（目标 100–200 家）
 * - 猎聘公开搜索（按公司名解析 compId 后拉岗位）
 * - Moka 官招租户（AES 解密）
 * - 额外飞书 ATS 租户
 *
 * 用法：node scripts/crawl-famous.mjs
 * 会与 public/feeds/crawled-jobs.json 合并，并写入 famous-company-ids.json 缓存。
 */
import { createDecipheriv, randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../public/feeds/crawled-jobs.json')
const ID_CACHE = path.join(__dirname, '../public/feeds/famous-company-ids.json')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const FAMOUS = [
  '腾讯','字节跳动','阿里巴巴','蚂蚁集团','百度','美团','京东','网易','滴滴','快手','小红书','拼多多','SHEIN','哔哩哔哩','爱奇艺','微博','知乎','得物','叮咚买菜','盒马','饿了么','携程','同程旅行','去哪儿','贝壳','链家','58同城','BOSS直聘','猎聘','货拉拉','满帮','顺丰','菜鸟','中通快递','圆通速递','申通快递','韵达','京东物流',
  '华为','小米','OPPO','vivo','荣耀','大疆','联想','中兴','海尔','美的','格力','TCL','京东方','立讯精密','歌尔股份','安克创新','传音控股',
  '比亚迪','吉利','蔚来','小鹏','理想汽车','极氪','长城汽车','上汽集团','广汽集团','长安汽车','一汽','东风汽车','赛力斯','零跑','哪吒汽车','文远知行','小马智行',
  '宁德时代','国轩高科','亿纬锂能','阳光电源','隆基绿能','通威股份','三一重工','中联重科','徐工集团','中国中车',
  '商汤','旷视','寒武纪','地平线','海康威视','大华股份','科大讯飞','智谱','月之暗面','DeepSeek','MiniMax','百川智能','阶跃星辰','零一万物','智元机器人','宇树科技',
  '米哈游','莉莉丝','完美世界','三七互娱','巨人网络','叠纸游戏','鹰角网络','阅文集团','芒果超媒',
  '微众银行','招商银行','平安银行','中国平安','中金公司','中信证券','华泰证券','国泰君安','东方财富','同花顺',
  '金山办公','金山云','用友','金蝶','浪潮','中科曙光','新华三','深信服','奇安信',
  '万科','保利发展','龙湖集团','苏宁易购','唯品会','永辉超市','农夫山泉','伊利','蒙牛','茅台','五粮液','中国移动','中国联通','中国电信','药明康德','恒瑞医药','迈瑞医疗','新东方','好未来','作业帮','猿辅导',
]

const KNOWN_LIEPIN_IDS = {
  菜鸟: 8488703,
  微众银行: 8312365,
  中金公司: 4580900,
  海康威视: 1033486,
  华为: 954482,
  快手: 8605497,
  小红书: 7921271,
  拼多多: 8537928,
  SHEIN: 8706847,
  大疆: 2495108,
  联想: 1365319,
  海尔: 9671743,
  美的: 1792495,
  宁德时代: 8768998,
  中兴: 540933,
  京东方: 886895,
  科大讯飞: 4454894,
  用友: 5634845,
  金山办公: 1805522,
  三七互娱: 3504489,
  完美世界: 164236,
  得物: 9698935,
  叮咚买菜: 8126179,
  贝壳: 8461883,
  链家: 988431,
  携程: 182339,
  同程旅行: 3698161,
  货拉拉: 9142549,
  满帮: 9484343,
  安克创新: 8733738,
}

const MOKA = [
  { company: 'DeepSeek', orgSlug: 'high-flyer', siteId: 140576, kind: 'social-recruitment', max: 40 },
  { company: '月之暗面', orgSlug: 'moonshot', siteId: 148506, kind: 'social-recruitment', max: 80 },
  { company: '吉利', orgSlug: 'geely', siteId: 96123, kind: 'social-recruitment', max: 120 },
  { company: '旷视', orgSlug: 'megviihr', siteId: 38641, kind: 'social-recruitment', max: 20 },
  { company: '寒武纪', orgSlug: 'cambricon', siteId: 1113, kind: 'social-recruitment', max: 50 },
  { company: '微博', orgSlug: 'sina', siteId: 43535, kind: 'social-recruitment', max: 80 },
  { company: '阶跃星辰', orgSlug: 'step', siteId: 94904, kind: 'social-recruitment', max: 40 },
  { company: '文远知行', orgSlug: 'jingchi', siteId: 2138, kind: 'social-recruitment', max: 40 },
  { company: '银河通用', orgSlug: 'yinhetongyong', siteId: 165929, kind: 'social-recruitment', max: 40 },
]

const FEISHU_EXTRA = [
  { company: '叠纸游戏', host: 'papergames.jobs.feishu.cn', max: 80 },
  { company: 'Momenta', host: 'momenta.jobs.feishu.cn', max: 80 },
  { company: '正浩EcoFlow', host: 'ecoflow.jobs.feishu.cn', max: 80 },
  { company: '零一万物', host: '01ai.jobs.feishu.cn', max: 40 },
  { company: '美图', host: 'meitu.jobs.feishu.cn', max: 30 },
  { company: '鹰角网络', host: 'hypergryph.jobs.feishu.cn', max: 20 },
  { company: 'MiniMax', host: 'vrfi1sk8a0.jobs.feishu.cn', applyPath: 'index/position', max: 80 },
  { company: '百川智能', host: 'cq6qe6bvfr6.jobs.feishu.cn', applyPath: 'baichuanzhaopin/position', max: 80 },
]

function htmlDecode(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function dedupe(jobs) {
  const map = new Map()
  for (const job of jobs) map.set(`${job.sourceId}:${job.externalId}`, job)
  return Array.from(map.values())
}

async function loadJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return fallback
  }
}

async function liepinToken() {
  const UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  const cookies = []
  const home = await fetch('https://www.liepin.com/', {
    headers: { 'User-Agent': UA },
    redirect: 'manual',
  })
  for (const v of home.headers.getSetCookie?.() || []) cookies.push(v.split(';')[0])
  const home2 = await fetch('https://www.liepin.com/', {
    headers: { 'User-Agent': UA, Cookie: cookies.join('; ') },
  })
  for (const v of home2.headers.getSetCookie?.() || []) cookies.push(v.split(';')[0])
  const jar = Object.fromEntries(
    cookies.map((c) => {
      const i = c.indexOf('=')
      return [c.slice(0, i), c.slice(i + 1)]
    }),
  )
  if (!jar['XSRF-TOKEN']) throw new Error('liepin xsrf missing')
  return { xsrf: jar['XSRF-TOKEN'], cookie: cookies.join('; '), UA }
}

async function liepinPost(tok, body, referer) {
  const r = await fetch(
    'https://api-c.liepin.com/api/com.liepin.searchfront4c.pc-search-job',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'User-Agent': tok.UA,
        Origin: 'https://www.liepin.com',
        Referer: referer,
        Accept: 'application/json, text/plain, */*',
        'X-Client-Type': 'web',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Fscp-Std-Info': '{"client_id": "40108"}',
        'X-Fscp-Version': '1.1',
        'X-Fscp-Trace-Id': randomUUID(),
        'X-Xsrf-Token': decodeURIComponent(tok.xsrf),
        Cookie: tok.cookie,
      },
      body: JSON.stringify(body),
    },
  )
  return r.json()
}

function searchBody(compId, keyword, page = 0) {
  return {
    data: {
      mainSearchPcConditionForm: {
        city: '410',
        dq: '410',
        pubTime: '',
        currentPage: page,
        pageSize: 40,
        key: keyword,
        suggestTag: '',
        workYearCode: '',
        compId: compId ? String(compId) : '',
        compName: '',
        compTag: '',
        industry: '',
        salaryCode: '',
        jobKind: '',
        compScale: '',
        compKind: '',
        compStage: '',
        eduLevel: '',
        salaryLow: '',
        salaryHigh: '',
      },
      passThroughForm: {
        scene: 'init',
        skId: '',
        fkId: '',
        ckId: '',
        suggest: null,
      },
    },
  }
}

async function resolveLiepinId(tok, name, cache) {
  if (cache[name]?.compId) return cache[name]
  if (KNOWN_LIEPIN_IDS[name]) {
    cache[name] = { compId: KNOWN_LIEPIN_IDS[name], liepinName: name }
    return cache[name]
  }
  const j = await liepinPost(
    tok,
    searchBody('', name, 0),
    `https://www.liepin.com/zhaopin/?key=${encodeURIComponent(name)}`,
  )
  const list = j?.data?.data?.jobCardList || []
  const counts = new Map()
  for (const card of list) {
    const id = card?.comp?.compId
    const cn = card?.comp?.compName
    if (!id || !cn) continue
    const key = `${id}|${cn}`
    const hit =
      cn.includes(name) || name.includes(cn.replace(/股份有限公司|有限公司|集团/g, ''))
    counts.set(key, (counts.get(key) || 0) + (hit ? 10 : 1))
  }
  const ranked = [...counts.entries()]
    .map(([k, n]) => {
      const [id, cn] = k.split('|')
      return { compId: Number(id), liepinName: cn, score: n }
    })
    .sort((a, b) => b.score - a.score)
  if (!ranked[0]) return null
  cache[name] = {
    compId: ranked[0].compId,
    liepinName: ranked[0].liepinName,
  }
  return cache[name]
}

async function fetchLiepinCompany(tok, brand, compId, maxItems = 30) {
  const jobs = []
  let page = 0
  while (jobs.length < maxItems && page < 3) {
    const j = await liepinPost(
      tok,
      searchBody(compId, brand, page),
      `https://www.liepin.com/zhaopin/?key=${encodeURIComponent(brand)}`,
    )
    const list = (j?.data?.data?.jobCardList || []).filter(
      (c) => String(c?.comp?.compId) === String(compId),
    )
    if (!list.length) break
    for (const card of list) {
      if (jobs.length >= maxItems) break
      const job = card.job || {}
      const comp = card.comp || {}
      const id = String(job.jobId || '')
      if (!id) continue
      const salary =
        job.salary && job.salary !== '面议'
          ? job.salary
          : job.salaryShow || '面议'
      jobs.push({
        sourceId: 'liepin-famous',
        sourceName: '猎聘·知名企业',
        externalId: `${compId}-${id}`,
        title: job.title,
        company: brand,
        city: (job.dq || '中国').split('-')[0] || '中国',
        type: job.jobKind === '2' ? '社招' : '全职',
        salary,
        tags: [comp.compIndustry, job.eduLevel, job.workYear].filter(Boolean),
        postedAt: (job.refreshTime || job.publishTime || '')
          .toString()
          .slice(0, 10),
        description: String(job.title || '').slice(0, 180),
        requirementText: [
          job.eduLevel ? `学历标签：${job.eduLevel}` : '',
          job.workYear ? `经验标签：${job.workYear}` : '',
          comp.compIndustry ? `行业：${comp.compIndustry}` : '',
          `任职要求摘要：${job.eduLevel || '学历不限'}；工作经验${job.workYear || '不限'}；${brand}相关岗位。`,
        ]
          .filter(Boolean)
          .join('\n'),
        applyUrl: job.link || job.pcOuterLink || `https://www.liepin.com/job/19${id}.shtml`,
      })
    }
    page++
    await sleep(220)
  }
  return jobs
}

async function fetchMoka({ company, orgSlug, siteId, kind, max = 50 }) {
  const portalUrl = `https://app.mokahr.com/${kind}/${orgSlug}/${siteId}`
  const r1 = await fetch(portalUrl, {
    redirect: 'manual',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  const cookies = []
  for (const v of r1.headers.getSetCookie?.() || []) cookies.push(v.split(';')[0])
  const cookie = cookies.join('; ')
  const r2 = await fetch(portalUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0', Cookie: cookie },
    redirect: 'follow',
  })
  const html = await r2.text()
  const m = html.match(/<input[^>]*id="init-data"[^>]*value="([^"]+)"/)
  if (!m) throw new Error(`${orgSlug} no init-data`)
  const init = JSON.parse(htmlDecode(m[1]))
  if (!init.aesIv) throw new Error(`${orgSlug} no aesIv`)

  const jobs = []
  let offset = 0
  const limit = 50
  let total = Infinity
  while (jobs.length < max && offset < total) {
    const envelope = await (
      await fetch(
        `https://app.mokahr.com/api/outer/ats-apply/website/jobs/v2?orgId=${encodeURIComponent(orgSlug)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'https://app.mokahr.com',
            Referer: portalUrl,
            Cookie: cookie,
            'User-Agent': 'Mozilla/5.0',
          },
          body: JSON.stringify({
            orgId: orgSlug,
            siteId: String(siteId),
            limit,
            offset,
            needStat: true,
            locale: 'zh-CN',
          }),
        },
      )
    ).json()
    const key = Buffer.from(envelope.necromancer, 'utf8').slice(0, 16)
    const iv = Buffer.from(init.aesIv, 'utf8').slice(0, 16)
    const decipher = createDecipheriv('aes-128-cbc', key, iv)
    const plain = Buffer.concat([
      decipher.update(Buffer.from(envelope.data, 'base64')),
      decipher.final(),
    ])
    const decoded = JSON.parse(plain.toString('utf8'))
    if (decoded.code !== 0) break
    total = decoded.data?.jobStats?.total ?? 0
    const rows = decoded.data?.jobs || []
    if (!rows.length) break
    for (const row of rows) {
      if (jobs.length >= max) break
      const cities = (row.locations || [])
        .map((l) => l.city || l.name || l.address)
        .filter(Boolean)
      jobs.push({
        sourceId: `moka-${orgSlug}`,
        sourceName: `${company}官招`,
        externalId: String(row.id),
        title: row.title,
        company,
        city: cities[0] || '中国',
        type: '全职',
        salary: '面议',
        tags: [row.zhineng?.name, row.department?.name].filter(Boolean),
        postedAt: new Date().toISOString().slice(0, 10),
        description: String(row.description || row.title || '').slice(0, 180),
        requirementText: [
          row.requirement || row.jobDescription || '',
          row.description ? `岗位描述：\n${row.description}` : '',
        ]
          .filter(Boolean)
          .join('\n\n')
          .slice(0, 1200),
        applyUrl: `${portalUrl}#/job/${row.id}`,
      })
    }
    offset += limit
    await sleep(160)
  }
  return jobs
}

async function fetchFeishu({ company, host, applyPath = 'campus/position', max = 80 }) {
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
    'Content-Type': 'application/json',
    Origin: origin,
    Referer: `${origin}/`,
    'User-Agent': 'Mozilla/5.0',
  }
  const csrfRes = await fetch(`${origin}/api/v1/csrf/token`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({ portal_entrance: 1 }),
  })
  store(csrfRes)
  const token = decodeURIComponent(jar.get('atsx-csrf-token') || '')
  if (!token) throw new Error(`${host} csrf missing`)
  const jobs = []
  let offset = 0
  let total = Infinity
  while (jobs.length < max && offset < total) {
    const data = await (
      await fetch(`${origin}/api/v1/search/job/posts`, {
        method: 'POST',
        headers: { ...H, Cookie: cookie(), 'x-csrf-token': token },
        body: JSON.stringify({
          keyword: '',
          limit: 50,
          offset,
          portal_type: 3,
          portal_entrance: 1,
          language: 'zh',
        }),
      })
    ).json()
    if (data.code !== 0) break
    total = data.data?.count ?? 0
    const rows = data.data?.job_post_list || []
    if (!rows.length) break
    for (const row of rows) {
      if (jobs.length >= max) break
      const cities = (row.city_list || []).map((c) => c.name).filter(Boolean)
      jobs.push({
        sourceId: `feishu-${host.split('.')[0]}`,
        sourceName: `${company}官招`,
        externalId: String(row.id),
        title: row.title,
        company,
        city: cities[0] || '中国',
        type: row.recruit_type?.name || '全职',
        salary: '面议',
        tags: [row.job_category?.name].filter(Boolean),
        postedAt: row.publish_time
          ? new Date(Number(row.publish_time)).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        description: String(row.description || '').slice(0, 180),
        requirementText: [
          row.requirement || '',
          row.description ? `岗位描述：\n${row.description}` : '',
        ]
          .filter(Boolean)
          .join('\n\n')
          .slice(0, 1200),
        applyUrl: `${origin}/${applyPath}/${row.id}/detail`,
      })
    }
    offset += 50
    await sleep(150)
  }
  return jobs
}

console.log('famous company crawl start…')
const existing = await loadJson(OUT, { jobs: [], sources: {} })
const idCache = await loadJson(ID_CACHE, {})
const merged = [...(existing.jobs || [])]
const reports = []

// Moka
for (const cfg of MOKA) {
  try {
    const jobs = await fetchMoka(cfg)
    merged.push(...jobs)
    reports.push(`moka ${cfg.company}: ${jobs.length}`)
    console.log('moka', cfg.company, jobs.length)
  } catch (e) {
    reports.push(`moka ${cfg.company} fail: ${e.message}`)
    console.error('moka fail', cfg.company, e.message)
  }
}

// Feishu extras
for (const cfg of FEISHU_EXTRA) {
  try {
    const jobs = await fetchFeishu(cfg)
    merged.push(...jobs)
    reports.push(`feishu ${cfg.company}: ${jobs.length}`)
    console.log('feishu', cfg.company, jobs.length)
  } catch (e) {
    reports.push(`feishu ${cfg.company} fail: ${e.message}`)
    console.error('feishu fail', cfg.company, e.message)
  }
}

// Liepin famous companies
const tok = await liepinToken()
let liepinOk = 0
for (const brand of FAMOUS) {
  try {
    const resolved = await resolveLiepinId(tok, brand, idCache)
    if (!resolved?.compId) {
      reports.push(`liepin ${brand}: unresolved`)
      continue
    }
    const jobs = await fetchLiepinCompany(tok, brand, resolved.compId, 28)
    if (jobs.length) {
      merged.push(...jobs)
      liepinOk++
      reports.push(`liepin ${brand}: ${jobs.length}`)
      console.log('liepin', brand, jobs.length, resolved.liepinName)
    }
    await sleep(180)
  } catch (e) {
    reports.push(`liepin ${brand} fail: ${e.message}`)
    console.error('liepin fail', brand, e.message)
    await sleep(400)
  }
}

const jobs = dedupe(merged).map((j) => ({
  ...j,
  description: String(j.description || '').slice(0, 180),
  requirementText: String(j.requirementText || '').slice(0, 1200),
}))
const sources = {}
for (const j of jobs) sources[j.sourceId] = (sources[j.sourceId] || 0) + 1
const companies = new Set(jobs.map((j) => j.company).filter(Boolean))

const payload = {
  crawledAt: new Date().toISOString(),
  region: 'CN',
  sources,
  total: jobs.length,
  famousTarget: FAMOUS.length,
  companyCount: companies.size,
  jobs,
}

await mkdir(path.dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(payload))
await writeFile(ID_CACHE, JSON.stringify(idCache, null, 2))
const info = await stat(OUT)
console.log(
  JSON.stringify(
    {
      total: jobs.length,
      companyCount: companies.size,
      famousTarget: FAMOUS.length,
      liepinCompanies: liepinOk,
      mb: +(info.size / 1024 / 1024).toFixed(2),
      reports: reports.slice(0, 40),
    },
    null,
    2,
  ),
)
