const FAV_KEY = 'toujian-pick-favorites-v1'

export function loadPickFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function togglePickFavorite(jobId: string): string[] {
  const set = new Set(loadPickFavorites())
  if (set.has(jobId)) set.delete(jobId)
  else set.add(jobId)
  const next = Array.from(set)
  localStorage.setItem(FAV_KEY, JSON.stringify(next))
  return next
}

export function isPickFavorite(jobId: string): boolean {
  return loadPickFavorites().includes(jobId)
}
