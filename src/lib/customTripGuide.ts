import {
  formatGuidePrice,
  GUIDE_PACKAGES,
  GUIDE_PRICE_ASSESSMENT_CNY,
  GUIDE_PRICE_WORD_CNY,
  freePreviewModuleIds,
  moduleById,
  quotePrice,
  type TemplateModuleId,
} from './guideTemplateCatalog'
import { buildWordModeDailyDetail } from './guideWordMode'
import {
  mergeTemplateModules,
  personalizeOverviewLines,
  splitSingaporeTemplate,
} from './guideTemplateSplit'
import { loadGuideDocument } from './travelGuideCatalog'
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
    const lines: string[] = ['六天路线一眼看懂', 'Routes with practical details']
    for (let i = 1; i <= days; i++) {
      const iso = addDays(brief.startDate, i - 1)
      const place = brief.customPlaces[(i - 1) % brief.customPlaces.length]
      lines.push(`DAY ${i}  ${formatCnDate(iso)} ${place} · 请补充交通与预约。`)
    }
    return lines
  }

  const lines: string[] = ['六天路线一眼看懂', 'Routes with practical details']
  if (days === 1) {
    lines.push(
      `DAY 1  ${formatCnDate(brief.startDate)} 抵达与离开同日：${stops.map((s) => s.name).join(' · ')}`,
    )
    return lines
  }

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
    `DAY 1  ${formatCnDate(brief.startDate)} 抵达 → 入住 → 市区轻量熟悉。`,
  )
  let dayIdx = 2
  stops.forEach((dest, si) => {
    for (let k = 0; k < alloc[si]; k++) {
      const hi = dest.highlights[k % dest.highlights.length]
      lines.push(
        `DAY ${dayIdx}  ${formatCnDate(addDays(brief.startDate, dayIdx - 1))} ${dest.name} · ${hi}`,
      )
      dayIdx++
    }
  })
  while (dayIdx < days) {
    lines.push(
      `DAY ${dayIdx}  ${formatCnDate(addDays(brief.startDate, dayIdx - 1))} 机动/缓冲日`,
    )
    dayIdx++
  }
  lines.push(
    `DAY ${days}  ${formatCnDate(brief.endDate)} 退房 → 前往机场/车站 → 返程。`,
  )
  return lines
}

function quoteHeaderLines(brief: CustomTripBrief): string[] {
  const q = quotePrice(brief.packageId, brief.customModules)
  const pkgLabel =
    GUIDE_PACKAGES.find((p) => p.id === brief.packageId)?.label ?? '自定义组合'
  const moduleLabels = q.moduleIds.map((id) => moduleById(id).label).join('、')
  return [
    '【服务报价单 · 演示定价】',
    `套餐  ${pkgLabel}`,
    `含模块  ${moduleLabels}`,
    `参考价  ${q.priceCny <= 0 ? '免费' : `¥${q.priceCny.toFixed(2)} / 份`}（不含机票酒店；测评 ${formatGuidePrice(GUIDE_PRICE_ASSESSMENT_CNY)} · Word ${formatGuidePrice(GUIDE_PRICE_WORD_CNY)}）`,
    `和免费 AI 的差别  豆包等是对话现写；本站导出的是固定 Word 模版结构 + 已整理新加坡实稿切片，方便直接交付客户。`,
    `模版说明  正文结构对齐《新加坡5晚6天_完整版》；未选模块不会写入导出文件。`,
  ]
}

