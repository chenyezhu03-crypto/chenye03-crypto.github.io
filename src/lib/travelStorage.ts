import type { TravelPrefs } from './travelTypes'

const KEY = 'travel-prefs-v1'

export const DEFAULT_TRAVEL_PREFS: TravelPrefs = {
  scope: 'all',
  vibes: [],
  budget: 'any',
  month: 'any',
  maxDays: 'any',
}

export function loadTravelPrefs(): TravelPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_TRAVEL_PREFS }
    const parsed = JSON.parse(raw) as TravelPrefs
    return { ...DEFAULT_TRAVEL_PREFS, ...parsed }
  } catch {
    return { ...DEFAULT_TRAVEL_PREFS }
  }
}

export function saveTravelPrefs(prefs: TravelPrefs): void {
  localStorage.setItem(KEY, JSON.stringify(prefs))
}
