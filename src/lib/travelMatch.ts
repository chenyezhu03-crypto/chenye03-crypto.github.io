import { DESTINATIONS } from '../data/destinations'
import type { Destination, TravelPrefs } from './travelTypes'
import {
  destinationMatchesGeo,
  filterDestinationsWithGeo,
  matchesNonGeoPrefs,
} from './travelGeoMatch'

export { matchesNonGeoPrefs }

export function filterDestinations(prefs: TravelPrefs): Destination[] {
  return filterDestinationsWithGeo(prefs)
}

export function getDestinationById(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id)
}

/** 候选过少时给出放宽建议 */
export function relaxHints(prefs: TravelPrefs, count: number): string[] {
  if (count >= 3) return []
  const hints: string[] = []
  if (prefs.geo.l4 || prefs.geo.l3 || prefs.geo.l2 || prefs.geo.l1) {
    hints.push('在「地区」里少选一级，或清空国家')
  }
  if (prefs.vibes.length > 0) hints.push('减少或清空「玩法偏好」')
  if (prefs.month !== 'any') hints.push('把出行月份改成「不限」')
  if (prefs.budget !== 'any') hints.push('放宽预算档位')
  if (prefs.maxDays !== 'any') hints.push('增加可玩天数上限')
  if (prefs.scope !== 'all' && !prefs.geo.l1)
    hints.push('同时考虑国内与出境')
  if (hints.length === 0) hints.push('已是全库，稍后我们会补充更多目的地')
  return hints
}

export { destinationMatchesGeo }
