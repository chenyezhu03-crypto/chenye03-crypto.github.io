import type { Destination } from './travelTypes'
import type { TravelGuideDoc } from './travelGuideTypes'

export type GuideCatalogEntry = {
  id: string
  label: string
  destinationId: string
  nights: number
  days: number
}

export const GUIDE_CATALOG: GuideCatalogEntry[] = [
  {
    id: 'singapore-5n6d',
    label: '新加坡 5 晚 6 天（完整图文版）',
    destinationId: 'singapore',
    nights: 5,
    days: 6,
  },
]

export function guidesForDestination(destinationId: string): GuideCatalogEntry[] {
  return GUIDE_CATALOG.filter((g) => g.destinationId === destinationId)
}

export function getGuideCatalogEntry(guideId: string): GuideCatalogEntry | undefined {
  return GUIDE_CATALOG.find((g) => g.id === guideId)
}

export async function loadGuideDocument(
  guideId: string,
): Promise<TravelGuideDoc | null> {
  if (guideId === 'singapore-5n6d') {
    const mod = await import('../data/guides/singapore-5n6d.json')
    return mod.default as TravelGuideDoc
  }
  return null
}

/** 无完整稿时，按目的地信息生成简版攻略（结构对齐完整版目录） */
export function buildGenericGuide(
  dest: Destination,
  nights: number,
  days: number,
): TravelGuideDoc {
  const vibe = dest.highlights.join('、')
  const months = dest.bestMonths.join('、')
  return {
    id: `generic-${dest.id}`,
    title: `${dest.name}${nights}晚${days}天出行攻略（简版）`,
    destinationId: dest.id,
    nights,
    days,
    subtitle: `${dest.region} · 出发前请核对签证、航司与当地政策`,
    lines: [
      `${dest.name.toUpperCase()} · 建议 ${days} 天行程`,
      `${dest.name}${nights}晚${days}天图文导游（简版）`,
      dest.tagline,
      '行程一眼看懂',
      ...Array.from({ length: days }, (_, i) => {
        const d = i + 1
        if (d === 1)
          return `DAY ${d}  抵达 → 入住 → 市区轻量熟悉（${dest.highlights[0] ?? '核心区域'}）`
        if (d === days)
          return `DAY ${d}  收尾购物/补漏 → 前往机场/车站 → 返程`
        const h = dest.highlights[(d - 2) % dest.highlights.length]
        return `DAY ${d}  ${h} · 按体力安排午餐休息与晚间自由活动`
      }),
      '出发前 01',
      '证件与入境',
      `目的地：${dest.region}（${dest.scope === 'domestic' ? '国内' : '出境'}）`,
      `较佳月份（参考）：${months} 月`,
      `预算档位：${dest.budget.join(' / ')}`,
      dest.tips,
      '出发前 02',
      '天气与行李',
      '出发前查看逐日预报；户外与室内项目交替，避免正午暴晒或暴雨硬扛。',
      '出发前 03',
      '交通与支付',
      '下载离线地图；境外提前确认漫游或本地 SIM/eSIM；常用支付绑定并备少量现金。',
      '出发前最后检查 注意事项与预算',
      `建议玩法：${vibe}`,
      '付款前再看结算页；门票与预约以官方渠道为准。',
      '官方来源菜单',
      '出行前请自行打开目的地旅游局、使馆/领事提醒与航司订单复核。',
    ],
  }
}
