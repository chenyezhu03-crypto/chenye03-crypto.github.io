import { parseRequirementText } from './jdParser'
import {
  idbClearJobsCache,
  idbGetJobsCache,
  idbSetJobsCache,
  readLegacyLocalCache,
  readMeta,
  type JobsCache,
} from './jobStore'
import { mergeJobs } from './normalizeJob'
import { collectFromSources, loadEnabledSources, type SourceId } from './sources'
import type { Job } from './types'

/**
 * 低于此数量视为「只有本地细JD样本」之类的残缺缓存。
 * 本地样本约 100+ 条，完整已爬包约 2 万条；残缺时自动重拉。
 */
const MIN_TRUSTED_JOBS = 500

function refreshStructured(job: Job): Job {
  if (job.structured) return job
  return {
    ...job,
    structured: parseRequirementText(job.requirementText || job.description || ''),
  }
}

let memory: JobsCache | null = null
let hydratePromise: Promise<Job[]> | null = null

function setMemory(cache: JobsCache): void {
  memory = {
    crawledAt: cache.crawledAt,
    reports: cache.reports ?? [],
    jobs: cache.jobs.map(refreshStructured),
  }
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

  const prev = options?.replace ? [] : await hydrateJobs()
  const jobs = mergeJobs(prev, incoming)
  const cache: JobsCache = { crawledAt, jobs, reports }
  setMemory(cache)
  await idbSetJobsCache(cache)
  return { jobs, reports, crawledAt }
}

/** 同步读取内存缓存（可能尚未 hydrate） */
export function loadJobs(): Job[] {
  return memory?.jobs ?? []
}

export async function hydrateJobs(): Promise<Job[]> {
  if (memory?.jobs.length) return memory.jobs
  if (hydratePromise) return hydratePromise
  hydratePromise = (async () => {
    const fromIdb = await idbGetJobsCache()
    if (fromIdb?.jobs?.length) {
      setMemory(fromIdb)
      return memory!.jobs
    }
    const legacy = readLegacyLocalCache()
    if (legacy?.jobs?.length) {
      setMemory(legacy)
      try {
        await idbSetJobsCache(memory!)
      } catch {
        /* ignore migrate failure */
      }
      return memory!.jobs
    }
    return []
  })().finally(() => {
    hydratePromise = null
  })
  return hydratePromise
}

export async function replaceJobs(
  jobs: Job[],
  reports: string[] = [],
): Promise<Job[]> {
  const crawledAt = new Date().toISOString()
  const cache: JobsCache = { crawledAt, jobs, reports }
  setMemory(cache)
  await idbSetJobsCache(cache)
  return memory!.jobs
}

export function getJobById(id: string): Job | undefined {
  return loadJobs().find((job) => job.id === id)
}

export function lastCrawledAt(): string | null {
  return memory?.crawledAt ?? readMeta()?.crawledAt ?? null
}

export function lastCrawlReports(): string[] {
  return memory?.reports ?? readMeta()?.reports ?? []
}

export function lastJobCount(): number {
  return memory?.jobs.length ?? readMeta()?.count ?? 0
}

/**
 * 首次进入时保证有完整岗位包。
 * 无缓存、或只有本地样本（约一百多条）时，强制重拉「已爬岗位包」。
 */
export async function ensureJobsLoaded(): Promise<Job[]> {
  const existing = await hydrateJobs()
  if (existing.length >= MIN_TRUSTED_JOBS) return existing

  const { jobs } = await crawlJobs({
    replace: true,
    enabled: ['crawled-bundle', 'local-demo'],
  })
  // 若拉取失败仍只有少量样本，原样返回，避免死循环
  return jobs
}

/** 清空本地缓存后重新拉取完整岗位包 */
export async function reloadFullJobBundle(): Promise<Job[]> {
  memory = null
  await idbClearJobsCache()
  const { jobs } = await crawlJobs({
    replace: true,
    enabled: ['crawled-bundle', 'local-demo'],
  })
  return jobs
}
