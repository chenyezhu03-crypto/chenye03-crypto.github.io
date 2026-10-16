import { PLATFORM_FEES } from '../platform/manifest'
import { loadCommunityProfile } from './travelCommunityStorage'
import type { UgcGuideListing, UgcPublishMode } from './ugcTypes'

const LISTINGS_KEY = 'travel-ugc-listings-v1'
const LIBRARY_KEY = 'travel-ugc-library-v1'

const SEED: UgcGuideListing[] = [
  {
    id: 'ugc-seed-1',
    authorId: 'demo-author',
    authorName: '岛主阿宁',
    title: '新加坡 4 天懒人版（地铁全覆盖）',
    bodyPreview: 'DAY1 抵达樟宜→市区…（预览 30%）',
    bodyFull:
      '完整 Word 结构：逐日交通、二选一餐饮、预算表、避坑。购买者专属水印：买家ID+购买时间。',
    destinationLabel: '新加坡',
    mode: 'paid',
    priceCny: 12.9,
    createdAt: Date.now() - 86400000 * 3,
    tipsCny: 28,
    sales: 47,
    previewRatio: 0.3,
  },
  {
    id: 'ugc-seed-2',
    authorId: 'demo-author-2',
    authorName: '川西小王',
    title: '成都周边 3 日（免费公开+打赏）',
    bodyPreview: '全文免费可读，欢迎打赏支持创作。',
    bodyFull: 'Day1 市区… Day2 都江堰… 附避坑与包车参考价。',
    destinationLabel: '成都',
    mode: 'free_tip',
    priceCny: 0,
    createdAt: Date.now() - 86400000,
    tipsCny: 156,
    sales: 0,
    previewRatio: 1,
  },
]

function loadListings(): UgcGuideListing[] {
  try {
    const raw = localStorage.getItem(LISTINGS_KEY)
    const user = raw ? (JSON.parse(raw) as UgcGuideListing[]) : []
    const ids = new Set(user.map((x) => x.id))
    return [...user, ...SEED.filter((s) => !ids.has(s.id))]
  } catch {
    return [...SEED]
  }
}

function saveListings(list: UgcGuideListing[]): void {
  const userOnly = list.filter((x) => !x.id.startsWith('ugc-seed'))
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(userOnly))
}

export function listUgcGuides(): UgcGuideListing[] {
  return loadListings().sort((a, b) => b.createdAt - a.createdAt)
}

export function publishUgcGuide(input: {
  title: string
  body: string
  destinationLabel: string
  mode: UgcPublishMode
  priceCny: number
}): UgcGuideListing {
  const profile = loadCommunityProfile()
  const previewLen = Math.max(40, Math.floor(input.body.length * 0.3))
  const item: UgcGuideListing = {
    id: `ugc-${Date.now()}`,
    authorId: profile.userId,
    authorName: profile.displayName,
    title: input.title.trim(),
    bodyPreview: input.body.slice(0, previewLen) + (input.body.length > previewLen ? '…' : ''),
    bodyFull: input.body.trim(),
    destinationLabel: input.destinationLabel.trim() || '未标注',
    mode: input.mode,
    priceCny: input.mode === 'paid' ? Math.min(99, Math.max(1, input.priceCny)) : 0,
    createdAt: Date.now(),
    tipsCny: 0,
    sales: 0,
    previewRatio: input.mode === 'paid' ? 0.3 : 1,
  }
  const all = loadListings()
  all.unshift(item)
  saveListings(all)
  return item
}

export function platformCut(mode: UgcPublishMode, amountCny: number): number {
  const rate =
    mode === 'free_tip'
      ? PLATFORM_FEES.ugcTipRate
      : PLATFORM_FEES.ugcPaidGuideRate
  return Math.round(amountCny * rate * 100) / 100
}

export function watermarkLabel(buyerName: string): string {
  return `全球中文旅行文旅 · 购买者 ${buyerName} · 防盗水印 · 禁止倒卖`
}

export function purchasedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIBRARY_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function markPurchased(id: string): void {
  const ids = new Set(purchasedIds())
  ids.add(id)
  localStorage.setItem(LIBRARY_KEY, JSON.stringify([...ids]))
}

export function simulateTip(listingId: string, amountCny: number): void {
  const all = loadListings()
  const i = all.findIndex((x) => x.id === listingId)
  if (i < 0) return
  all[i] = { ...all[i], tipsCny: all[i].tipsCny + amountCny }
  saveListings(all)
}

export function simulatePurchase(listingId: string): void {
  markPurchased(listingId)
  const all = loadListings()
  const i = all.findIndex((x) => x.id === listingId)
  if (i >= 0) {
    all[i] = { ...all[i], sales: all[i].sales + 1 }
    saveListings(all)
  }
}
