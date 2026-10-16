import type { CustomTripBrief } from './customTripTypes'
import { quotePrice } from './guideTemplateCatalog'

const UNLOCK_PREFIX = 'travel-guide-paid-unlock-v1:'

function unlockKey(brief: CustomTripBrief): string {
  const q = quotePrice(brief.packageId, brief.customModules)
  const payload = JSON.stringify({
    p: brief.packageId,
    m: [...q.moduleIds].sort(),
    s: brief.startDate,
    e: brief.endDate,
    d: brief.destinationIds,
    price: q.priceCny,
  })
  return `${UNLOCK_PREFIX}${payload}`
}

export function hasPaidUnlock(brief: CustomTripBrief): boolean {
  const q = quotePrice(brief.packageId, brief.customModules)
  if (q.priceCny <= 0) return true
  try {
    return sessionStorage.getItem(unlockKey(brief)) === '1'
  } catch {
    return false
  }
}

/** 演示环境：模拟支付成功（接入微信/Stripe 后替换） */
export function markPaidUnlock(brief: CustomTripBrief): void {
  const q = quotePrice(brief.packageId, brief.customModules)
  if (q.priceCny <= 0) return
  sessionStorage.setItem(unlockKey(brief), '1')
}

export function unlockPriceLabel(brief: CustomTripBrief): string {
  const q = quotePrice(brief.packageId, brief.customModules)
  return q.priceCny <= 0 ? '免费' : `¥${q.priceCny.toFixed(2)}`
}

export function paidOrderKey(brief: CustomTripBrief): string {
  return unlockKey(brief)
}
