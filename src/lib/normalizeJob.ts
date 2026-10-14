import { parseRequirementText } from './jdParser'
import type { Job } from './types'

export type FeedLike = {
  sourceId: string
  sourceName: string
  externalId: string
  title: string
  company: string
  city: string
  district?: string
  type: string
  salary: string
  tags: string[]
  postedAt: string
  description: string
  requirementText: string
  applyUrl?: string
}

export function normalizeFeedItem(item: FeedLike, crawledAt: string): Job {
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
    salary: item.salary || '面议',
    tags: item.tags,
    postedAt: item.postedAt,
    description: item.description,
    requirements: item.requirementText
      .split(/[；;。\n]/)
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

export function mergeJobs(existing: Job[], incoming: Job[]): Job[] {
  const map = new Map<string, Job>()
  for (const job of existing) map.set(job.id, job)
  for (const job of incoming) map.set(job.id, job)
  return Array.from(map.values()).sort((a, b) =>
    b.postedAt.localeCompare(a.postedAt),
  )
}
