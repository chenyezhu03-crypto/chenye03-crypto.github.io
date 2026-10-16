import type { AssessmentInput } from './buildAssessmentReport'
import { V1_PRICING } from '../platform/manifest'

const UNLOCK = 'travel-assessment-unlock-v1:'

function key(input: AssessmentInput): string {
  return (
    UNLOCK +
    JSON.stringify({
      d: [...input.destinationIds].sort(),
      t: input.travelers,
      b: input.budget,
      p: input.pace,
    })
  )
}

export function hasAssessmentUnlock(input: AssessmentInput): boolean {
  try {
    return sessionStorage.getItem(key(input)) === '1'
  } catch {
    return false
  }
}

export function markAssessmentUnlock(input: AssessmentInput): void {
  sessionStorage.setItem(key(input), '1')
}

export function assessmentPriceLabel(): string {
  return `¥${V1_PRICING.assessmentReportCny.toFixed(2)}`
}
