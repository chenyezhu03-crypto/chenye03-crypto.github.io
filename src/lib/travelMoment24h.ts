import { loadCommunityProfile } from './travelCommunityStorage'

export type Moment24h = {
  id: string
  userId: string
  authorName: string
  authorEmoji: string
  body: string
  tags: string[]
  createdAt: number
  expiresAt: number
  likes: number
}

const KEY = 'travel-moments-24h-v1'

const TTL_MS = 24 * 60 * 60 * 1000

export function loadMoments24h(): Moment24h[] {
  const now = Date.now()
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as Moment24h[]) : []
    const alive = list.filter((m) => m.expiresAt > now)
    if (alive.length !== list.length) {
      localStorage.setItem(KEY, JSON.stringify(alive))
    }
    return alive.sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

export function publishMoment24h(body: string, tags: string[]): Moment24h {
  const profile = loadCommunityProfile()
  const now = Date.now()
  const m: Moment24h = {
    id: `m-${now}`,
    userId: profile.userId,
    authorName: profile.displayName,
    authorEmoji: profile.avatarEmoji,
    body: body.trim(),
    tags: tags.filter(Boolean),
    createdAt: now,
    expiresAt: now + TTL_MS,
    likes: 0,
  }
  const list = [m, ...loadMoments24h()]
  localStorage.setItem(KEY, JSON.stringify(list))
  return m
}

export function likeMoment(id: string): void {
  const list = loadMoments24h()
  const i = list.findIndex((x) => x.id === id)
  if (i < 0) return
  list[i] = { ...list[i], likes: list[i].likes + 1 }
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function momentRemainingLabel(expiresAt: number): string {
  const h = Math.max(0, Math.ceil((expiresAt - Date.now()) / 3600000))
  return h >= 24 ? '24h 内' : `${h} 小时后过期`
}
