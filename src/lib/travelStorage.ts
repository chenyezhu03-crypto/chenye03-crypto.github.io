import { EMPTY_GEO_PATH, type TravelPrefs } from './travelTypes'

const KEY = 'travel-prefs-v2'

export const DEFAULT_TRAVEL_PREFS: TravelPrefs = {
  scope: 'all',
  geo: { ...EMPTY_GEO_PATH },
  vibes: [],
  budget: 'any',
  month: 'any',
  maxDays: 'any',
}

export function loadTravelPrefs(): TravelPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_TRAVEL_PREFS, geo: { ...EMPTY_GEO_PATH } }
    const parsed = JSON.parse(raw) as TravelPrefs
    return {
      ...DEFAULT_TRAVEL_PREFS,
      ...parsed,
      geo: { ...EMPTY_GEO_PATH, ...parsed.geo },
    }
  } catch {
    return { ...DEFAULT_TRAVEL_PREFS }
  }
}

export function saveTravelPrefs(prefs: TravelPrefs): void {
  localStorage.setItem(KEY, JSON.stringify(prefs))
}
