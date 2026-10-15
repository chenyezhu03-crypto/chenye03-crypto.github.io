import { DESTINATIONS } from '../data/destinations'
import { guidesForDestination, loadGuideDocument } from './travelGuideCatalog'
import type { CustomTripBrief } from './customTripTypes'
import {
  formatCnDate,
  formatDateRange,
  tripNightsAndDays,
} from './customTripTypes'
import { getDestinationById } from './travelMatch'
import type { Destination } from './travelTypes'
import { BUDGET_LABELS, type BudgetLevel } from './travelTypes'
import type { TravelGuideDoc } from './travelGuideTypes'

function budgetGuideText(budget: CustomTripBrief['budget']): string[] {
  if (budget === 'any') {
    return [
      '预算说明  餐饮、交通、门票按实际选择记录；付款前核对结算页与票种（成人/儿童/居民价）。',
    ]
  }
  const label = BUDGET_LABELS[budget as BudgetLevel]
  const tips: Record<BudgetLevel, string[]> = {
    low: [
      '预算说明  偏省钱：优先公共交通与本地小吃，门票选核心 1–2 项，住宿选交通便利区域。',
      '预算  人均整趟可参考 ≤3k 人民币量级（不含国际机票），具体以您出发城市与季节为准。',
    ],
    mid: [
      '预算说明  适中型：核心景点+1–2 顿特色餐，打车与地铁结合，住宿中档。',
      '预算  人均整趟约 3k–8k 人民币量级（不含国际机票），热门季上浮 10–20%。',
    ],
    high: [
      '预算说明  宽裕型：可安排精品餐、快速通行或更好住宿；仍建议热门项目提前预约。',
      '预算  人均 8k+ 人民币起（不含国际机票），海岛/长线需单独核算机酒。',
    ],
  }
  return [`预算档位  ${label}`, ...tips[budget as BudgetLevel]]
}

