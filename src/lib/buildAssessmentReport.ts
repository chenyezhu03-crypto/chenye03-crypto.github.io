import { getDestinationKnowledge, difficultyLabel } from './destinationKnowledge'
import { getDestinationById } from './travelMatch'
import type { BudgetLevel } from './travelTypes'
import { BUDGET_LABELS } from './travelTypes'
import { V1_PRICING } from '../platform/manifest'

export type AssessmentInput = {
  destinationIds: string[]
  travelers: number
  budget: BudgetLevel | 'any'
  pace: 'relaxed' | 'balanced' | 'packed'
  notes: string
}

export type AssessmentReport = {
  title: string
  lines: string[]
  /** 0–100 */
  fitScore: number
  priceCny: number
}

function paceLabel(p: AssessmentInput['pace']): string {
  if (p === 'relaxed') return '慢节奏'
  if (p === 'packed') return '紧凑多打卡'
  return '均衡'
}

export function buildAssessmentReport(input: AssessmentInput): AssessmentReport {
  const stops = input.destinationIds
    .map((id) => getDestinationById(id))
    .filter(Boolean)
  const names = stops.map((s) => s!.name).join('、') || '未选目的地'
  let score = 72
  const risks: string[] = []
  const advice: string[] = []

  stops.forEach((dest) => {
    const k = getDestinationKnowledge(dest!.id)
    if (!k) return
    score -= (k.difficultyLevel - 2) * 4
    if (input.budget === 'low' && k.difficultyLevel >= 4) {
      score -= 8
      risks.push(`${dest!.name}：预算偏紧时挑战较大`)
    }
    if (dest!.scope === 'abroad') {
      advice.push(`${dest!.name}：优先确认签证与入境材料`)
    }
    risks.push(...k.pitfalls.split('；').filter(Boolean).slice(0, 1))
  })

  if (input.destinationIds.length > 2) {
    score -= 6
    advice.push('多国串联：预留转场日与缓冲，避免每日换城市')
  }
  if (input.pace === 'packed' && input.destinationIds.length > 1) {
    score -= 5
    risks.push('紧凑节奏 + 多目的地易疲劳')
  }

  score = Math.max(35, Math.min(96, Math.round(score)))

  const suitable = score >= 70 ? '较适合出发' : score >= 55 ? '可行但需压缩期望' : '建议调整目的地或预算'

  const lines: string[] = [
    `目的地个人适配测评 · ${names}`,
    `参考价  ¥${V1_PRICING.assessmentReportCny.toFixed(2)} / 份`,
    '——',
    `综合适配分  ${score} / 100`,
    `结论  ${suitable}`,
    `出行人数  ${input.travelers} 人 · 节奏  ${paceLabel(input.pace)}`,
    input.budget !== 'any'
      ? `预算档位  ${BUDGET_LABELS[input.budget]}`
      : '预算档位  未指定',
    '——',
    '分项评估',
  ]

  stops.forEach((dest) => {
    const k = getDestinationKnowledge(dest!.id)
    if (!k) return
    lines.push(
      `${dest!.name}`,
      `难度  ${difficultyLabel(k.difficultyLevel)}（${k.difficultyLevel}/5）`,
      `预算区间  ${k.budgetRangeCny}`,
      `签证/证件  ${k.visaForMainland.slice(0, 120)}…`,
      `是否建议本次前往  ${score >= 60 ? '是（仍需自行核实签证与订单）' : '建议再比较其它目的地'}`,
    )
  })

  lines.push('——', '风险提示', ...(risks.length ? risks.slice(0, 5) : ['暂无额外提示']))
  lines.push('——', '出行建议', ...(advice.length ? advice : ['提前 2–4 周确认证件与热门预约']))
  if (input.notes.trim()) {
    lines.push('——', '您的补充', input.notes.trim())
  }
  lines.push(
    '——',
    '免责声明  本报告为平台规则与知识库生成的参考意见，不构成签证或安全官方结论。',
  )

  return {
    title: `${names} · 适配测评`,
    lines,
    fitScore: score,
    priceCny: V1_PRICING.assessmentReportCny,
  }
}

/** 免费预览仅展示部分行 */
export function assessmentPreviewLines(full: AssessmentReport): string[] {
  return full.lines.slice(0, 8)
}
