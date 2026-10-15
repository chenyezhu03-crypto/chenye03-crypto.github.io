import type { GuidePackageId, TemplateModuleId } from './guideTemplateCatalog'
import type { BudgetLevel } from './travelTypes'

export type CustomTripBrief = {
  startDate: string
  endDate: string
  destinationIds: string[]
  customPlaces: string[]
  budget: BudgetLevel | 'any'
  notes: string
  clientLabel: string
  /** 部分 / 标准 / 完整 / 自定义模块 */
  packageId: GuidePackageId
  customModules: TemplateModuleId[]
}

export const CUSTOM_BRIEF_STORAGE_KEY = 'travel-custom-brief-v2'

export function tripNightsAndDays(startDate: string, endDate: string): {
  nights: number
  days: number
} {
  const start = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
  const nights = Math.max(0, diff)
  const days = Math.max(1, nights + 1)
  return { nights, days }
}

export function formatCnDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${m}月${day}日（周${w}）`
}

export function formatDateRange(startDate: string, endDate: string): string {
  const s = new Date(`${startDate}T12:00:00`)
  const e = new Date(`${endDate}T12:00:00`)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${s.getFullYear()}/${pad(s.getMonth() + 1)}/${pad(s.getDate())}–${pad(e.getMonth() + 1)}/${pad(e.getDate())}`
}