function genericModuleBlocks(
  moduleIds: TemplateModuleId[],
  brief: CustomTripBrief,
  stops: Destination[],
  days: number,
): Record<TemplateModuleId, string[]> {
  const empty = (): Record<TemplateModuleId, string[]> => ({
    overview: [],
    pretrip_01: [],
    pretrip_02: [],
    pretrip_03: [],
    pretrip_apps: [],
    daily_detail: [],
    budget_final: [],
    official_menu: [],
    budget_breakdown: [],
    luggage_checklist: [],
    pitfalls: [],
    alt_itinerary: [],
  })
  const map = empty()
  const pick = new Set(moduleIds)

  if (pick.has('overview')) {
    const names =
      stops.map((s) => s.name).join('+') ||
      brief.customPlaces.join('+') ||
      '定制行程'
    const { nights } = tripNightsAndDays(brief.startDate, brief.endDate)
    map.overview.push(
      `${names.toUpperCase()} · ${formatDateRange(brief.startDate, brief.endDate)}`,
      `${names}${nights}晚${days}天个性化图文导游`,
      ...buildDayPlan(brief, stops, days),
      '活动怎么放才不赶',
      '主推荐  首日轻量、中间核心景点、末日前移值机。',
    )
    if (brief.notes.trim()) {
      map.overview.push('客户需求摘要', brief.notes.trim())
    }
    map.overview.push(...budgetGuideText(brief.budget))
  }

  const hasAbroad = stops.some((s) => s.scope === 'abroad')
  if (pick.has('pretrip_01')) {
    map.pretrip_01.push(
      '出发前 01',
      '证件与入境申报',
      hasAbroad
        ? '证件  护照与签证/入境卡政策以官方为准；订单与酒店英文地址离线保存。'
        : '证件  国内行程携带身份证件；跨境段另备港澳/台湾等证件。',
    )
  }
  if (pick.has('pretrip_02')) {
    map.pretrip_02.push(
      '出发前 02',
      '天气与行李',
      '查逐日预报；分层穿衣，备雨具与舒适鞋。',
    )
  }
  if (pick.has('pretrip_03')) {
    map.pretrip_03.push(
      '出发前 03',
      '交通与支付',
      hasAbroad
        ? 'App  地图、打车、地铁；漫游或 eSIM；少量当地现金。'
        : 'App  地图导航与官方购票渠道；移动支付+现金。',
    )
  }
  if (pick.has('pretrip_apps')) {
    map.pretrip_apps.push(
      '出发前 APP 1',
      '请按目的地安装地图、支付、预约类 App，并完成登录与支付方式绑定。',
    )
  }
  if (pick.has('daily_detail')) {
    const wordDays = buildWordModeDailyDetail(
      brief.startDate,
      brief.endDate,
      days,
      stops.map((d) => ({
        name: d.name,
        highlights: d.highlights,
        tips: d.tips,
      })),
    )
    if (wordDays.length) {
      map.daily_detail.push(...wordDays)
    }
    brief.customPlaces.forEach((name) => {
      map.daily_detail.push(
        `DAY · ${name}`,
        name,
        '客户指定地点：请按 Word 模版补全时间/怎么去/费用等字段。',
        `时间  待填`,
        `怎么去  待填`,
        '官方/核实来源',
        'Google地图·照片·菜单',
      )
    })
    if (map.daily_detail.length === 0) {
      map.daily_detail.push(
        '逐日详程说明  请选目的地或购买完整新加坡实稿模版。',
      )
    }
  }
  if (pick.has('budget_final')) {
    map.budget_final.push(
      '出发前最后检查 注意事项与预算',
      '出发前检查  证件/订单/保险 · 预报 · 预约截图 · 付款方式。',
    )
  }
  if (pick.has('official_menu')) {
    map.official_menu.push(
      '官方来源菜单',
      '请粘贴航司、酒店、景区官网与地图链接（导出后可在 Word 中编辑）。',
    )
  }
  if (pick.has('budget_breakdown')) {
    const names = stops.map((s) => s.name).join('、') || brief.customPlaces.join('、') || '本趟'
    map.budget_breakdown.push(
      '预算拆解表',
      `目的地  ${names}`,
      '大项  国际/国内机票 · 住宿 · 当地交通 · 餐饮 · 门票/体验 · 购物 · 应急备用',
      '说明  下表为人均区间，热门季上浮 10–20%；付款前核对票种与汇率。',
      ...budgetGuideText(brief.budget),
      '分项参考  住宿 35% · 交通 20% · 餐饮 25% · 门票 20% · 备用 5%（可按客户预算档位微调）',
    )
  }
  if (pick.has('luggage_checklist')) {
    map.luggage_checklist.push(
      '行李清单（可打印勾选）',
      '证件  身份证/护照 · 签证/入境码 · 订单与酒店英文地址离线保存',
      '电子  手机 · 充电器 · 转接头 · 移动电源 · 离线地图',
      '衣物  分层穿搭 · 舒适鞋 · 雨具/防晒 · 泳装（如需要）',
      '药品  常用药 · 创可贴 · 晕车/肠胃药 · 个人处方',
      '其他  少量现金 · 防水袋 · 折叠伞 · 洗衣袋',
    )
  }
  if (pick.has('pitfalls')) {
    const tips = stops.flatMap((s) => s.tips).slice(0, 6)
    map.pitfalls.push(
      '避坑指南',
      '预约  热门项目提前 7–14 天抢票；取消政策以订单为准。',
      '支付  优先官方渠道；警惕「低价代订」与私下转账。',
      '交通  核对上下车点与末班车时间；打车核对车牌与平台订单。',
      ...(tips.length ? ['目的地提示', ...tips] : []),
      '维权  保留订单截图与聊天记录；争议先联系平台/12315 咨询。',
    )
  }
  if (pick.has('alt_itinerary')) {
    map.alt_itinerary.push(
      '备选行程 B 版（节奏更松）',
      '说明  与主行程二选一：减少跨区移动，增加缓冲与自由活动时间。',
      ...buildDayPlan(brief, stops, days).map((l) =>
        l.startsWith('DAY ') ? `${l} · B版：可改为半日轻松游或周边散步` : l,
      ),
    )
  }
  return map
}

