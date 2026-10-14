import type { RawFeedItem } from '../data/rawFeeds'
import { normalizeFeedItem } from './jobNormalize'
import type { Job } from './types'

type GuokaoJsonPayload = {
  version: number
  title: string
  importedAt: string
  count: number
  items: RawFeedItem[]
}

let memoryCache: Job[] | null = null
let loadPromise: Promise<Job[]> | null = null

const DATA_URL = `${import.meta.env.BASE_URL}data/guokao2027-positions.json`

export function guokao2027Loaded(): boolean {
  return memoryCache != null
}

export async function fetchGuokao2027Jobs(
  crawledAt = new Date().toISOString(),
): Promise<Job[]> {
  if (memoryCache) return memoryCache
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const res = await fetch(DATA_URL)
    if (!res.ok) {
      throw new Error(`加载 2027 国考职位表失败（${res.status}）`)
    }
    const payload = (await res.json()) as GuokaoJsonPayload
    memoryCache = payload.items.map((item) => normalizeFeedItem(item, crawledAt))
    return memoryCache
  })()

  try {
    return await loadPromise
  } catch (err) {
    loadPromise = null
    throw err
  }
}

export function clearGuokao2027Cache(): void {
  memoryCache = null
  loadPromise = null
}

export function getGuokao2027JobById(id: string): Job | undefined {
  return memoryCache?.find((job) => job.id === id)
}
