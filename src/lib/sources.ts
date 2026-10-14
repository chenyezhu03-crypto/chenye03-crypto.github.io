import { EXTRA_CN_FEEDS } from '../data/extraCnFeeds'
import { RAW_FEEDS } from '../data/rawFeeds'
import { normalizeFeedItem, type FeedLike } from './normalizeJob'
import type { Job } from './types'

export type SourceId = 'crawled-bundle' | 'local-demo' | 'json-import'

export type SourceMeta = {
  id: SourceId
  name: string
  kind: '已爬缓存' | '本地' | '导入'
  description: string
  enabledByDefault: boolean
}

export const SOURCE_CATALOG: SourceMeta[] = [
  {
    id: 'crawled-bundle',
    name: '国内已爬岗位包',
    kind: '已爬缓存',
    description:
      '腾讯/字节/京东/美团/网易/滴滴 + 小米/蔚来/理想/小鹏/智谱等飞书官招 + BOSS 开源样本，仅中国岗位。',
    enabledByDefault: true,
  },
  {
    id: 'local-demo',
    name: '国内细JD样本',
    kind: '本地',
    description: '多城市/多职能细任职要求，含学历专业性别等条件透视字段。',
    enabledByDefault: true,
  },
  {
    id: 'json-import',
    name: 'JSON 导入',
    kind: '导入',
    description: '粘贴你自己的国内爬虫输出。',
    enabledByDefault: false,
  },
]

const ENABLED_KEY = 'toujian-sources-enabled-v2-cn'

export function loadEnabledSources(): SourceId[] {
  try {
    const raw = localStorage.getItem(ENABLED_KEY)
    if (!raw) {
      return SOURCE_CATALOG.filter((s) => s.enabledByDefault).map((s) => s.id)
    }
    const parsed = JSON.parse(raw) as SourceId[]
    return parsed.filter((id) => SOURCE_CATALOG.some((s) => s.id === id))
  } catch {
    return SOURCE_CATALOG.filter((s) => s.enabledByDefault).map((s) => s.id)
  }
}

export function saveEnabledSources(ids: SourceId[]): void {
  localStorage.setItem(ENABLED_KEY, JSON.stringify(ids))
}

function fromLocalDemo(crawledAt: string): Job[] {
  return [...RAW_FEEDS, ...EXTRA_CN_FEEDS].map((item) =>
    normalizeFeedItem(
      {
        sourceId: item.sourceId,
        sourceName: item.sourceName,
        externalId: item.externalId,
        title: item.title,
        company: item.company,
        city: item.city,
        district: item.district,
        type: item.type,
        salary: item.salary,
        tags: item.tags,
        postedAt: item.postedAt,
        description: item.description,
        requirementText: item.requirementText,
        applyUrl: item.applyUrl,
      },
      crawledAt,
    ),
  )
}

async function mapInChunks<T, R>(
  items: T[],
  chunkSize: number,
  mapFn: (item: T, index: number) => R,
): Promise<R[]> {
  const out: R[] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    const slice = items.slice(i, i + chunkSize)
    for (let j = 0; j < slice.length; j++) {
      out.push(mapFn(slice[j], i + j))
    }
    // 让出主线程，避免大包导入卡死 UI
    await new Promise((r) => setTimeout(r, 0))
  }
  return out
}

const OVERSEAS_CITY =
  /伦敦|新加坡|吉隆坡|法兰克福|巴黎|帕罗奥多|东京|阿姆斯特丹|瑞典|尔湾|洛杉矶|贝尔维尤|雅加达|首尔|利雅得|悉尼|圣何塞|圣保罗|胡志明|塔吉格|古尔冈|墨西哥|华沙|慕尼黑|布拉格|阿拉木图|哥本哈根|墨尔本|迪门|新界|Mexico|San Jose|USA|远程|-远程/i

function isChinaJob(job: FeedLike): boolean {
  const src = `${job.sourceId || ''} ${job.sourceName || ''}`
  if (/remotive|arbeitnow|remoteok|jobicy|himalayas/i.test(src)) return false
  const city = String(job.city || '')
  if (!city || city === '中国') return true
  if (OVERSEAS_CITY.test(city)) return false
  // 纯拉丁城市名多半海外
  if (/^[A-Za-z][A-Za-z\s.'()-]+$/.test(city)) return false
  return true
}

export async function fetchCrawledBundle(crawledAt: string): Promise<Job[]> {
  const res = await fetch(`/feeds/crawled-jobs.json?t=${Date.now()}`)
  if (!res.ok) throw new Error(`爬取包 HTTP ${res.status}`)
  const data = (await res.json()) as { jobs?: FeedLike[]; region?: string }
  if (!data.jobs?.length) return []
  const cnOnly = data.jobs.filter(isChinaJob)
  const list = cnOnly.length ? cnOnly : data.jobs
  return mapInChunks(list, 200, (item) => normalizeFeedItem(item, crawledAt))
}

export function parseImportedJson(raw: string, crawledAt: string): Job[] {
  const data = JSON.parse(raw) as unknown
  const list = Array.isArray(data)
    ? data
    : ((data as { jobs?: unknown[] }).jobs ?? [])

  if (!Array.isArray(list) || !list.length) {
    throw new Error('JSON 中没有岗位数组（期望 jobs[] 或纯数组）')
  }

  return list.map((row, index) => {
    const item = row as Partial<FeedLike> & Record<string, unknown>
    const title = String(item.title ?? item.jobTitle ?? `导入岗位 ${index + 1}`)
    const company = String(item.company ?? item.company_name ?? '未知公司')
    const requirementText = String(
      item.requirementText ?? item.requirements ?? item.description ?? title,
    )
    const description = String(item.description ?? requirementText).slice(0, 240)

    return normalizeFeedItem(
      {
        sourceId: 'json-import',
        sourceName: 'JSON导入',
        externalId: String(item.externalId ?? item.id ?? index),
        title,
        company,
        city: String(item.city ?? item.location ?? '未填写'),
        district: item.district ? String(item.district) : undefined,
        type: String(item.type ?? '全职'),
        salary: String(item.salary ?? '面议'),
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        postedAt: String(item.postedAt ?? crawledAt).slice(0, 10),
        description,
        requirementText,
        applyUrl: item.applyUrl ? String(item.applyUrl) : undefined,
      },
      crawledAt,
    )
  })
}

export async function collectFromSources(
  enabled: SourceId[],
  options?: { importedJson?: string },
): Promise<{ jobs: Job[]; reports: string[] }> {
  const crawledAt = new Date().toISOString()
  const jobs: Job[] = []
  const reports: string[] = []

  if (enabled.includes('crawled-bundle')) {
    try {
      const bundled = await fetchCrawledBundle(crawledAt)
      jobs.push(...bundled)
      reports.push(`国内已爬岗位包：${bundled.length} 条`)
    } catch (err) {
      reports.push(
        `已爬岗位包失败：${err instanceof Error ? err.message : '未知错误'}`,
      )
    }
  }

  if (enabled.includes('local-demo')) {
    const local = fromLocalDemo(crawledAt)
    jobs.push(...local)
    reports.push(`国内细JD样本：${local.length} 条`)
  }

  if (enabled.includes('json-import') && options?.importedJson?.trim()) {
    try {
      const imported = parseImportedJson(options.importedJson, crawledAt)
      jobs.push(...imported)
      reports.push(`JSON 导入：${imported.length} 条`)
    } catch (err) {
      reports.push(
        `JSON 导入失败：${err instanceof Error ? err.message : '格式错误'}`,
      )
    }
  }

  return { jobs, reports }
}
