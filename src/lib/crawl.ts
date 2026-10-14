import { RAW_FEEDS } from '../data/rawFeeds'
import { parseRequirementText } from './jdParser'
import type { Job } from './types'

const KEY = 'toujian-jobs-cache-v2'

function normalize(item: (typeof RAW_FEEDS)[number], crawledAt: string): Job {
  const structured = parseRequirementText(item.requirementText)
  const location = item.district
    ? `${item.city} · ${item.district}`
    : item.city

  return {
    id: `${item.sourceId}-${item.externalId}`,
    title: item.title,
    company: item.company,
    location,
    city: item.city,
    type: item.type,
    salary: item.salary,
    tags: item.tags,
    postedAt: item.postedAt,
    description: item.description,
    requirements: item.requirementText
      .split(/[；;。]/)
      .map((x) => x.trim())
      .filter((x) => x.length > 4)
      .slice(0, 6),
    requirementText: item.requirementText,
    sourceId: item.sourceId,
    sourceName: item.sourceName,
    applyUrl: item.applyUrl,
    structured,
    crawledAt,
  }
}

export function crawlJobs(now = new Date().toISOString()): Job[] {
  // 演示：模拟多源汇聚。可替换为真实抓取/开放 API。
  const jobs = RAW_FEEDS.map((item) => normalize(item, now))
  localStorage.setItem(
    KEY,
    JSON.stringify({ crawledAt: now, jobs }),
  )
  return jobs
}

export function loadJobs(): Job[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return crawlJobs()
    const parsed = JSON.parse(raw) as { jobs?: Job[] }
    if (!parsed.jobs?.length) return crawlJobs()
    return parsed.jobs
  } catch {
    return crawlJobs()
  }
}

export function getJobById(id: string): Job | undefined {
  return loadJobs().find((job) => job.id === id)
}

export function lastCrawledAt(): string | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return (JSON.parse(raw) as { crawledAt?: string }).crawledAt ?? null
  } catch {
    return null
  }
}