function addDays(iso: string, offset: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function buildDayPlan(
  brief: CustomTripBrief,
  stops: Destination[],
  days: number,
): string[] {
  if (stops.length === 0 && brief.customPlaces.length > 0) {
    const lines: string[] = ['行程一眼看懂']
    for (let i = 1; i <= days; i++) {
      const iso = addDays(brief.startDate, i - 1)
      const place = brief.customPlaces[(i - 1) % brief.customPlaces.length]
      lines.push(`DAY ${i}  ${formatCnDate(iso)} ${place} · 请补充交通与预约。`)
    }
    return lines
  }
  const lines: string[] = ['行程一眼看懂', 'Routes with practical details']
  if (days === 1) {
    lines.push(
      `DAY 1  ${formatCnDate(brief.startDate)} 抵达与离开同日：${stops.map((s) => s.name).join(' · ')} 择重点执行。`,
    )
    return lines
  }

  const names = stops.map((s) => s.name).join(' → ')
  lines.push(`主线路  ${names}${brief.customPlaces.length ? ` · ${brief.customPlaces.join(' · ')}` : ''}`)

  const middleDays = days - 2
  const weights = stops.map((s) => s.daysIdeal[1])
  const totalW = weights.reduce((a, b) => a + b, 0) || stops.length

  const alloc: number[] = stops.map((_, i) =>
    middleDays <= 0
      ? 0
      : Math.max(1, Math.round((middleDays * weights[i]) / totalW)),
  )
  let sum = alloc.reduce((a, b) => a + b, 0)
  while (sum > middleDays && alloc.some((x) => x > 1)) {
    const i = alloc.indexOf(Math.max(...alloc))
    alloc[i]--
    sum--
  }
  while (sum < middleDays) {
    alloc[0 % alloc.length]++
    sum++
  }

  lines.push(
    `DAY 1  ${formatCnDate(brief.startDate)} 抵达 → 入住 → 市区轻量熟悉（${stops[0]?.highlights[0] ?? '核心区域'}）。`,
  )

  let dayIdx = 2
  stops.forEach((dest, si) => {
    for (let k = 0; k < alloc[si]; k++) {
      const iso = addDays(brief.startDate, dayIdx - 1)
      const hi = dest.highlights[k % dest.highlights.length]
      lines.push(
        `DAY ${dayIdx}  ${formatCnDate(iso)} ${dest.name} · ${hi} · 午餐休息后安排晚间自由活动。`,
      )
      dayIdx++
    }
  })

  while (dayIdx < days) {
    const iso = addDays(brief.startDate, dayIdx - 1)
    lines.push(
      `DAY ${dayIdx}  ${formatCnDate(iso)} 机动/缓冲日 · 补漏、购物或应对天气。`,
    )
    dayIdx++
  }

  lines.push(
    `DAY ${days}  ${formatCnDate(brief.endDate)} 退房 → 前往机场/车站 → 返程（以订单时间为准）。`,
  )
  return lines
}

function preTripBlocks(stops: Destination[]): string[] {
  const hasAbroad = stops.some((s) => s.scope === 'abroad')
  const hasDomestic = stops.some((s) => s.scope === 'domestic')
  const lines: string[] = []

  lines.push('出发前 01', '证件与入境申报')
  if (hasAbroad) {
    lines.push(
      '证件  护照有效期建议 ≥6 个月；签证/免签/入境卡政策以目的地官方与使馆信息为准，提交前逐字核对航班与酒店英文地址。',
      '订单  往返机票、酒店英文全名与地址、入住退房日期；离线保存一份。',
    )
  }
  if (hasDomestic) {
    lines.push(
      '证件  国内行程携带身份证件；港澳通行证/签注、台湾通行证等按目的地要求准备。',
    )
  }
  if (hasAbroad && hasDomestic) {
    lines.push('混合行程  分别核对每一段交通的证件与行李规定。')
  }

  lines.push('出发前 02', '天气与行李')
  lines.push(
    '出发前一周起关注逐日预报；湿热/干冷/高原按目的地分层穿衣，室内空调偏冷可带薄外套。',
  )

  lines.push('出发前 03', '交通与支付')
  if (hasAbroad) {
    lines.push(
      'App  离线地图、翻译、当地打车/地铁 App；境外漫游或 eSIM 提前开通；备少量当地现金。',
    )
  } else {
    lines.push('App  地图导航、铁路/航司官方渠道；移动支付与少量现金并用。')
  }

  return lines
}

function destinationDetailBlocks(stops: Destination[], customPlaces: string[]): string[] {
  const lines: string[] = []
  stops.forEach((d) => {
    lines.push(`【${d.name}】${d.region}`, d.tagline)
    lines.push(`推荐玩法  ${d.highlights.join(' · ')}`)
    lines.push(`小贴士  ${d.tips}`)
    lines.push('官方/核实来源  出行前请打开当地旅游局/景区官网核对开放时间与票价。')
  })
  customPlaces.forEach((name) => {
    lines.push(`【${name}】（客户指定）`, '请自行补充交通、预约与开放时间；本段为占位，可在 Word 中编辑。')
  })
  return lines
}

async function singaporeAppendix(): Promise<string[]> {
  const full = await loadGuideDocument('singapore-5n6d')
  if (!full) return []
  const start = full.lines.findIndex((l) => l.startsWith('出发前 01'))
  if (start < 0) return []
  return [
    '附录 · 新加坡完整版正文（来自标准 5 晚 6 天模板）',
    '图文说明  下列内容可与上方个性化日期对照使用；涉及具体日期的句子请以您本次订单为准。',
    ...full.lines.slice(start),
  ]
}

export async function buildCustomTripGuide(
  brief: CustomTripBrief,
): Promise<TravelGuideDoc> {
  const stops = brief.destinationIds
    .map((id) => getDestinationById(id))
    .filter((d): d is Destination => Boolean(d))

  const { nights, days } = tripNightsAndDays(brief.startDate, brief.endDate)
  const range = formatDateRange(brief.startDate, brief.endDate)
  const titleNames =
    stops.map((s) => s.name).join('+') ||
    brief.customPlaces.join('+') ||
    '定制行程'
  const client = brief.clientLabel.trim()
  const title = `${titleNames}${nights}晚${days}天个性化图文导游`

  const lines: string[] = [
    `${titleNames.toUpperCase()} · ${range}`,
    title,
    client ? `${client} · 出发 ${formatCnDate(brief.startDate)}，返程 ${formatCnDate(brief.endDate)}` : `出发 ${formatCnDate(brief.startDate)}，返程 ${formatCnDate(brief.endDate)} · 出发前以机票/酒店订单复核`,
    ...buildDayPlan(brief, stops, days),
    '活动怎么放才不赶',
    'Choose one evening theme',
    '主推荐  首日轻量、中间安排核心景点、末日前移值机；不要把两个相距很远的夜场排在同一晚。',
  ]

  if (brief.notes.trim()) {
    lines.push('客户需求摘要', brief.notes.trim())
  }

  lines.push(...preTripBlocks(stops.length ? stops : DESTINATIONS.slice(0, 1)))
  lines.push(...budgetGuideText(brief.budget))
  lines.push(...destinationDetailBlocks(stops, brief.customPlaces))

  lines.push('出发前最后检查 注意事项与预算')
  lines.push(
    '出发前检查  证件/订单/保险 · 每日预报 · 预约截图 · 付款方式 · 同行人联系方式。',
    '官方来源菜单  航司、酒店、景区官网与地图链接请在 Word 中自行粘贴最新 URL。',
  )

  const onlySg =
    stops.length === 1 &&
    stops[0].id === 'singapore' &&
    guidesForDestination('singapore').length > 0

  if (onlySg) {
    lines.push(...(await singaporeAppendix()))
  }

  return {
    id: 'custom',
    title,
    destinationId: stops[0]?.id ?? 'custom',
    nights,
    days,
    dateRange: range,
    subtitle: client ? `客户：${client}` : '根据客户日期与目的地生成',
    lines,
  }
}
