/** 两段行程日期是否有交集（含边界同一天） */
export function tripsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  if (!aStart || !aEnd || !bStart || !bEnd) return false
  if (aEnd < aStart || bEnd < bStart) return false
  return aStart <= bEnd && bStart <= aEnd
}

export function overlapDayCount(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): number {
  if (!tripsOverlap(aStart, aEnd, bStart, bEnd)) return 0
  const start = aStart > bStart ? aStart : bStart
  const end = aEnd < bEnd ? aEnd : bEnd
  const s = new Date(`${start}T12:00:00`)
  const e = new Date(`${end}T12:00:00`)
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1
}
