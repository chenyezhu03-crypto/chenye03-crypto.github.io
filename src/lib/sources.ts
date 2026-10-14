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
    description: '腾讯官招公开接口 + BOSS 开源样本，仅中国岗位。',
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

function feedLikeToJobs(list: FeedLike[], crawledAt: string): Job[] {
  return list.map((item) => normalizeFeedItem(item, crawledAt))
}

export async function fetchCrawledBundle(crawledAt: string): Promise<Job[]> {
  const res = await fetch(`/feeds/crawled-jobs.json?t=${Date.now()}`)
  if (!res.ok) throw new Error(`爬取包 HTTP ${res.status}`)
  const data = (await res.json()) as { jobs?: FeedLike[]; region?: string }
  if (!data.jobs?.length) return []
  // 只要中国包；若旧海外包残留，尽量用城市/来源过滤
  const cnOnly = data.jobs.filter((j) => {
    const src = `${j.sourceId || ''} ${j.sourceName || ''}`
    if (/remotive|arbeitnow|remoteok|jobicy|himalayas/i.test(src)) return false
    return true
  })
  return feedLikeToJobs(cnOnly.length ? cnOnly : data.jobs, crawledAt)
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
