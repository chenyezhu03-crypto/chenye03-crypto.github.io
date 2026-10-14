import { RAW_FEEDS } from '../data/rawFeeds'
import { normalizeFeedItem } from './jobNormalize'
import type { Job } from './types'

const KEY = 'toujian-jobs-cache-v2'

export function crawlJobs(now = new Date().toISOString()): Job[] {
  // 演示：模拟多源汇聚。可替换为真实抓取/开放 API。
  const jobs = RAW_FEEDS.map((item) => normalizeFeedItem(item, now))
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

export function lastCrawledAt(): string | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return (JSON.parse(raw) as { crawledAt?: string }).crawledAt ?? null
  } catch {
    return null
  }
}
