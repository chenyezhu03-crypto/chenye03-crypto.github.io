import { REFUND_POLICY } from './manifest'

const REGEN_KEY = 'travel-paid-regen-v1:'

export function paidRegenerateAllowance(): number {
  return REFUND_POLICY.freeRegenerateAfterPay
}

export function regenStorageKey(orderKey: string): string {
  return `${REGEN_KEY}${orderKey}`
}

export function regensUsed(orderKey: string): number {
  try {
    const n = sessionStorage.getItem(regenStorageKey(orderKey))
    return n ? Number.parseInt(n, 10) : 0
  } catch {
    return 0
  }
}

export function canFreeRegenerate(orderKey: string): boolean {
  return regensUsed(orderKey) < paidRegenerateAllowance()
}

export function consumeFreeRegenerate(orderKey: string): boolean {
  if (!canFreeRegenerate(orderKey)) return false
  const next = regensUsed(orderKey) + 1
  sessionStorage.setItem(regenStorageKey(orderKey), String(next))
  return true
}

export function refundPolicyLines(): string[] {
  return [
    `付费后免费重生成 ${REFUND_POLICY.freeRegenerateAfterPay} 次（同一订单参数）`,
    `${REFUND_POLICY.manualRefundWindowHours} 小时内、${REFUND_POLICY.manualRefundRequires} → 可人工退款`,
    `不退款：${REFUND_POLICY.noRefundReasons.join('、')}`,
  ]
}
