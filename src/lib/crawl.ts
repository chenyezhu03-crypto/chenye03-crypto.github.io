import { mergeJobs } from './normalizeJob'
import { collectFromSources, loadEnabledSources, type SourceId } from './sources'
import type { Job } from './types'

const KEY = 'toujian-jobs-cache-v1'

type Cache = {
  crawledAt: string
  jobs: Job[]
  reports?: string[]
}

function writeCache(cache: Cache): void {
  localStorage.setItem(KEY, JSON.stringify(cache))
}

export async function crawlJobs(options?: {
  enabled?: SourceId[]
  importedJson?: string
  replace?: boolean
}): Promise<{ jobs: Job[]; reports: string[]; crawledAt: string }> {
  const enabled = options?.enabled ?? loadEnabledSources()
  const crawledAt = new Date().toISOString()
  const { jobs: incoming, reports } = await collectFromSources(enabled, {
    importedJson: options?.importedJson,
  })

  const prev = options?.replace ? [] : loadJobs()
  const jobs = mergeJobs(prev, incoming)
  writeCache({ crawledAt, jobs, reports })
  return { jobs, reports, crawledAt }
}

export function loadJobs(): Job[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Cache
    return Array.isArray(parsed.jobs) ? parsed.jobs : []
  } catch {
    return []
  }
}

export function replaceJobs(jobs: Job[], reports: string[] = []): Job[] {
  const crawledAt = new Date().toISOString()
  writeCache({ crawledAt, jobs, reports })
  return jobs
}

export function getJobById(id: string): Job | undefined {
  return loadJobs().find((job) => job.id === id)
}

export function lastCrawledAt(): string | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return (JSON.parse(raw) as Cache).crawledAt ?? null
  } catch {
    return null
  }
}

export function lastCrawlReports(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return (JSON.parse(raw) as Cache).reports ?? []
  } catch {
    return []
  }
}

/** 首次进入时若无缓存，自动汇聚启用源 */
export async function ensureJobsLoaded(): Promise<Job[]> {
  const existing = loadJobs()
  if (existing.length) return existing
  const { jobs } = await crawlJobs({ replace: true })
  return jobs
}
