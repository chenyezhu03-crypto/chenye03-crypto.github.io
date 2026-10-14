import { RAW_FEEDS } from '../data/rawFeeds'
import { stripHtml } from './html'
import { normalizeFeedItem, type FeedLike } from './normalizeJob'
import type { Job } from './types'

export type SourceId = 'local-demo' | 'remotive' | 'json-import'

export type SourceMeta = {
  id: SourceId
  name: string
  kind: '本地' | '开放 API' | '导入'
  description: string
  enabledByDefault: boolean
}

export const SOURCE_CATALOG: SourceMeta[] = [
  {
    id: 'local-demo',
    name: '国内演示源',
    kind: '本地',
    description: '含学历/专业/性别标注等中文 JD，适合条件透视演示。',
    enabledByDefault: true,
  },
  {
    id: 'remotive',
    name: 'Remotive 远程岗',
    kind: '开放 API',
    description: '实时拉取公开远程岗位（需标注来源并链回原文）。',
    enabledByDefault: true,
  },
  {
    id: 'json-import',
    name: 'JSON 导入',
    kind: '导入',
    description: '粘贴或上传自定义岗位 JSON，适配你自己的抓取结果。',
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

function fromRemotive(jobs: RemotiveJob[], crawledAt: string): Job[] {
  return jobs.slice(0, 40).map((item) => {
    const plain = stripHtml(item.description || '')
    const requirementText = [
      plain.slice(0, 900),
      item.category ? `Category: ${item.category}` : '',
      item.tags?.length ? `Tags: ${item.tags.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n')

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
        postedAt: (item.publication_date || crawledAt).slice(0, 10),
        description: plain.slice(0, 220) || item.title,
        requirementText,
        applyUrl: item.url,
      },
      crawledAt,
    )
  })
}

export async function fetchRemotiveJobs(crawledAt: string): Promise<Job[]> {
  const res = await fetch('https://remotive.com/api/remote-jobs?limit=40')
  if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`)
  const data = (await res.json()) as { jobs?: RemotiveJob[] }
  if (!data.jobs?.length) return []
  return fromRemotive(data.jobs, crawledAt)
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
      item.requirementText ??
        item.requirements ??
        item.description ??
        title,
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

  if (enabled.includes('local-demo')) {
    const local = fromLocalDemo(crawledAt)
    jobs.push(...local)
    reports.push(`国内演示源：${local.length} 条`)
  }

  if (enabled.includes('remotive')) {
    try {
      const remote = await fetchRemotiveJobs(crawledAt)
      jobs.push(...remote)
      reports.push(`Remotive：${remote.length} 条（已保留原文链接）`)
    } catch (err) {
      reports.push(
        `Remotive 拉取失败：${err instanceof Error ? err.message : '未知错误'}`,
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
