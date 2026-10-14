import type { Job } from './types'

export type JobsCache = {
  crawledAt: string
  jobs: Job[]
  reports?: string[]
}

const DB_NAME = 'toujian-db'
const DB_VERSION = 1
const STORE = 'kv'
const CACHE_KEY = 'jobs-cache-v1'
const META_KEY = 'toujian-jobs-meta-v1'
const LEGACY_KEY = 'toujian-jobs-cache-v1'

type Meta = {
  crawledAt: string
  reports: string[]
  count: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'))
  })
}

export async function idbGetJobsCache(): Promise<JobsCache | null> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(CACHE_KEY)
      req.onsuccess = () => {
        const value = req.result as JobsCache | undefined
        resolve(value?.jobs?.length ? value : null)
      }
      req.onerror = () => reject(req.error ?? new Error('indexedDB get failed'))
    })
  } catch {
    return null
  }
}

export async function idbSetJobsCache(cache: JobsCache): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(cache, CACHE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('indexedDB put failed'))
  })
  writeMeta({
    crawledAt: cache.crawledAt,
    reports: cache.reports ?? [],
    count: cache.jobs.length,
  })
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* ignore */
  }
}

export function writeMeta(meta: Meta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch {
    /* quota — meta is optional */
  }
}

export function readMeta(): Meta | null {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Meta
  } catch {
    return null
  }
}

export function readLegacyLocalCache(): JobsCache | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as JobsCache
    if (!Array.isArray(parsed.jobs)) return null
    return parsed
  } catch {
    return null
  }
}