function injectCustomerDaysIntoOverview(
  overview: string[],
  dayLines: string[],
): string[] {
  const start = overview.findIndex((l) => l === '六天路线一眼看懂')
  if (start < 0) return [...overview, ...dayLines]
  let end = start + 1
  while (end < overview.length) {
    const l = overview[end]
    if (l.startsWith('Routes with') || (l.startsWith('DAY ') && !l.includes(' · '))) {
      end++
      continue
    }
    break
  }
  return [...overview.slice(0, start), ...dayLines, ...overview.slice(end)]
}

export type BuildCustomGuideOptions = {
  /** 未付费时仅合并免费预览模块 */
  previewOnly?: boolean
}

export async function buildCustomTripGuide(
  brief: CustomTripBrief,
  options: BuildCustomGuideOptions = {},
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
  const subtitle = client
    ? `${client} · 出发 ${formatCnDate(brief.startDate)}，返程 ${formatCnDate(brief.endDate)}`
    : `出发 ${formatCnDate(brief.startDate)}，返程 ${formatCnDate(brief.endDate)} · 出发前以机票/酒店订单复核`

  let moduleIds = quotePrice(brief.packageId, brief.customModules).moduleIds
  if (options.previewOnly) {
    const free = new Set(freePreviewModuleIds())
    moduleIds = moduleIds.filter((id) => free.has(id))
    if (moduleIds.length === 0) moduleIds = freePreviewModuleIds()
  }
  const dayLines = buildDayPlan(brief, stops, days)

  const onlySg =
    stops.length === 1 &&
    stops[0].id === 'singapore' &&
    (await loadGuideDocument('singapore-5n6d'))

  let bodyLines: string[]

  if (onlySg) {
    const parts = splitSingaporeTemplate(onlySg.lines)
    if (moduleIds.includes('overview')) {
      parts.overview = injectCustomerDaysIntoOverview(
        personalizeOverviewLines(
          parts.overview.length ? parts.overview : onlySg.lines.slice(0, 32),
          title,
          `SINGAPORE · ${range}`,
          subtitle,
        ),
        dayLines,
      )
      if (brief.notes.trim()) {
        parts.overview.push('客户需求摘要', brief.notes.trim())
      }
    }
    const premiumSet = new Set<TemplateModuleId>([
      'budget_breakdown',
      'luggage_checklist',
      'pitfalls',
      'alt_itinerary',
    ])
    const premiumIds = moduleIds.filter((id) => premiumSet.has(id))
    const coreIds = moduleIds.filter((id) => !premiumSet.has(id))
    bodyLines = mergeTemplateModules(parts, coreIds)
    if (premiumIds.length) {
      const extra = genericModuleBlocks(premiumIds, brief, stops, days)
      const extraLines = mergeTemplateModules(extra, premiumIds)
      if (extraLines.length) {
        bodyLines.push('---', ...extraLines)
      }
    }
  } else {
    const generic = genericModuleBlocks(moduleIds, brief, stops, days)
    bodyLines = mergeTemplateModules(generic, moduleIds)
    if (moduleIds.includes('daily_detail') && !stops.some((s) => s.id === 'singapore')) {
      bodyLines.unshift(
        '模版提示  逐日图文详程的完整 Word 样稿目前以新加坡 5 晚 6 天为基准；本目的地以下为标准化简版段落。',
      )
    }
  }

  const lines = [...quoteHeaderLines(brief), ...bodyLines]

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

export function defaultCustomBrief(): CustomTripBrief {
  const start = new Date().toISOString().slice(0, 10)
  const endD = new Date(`${start}T12:00:00`)
  endD.setDate(endD.getDate() + 5)
  return {
    startDate: start,
    endDate: endD.toISOString().slice(0, 10),
    destinationIds: ['singapore'],
    customPlaces: [],
    budget: 'mid',
    notes: '',
    clientLabel: '',
    packageId: 'standard',
    customModules: [],
  }
}
