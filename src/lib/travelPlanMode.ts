/** 第一步：顾客是否已有出行计划（决定是否走大转盘） */

export type TravelPlanMode = 'has_plan' | 'needs_help'

const KEY = 'travel-plan-mode-v1'

export function loadTravelPlanMode(): TravelPlanMode | null {
  try {
    const v = sessionStorage.getItem(KEY)
    if (v === 'has_plan' || v === 'needs_help') return v
    return null
  } catch {
    return null
  }
}

export function saveTravelPlanMode(mode: TravelPlanMode): void {
  sessionStorage.setItem(KEY, mode)
}

export function clearTravelPlanMode(): void {
  sessionStorage.removeItem(KEY)
}

export function planModeLabel(mode: TravelPlanMode | null): string {
  if (mode === 'has_plan') return '已有计划 · 直接做攻略'
  if (mode === 'needs_help') return '还没想好 · 用大转盘帮选'
  return '未选择'
}
