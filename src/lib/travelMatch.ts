import { DESTINATIONS } from '../data/destinations'
import type { Destination, TravelPrefs } from './travelTypes'

function matchesScope(d: Destination, scope: TravelPrefs['scope']): boolean {
  if (scope === 'all') return true
  return d.scope === scope
}

function matchesBudget(d: Destination, budget: TravelPrefs['budget']): boolean {
  if (budget === 'any') return true
  return d.budget.includes(budget)
}

function matchesMonth(d: Destination, month: TravelPrefs['month']): boolean {
  if (month === 'any') return true
  return d.bestMonths.includes(month)
}

function matchesDays(d: Destination, maxDays: TravelPrefs['maxDays']): boolean {
  if (maxDays === 'any') return true
  return d.daysIdeal[0] <= maxDays
}

function matchesVibes(d: Destination, vibes: TravelPrefs['vibes']): boolean {
  if (vibes.length === 0) return true
  return vibes.some((v) => d.vibes.includes(v))
}

export function filterDestinations(prefs: TravelPrefs): Destination[] {
  return DESTINATIONS.filter(
    (d) =>
      matchesScope(d, prefs.scope) &&
      matchesBudget(d, prefs.budget) &&
      matchesMonth(d, prefs.month) &&
      matchesDays(d, prefs.maxDays) &&
      matchesVibes(d, prefs.vibes),
  )
}

export function getDestinationById(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id)
}

/** 候选过少时给出放宽建议 */
export function relaxHints(prefs: TravelPrefs, count: number): string[] {
  if (count >= 3) return []
  const hints: string[] = []
  if (prefs.vibes.length > 0) hints.push('减少或清空「玩法偏好」')
  if (prefs.month !== 'any') hints.push('把出行月份改成「不限」')
  if (prefs.budget !== 'any') hints.push('放宽预算档位')
  if (prefs.maxDays !== 'any') hints.push('增加可玩天数上限')
  if (prefs.scope !== 'all') hints.push('同时考虑国内与出境')
  if (hints.length === 0) hints.push('已是全库，稍后我们会补充更多目的地')
  return hints
}
