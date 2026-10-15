import { DESTINATION_GEO } from '../data/destinationGeo'
import { DESTINATIONS } from '../data/destinations'
import {
  getGeoChildren,
  getGeoNode,
  type GeoNode,
} from '../data/travelGeo'
import type { Destination, TravelGeoPath, TravelPrefs } from './travelTypes'

export function matchesNonGeoPrefs(
  d: Destination,
  prefs: TravelPrefs,
): boolean {
  const scope =
    prefs.geo.l1 != null ? scopeFromGeo(prefs.geo) : prefs.scope
  if (scope !== 'all' && d.scope !== scope) return false
  if (prefs.budget !== 'any' && !d.budget.includes(prefs.budget)) return false
  if (prefs.month !== 'any' && !d.bestMonths.includes(prefs.month)) return false
  if (prefs.maxDays !== 'any' && d.daysIdeal[0] > prefs.maxDays) return false
  if (prefs.vibes.length > 0 && !prefs.vibes.some((v) => d.vibes.includes(v)))
    return false
  return true
}

export function scopeFromGeo(path: TravelGeoPath): TravelPrefs['scope'] {
  if (path.l1 === 'domestic') return 'domestic'
  if (path.l1 === 'abroad') return 'abroad'
  return 'all'
}

function geoFor(id: string) {
  return DESTINATION_GEO[id]
}

export function destinationMatchesGeo(
  d: Destination,
  path: TravelGeoPath,
): boolean {
  const g = geoFor(d.id)
  if (!g) return false
  if (path.l1 === 'domestic' && d.scope !== 'domestic') return false
  if (path.l1 === 'abroad' && d.scope !== 'abroad') return false
  if (path.l2 && g.zoneId !== path.l2) return false
  if (path.l3 && g.subRegionId !== path.l3) return false
  if (path.l4 && g.countryId !== path.l4) return false
  return true
}

export function filterDestinationsWithGeo(prefs: TravelPrefs): Destination[] {
  return DESTINATIONS.filter(
    (d) =>
      matchesNonGeoPrefs(d, prefs) && destinationMatchesGeo(d, prefs.geo),
  )
}

/** 有候选目的地的子节点（用于转盘/点选） */
export function geoChildrenWithDestinations(
  parentId: string | null,
  prefs: TravelPrefs,
  partial: TravelGeoPath,
): GeoNode[] {
  const children = getGeoChildren(parentId)
  return children.filter((node) => {
    const trial = applyGeoPick(partial, node.level, node.id)
    return filterDestinationsWithGeo({ ...prefs, geo: trial }).length > 0
  })
}

export function applyGeoPick(
  path: TravelGeoPath,
  level: 1 | 2 | 3 | 4,
  id: string,
): TravelGeoPath {
  const next = { ...path }
  if (level === 1) {
    next.l1 = id
    next.l2 = null
    next.l3 = null
    next.l4 = null
  } else if (level === 2) {
    next.l2 = id
    next.l3 = null
    next.l4 = null
  } else if (level === 3) {
    next.l3 = id
    next.l4 = null
  } else {
    next.l4 = id
  }
  return next
}

export function pickRandomDestinations(
  pool: Destination[],
  count: number,
): Destination[] {
  if (pool.length === 0) return []
  const n = Math.min(count, pool.length)
  const copy = [...pool]
  const out: Destination[] = []
  for (let i = 0; i < n; i++) {
    const j = Math.floor(Math.random() * copy.length)
    out.push(copy[j])
    copy.splice(j, 1)
  }
  return out
}

export function formatGeoBreadcrumb(path: TravelGeoPath): string {
  const parts: string[] = []
  for (const id of [path.l1, path.l2, path.l3, path.l4]) {
    if (!id) break
    parts.push(getGeoNode(id)?.label ?? id)
  }
  return parts.join(' › ')
}
