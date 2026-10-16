import { DESTINATIONS } from '../data/destinations'
import { KNOWLEDGE_BY_DESTINATION_ID } from '../data/destinationKnowledgeEntries'
import type { Destination } from './travelTypes'

/** 中国护照视角 · 固定知识库字段（V1 壁垒） */
export type DestinationKnowledge = {
  destinationId: string
  /** 签证（中国大陆公民） */
  visaForMainland: string
  entryRequirements: string
  taboosAndSafety: string
  currencyAndPrices: string
  bestSeason: string
  hotspots: string[]
  localFood: string[]
  festivalsAndCulture: string
  pitfalls: string
  /** 难度 1–5（5 最难） */
  difficultyLevel: 1 | 2 | 3 | 4 | 5
  budgetRangeCny: string
  updatedNote: string
}

export function getDestinationKnowledge(
  destinationId: string,
): DestinationKnowledge | null {
  const entry = KNOWLEDGE_BY_DESTINATION_ID[destinationId]
  if (entry) return entry
  const dest = DESTINATIONS.find((d) => d.id === destinationId)
  if (!dest) return null
  return synthesizeFromDestination(dest)
}

function synthesizeFromDestination(dest: Destination): DestinationKnowledge {
  const abroad = dest.scope === 'abroad'
  return {
    destinationId: dest.id,
    visaForMainland: abroad
      ? '请查阅国家移民管理局/目的地驻华使领馆最新政策（本页为整理参考，非官方批复）。'
      : '国内行程：携带身份证件；涉及港澳/台湾等跨境段另备对应证件。',
    entryRequirements: abroad
      ? '护照有效期、返程机票/酒店订单、入境卡与健康申报等以入境当日口岸要求为准。'
      : '高铁/航班实名购票；部分景区需预约。',
    taboosAndSafety: dest.tips || '注意人身与财物安全，遵守当地法规与宗教习俗。',
    currencyAndPrices: `参考预算档位：${dest.budget.join(' / ')}（详见目的地卡片）。`,
    bestSeason: `较佳月份：${dest.bestMonths.map((m) => `${m}月`).join('、')}`,
    hotspots: [...dest.highlights],
    localFood: dest.vibes.includes('food') ? ['本地特色餐饮（待补充详单）'] : ['见行程攻略美食章节'],
    festivalsAndCulture: '关注当地法定假日与大型活动，旺季机票酒店上浮。',
    pitfalls: dest.tips,
    difficultyLevel: abroad ? 3 : 2,
    budgetRangeCny:
      dest.budget.includes('low') && !dest.budget.includes('high')
        ? '人均约 3k–8k/趟（不含国际机票）'
        : '人均约 5k–15k+/趟（不含国际机票）',
    updatedNote: '自动生成摘要 · 完整稿持续录入中',
  }
}

export function difficultyLabel(level: DestinationKnowledge['difficultyLevel']): string {
  const map = ['', '入门', '轻松', '适中', '挑战', '硬核'] as const
  return map[level] ?? '适中'
}
