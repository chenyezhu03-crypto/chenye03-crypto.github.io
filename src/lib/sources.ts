import { RAW_FEEDS } from '../data/rawFeeds'
import { stripHtml } from './html'
import { normalizeFeedItem, type FeedLike } from './normalizeJob'
import type { Job } from './types'

export type SourceId =
  | 'local-demo'
  | 'crawled-bundle'
  | 'remotive'
  | 'arbeitnow'
  | 'json-import'

export type SourceMeta = {
  id: SourceId
  name: string
  kind: '本地' | '已爬缓存' | '开放 API' | '导入'
  description: string
  enabledByDefault: boolean
}

export const SOURCE_CATALOG: SourceMeta[] = [
  {
    id: 'crawled-bundle',
    name: '已爬岗位包',
    kind: '已爬缓存',
    description: '我帮你爬好的 Remotive + Arbeitnow 打包数据，打开就能用。',
    enabledByDefault: true,
  },
  {
    id: 'local-demo',
    name: '国内演示源',
    kind: '本地',
    description: '含学历/专业/性别标注等中文 JD，适合条件透视。',
    enabledByDefault: true,
  },
  {
    id: 'remotive',
    name: 'Remotive 实时',
    kind: '开放 API',
    description: '再次在线拉取 Remotive 最新远程岗。',
    enabledByDefault: false,
  },
  {
    id: 'arbeitnow',
    name: 'Arbeitnow 实时',
    kind: '开放 API',
    description: '再次在线拉取 Arbeitnow 欧洲/远程岗。',
    enabledByDefault: false,
  },
  {
    id: 'json-import',
    name: 'JSON 导入',
    kind: '导入',
    description: '粘贴你自己的爬虫输出。',
    enabledByDefault: false,
  },
]

const ENABLED_KEY = 'toujian-sources-enabled-v1'

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
  return RAW_FEEDS.map((item) =>
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
  const data = (await res.json()) as { jobs?: FeedLike[] }
  if (!data.jobs?.length) return []
  return feedLikeToJobs(data.jobs, crawledAt)
}

type RemotiveJob = {
  id: number
  url: string
  title: string
  company_name: string
  category: string
  tags: string[]
  job_type: string
  publication_date: string
  candidate_required_location: string
  salary: string
  description: string
}

function guessCity(location: string): string {
  if (!location || /worldwide|anywhere|remote/i.test(location)) return '远程'
  const first = location.split(/[,/|]/)[0]?.trim()
  return first || '远程'
}

function toDate(v: unknown): string {
  if (!v) return new Date().toISOString().slice(0, 10)
  if (typeof v === 'number') {
    return new Date(v * (v < 1e12 ? 1000 : 1)).toISOString().slice(0, 10)
  }
  const s = String(v)
  if (/^\d+$/.test(s)) return toDate(Number(s))
  return s.slice(0, 10)
}

export async function fetchRemotiveJobs(crawledAt: string): Promise<Job[]> {
  const res = await fetch('https://remotive.com/api/remote-jobs?limit=100')
  if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`)
  const data = (await res.json()) as { jobs?: RemotiveJob[] }
  if (!data.jobs?.length) return []
  return data.jobs.map((item) => {
    const plain = stripHtml(item.description || '')
    return normalizeFeedItem(
      {
        sourceId: 'remotive',
        sourceName: 'Remotive',
        externalId: String(item.id),
        title: item.title,
        company: item.company_name,
        city: guessCity(item.candidate_required_location || ''),
        type: item.job_type || '全职',
        salary: item.salary || '面议',
        tags: item.tags?.slice(0, 6) || [],
        postedAt: toDate(item.publication_date),
        description: plain.slice(0, 220) || item.title,
        requirementText: [
          plain.slice(0, 900),
          item.category ? `Category: ${item.category}` : '',
          item.tags?.length ? `Tags: ${item.tags.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        applyUrl: item.url,
      },
      crawledAt,
    )
  })
}

type ArbeitnowJob = {
  slug?: string
  url?: string
  title: string
  company_name: string
  location?: string
  remote?: boolean
  job_types?: string[]
  tags?: string[]
  created_at?: string | number
  description?: string
}

export async function fetchArbeitnowJobs(crawledAt: string): Promise<Job[]> {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api')
  if (!res.ok) throw new Error(`Arbeitnow HTTP ${res.status}`)
  const data = (await res.json()) as { data?: ArbeitnowJob[] }
  if (!data.data?.length) return []
  return data.data.slice(0, 100).map((item, index) => {
    const plain = stripHtml(item.description || '')
    return normalizeFeedItem(
      {
        sourceId: 'arbeitnow',
        sourceName: 'Arbeitnow',
        externalId: String(item.slug || item.url || index),
        title: item.title,
        company: item.company_name,
        city: item.remote
          ? '远程'
          : String(item.location || '欧洲').split(',')[0].trim(),
        type: item.job_types?.[0] || '全职',
        salary: '面议',
        tags: item.tags?.slice(0, 6) || [],
        postedAt: toDate(item.created_at),
        description: plain.slice(0, 220) || item.title,
        requirementText: [
          plain.slice(0, 900),
          item.tags?.length ? `Tags: ${item.tags.join(', ')}` : '',
          item.remote ? 'Remote friendly' : '',
        ]
          .filter(Boolean)
          .join('\n'),
        applyUrl: item.url,
      },
      crawledAt,
    )
  })
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
      reports.push(`已爬岗位包：${bundled.length} 条`)
    } catch (err) {
      reports.push(
        `已爬岗位包失败：${err instanceof Error ? err.message : '未知错误'}`,
      )
    }
  }

  if (enabled.includes('local-demo')) {
    const local = fromLocalDemo(crawledAt)
    jobs.push(...local)
    reports.push(`国内演示源：${local.length} 条`)
  }

  if (enabled.includes('remotive')) {
    try {
      const remote = await fetchRemotiveJobs(crawledAt)
      jobs.push(...remote)
      reports.push(`Remotive 实时：${remote.length} 条`)
    } catch (err) {
      reports.push(
        `Remotive 失败：${err instanceof Error ? err.message : '未知错误'}`,
      )
    }
  }

  if (enabled.includes('arbeitnow')) {
    try {
      const remote = await fetchArbeitnowJobs(crawledAt)
      jobs.push(...remote)
      reports.push(`Arbeitnow 实时：${remote.length} 条`)
    } catch (err) {
      reports.push(
        `Arbeitnow 失败：${err instanceof Error ? err.message : '未知错误'}`,
      )
    }
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
