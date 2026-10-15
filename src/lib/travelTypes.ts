export type TravelScope = 'domestic' | 'abroad'

export type TravelVibe =
  | 'sea'
  | 'mountain'
  | 'city'
  | 'culture'
  | 'nature'
  | 'food'

export type BudgetLevel = 'low' | 'mid' | 'high'

export interface Destination {
  id: string
  name: string
  region: string
  scope: TravelScope
  vibes: TravelVibe[]
  budget: BudgetLevel[]
  bestMonths: number[]
  daysIdeal: [number, number]
  tagline: string
  highlights: string[]
  tips: string
}

export type ScopeFilter = 'all' | 'domestic' | 'abroad'

/** 地区路径：一级国内/国外 → 二级洲/大区 → 三级子区域 → 四级国家 */
export type TravelGeoPath = {
  l1: string | null
  l2: string | null
  l3: string | null
  l4: string | null
}

export const EMPTY_GEO_PATH: TravelGeoPath = {
  l1: null,
  l2: null,
  l3: null,
  l4: null,
}

export interface TravelPrefs {
  scope: ScopeFilter
  geo: TravelGeoPath
  vibes: TravelVibe[]
  budget: BudgetLevel | 'any'
  month: number | 'any'
  maxDays: number | 'any'
}

export const VIBE_LABELS: Record<TravelVibe, string> = {
  sea: '看海',
  mountain: '爬山',
  city: '城市漫游',
  culture: '人文历史',
  nature: '自然风景',
  food: '吃喝为主',
}

export const BUDGET_LABELS: Record<BudgetLevel, string> = {
  low: '省钱（人均约 ≤3k/趟）',
  mid: '适中（约 3k–8k）',
  high: '宽裕（8k+）',
}

export const MONTH_LABELS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
] as const
