/** 进入「第二步：定制 Word 攻略」的链接（可不经过转盘） */
export function travelCustomPath(options?: {
  dest?: string
  dests?: string[]
}): string {
  const params = new URLSearchParams()
  if (options?.dest) params.set('dest', options.dest)
  if (options?.dests?.length) params.set('dests', options.dests.join(','))
  const q = params.toString()
  return q ? `/travel/custom?${q}` : '/travel/custom'
}
