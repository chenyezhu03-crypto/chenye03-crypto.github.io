/** 与 Word 模版《新加坡5晚6天_完整版》对应的可售模块与套餐定价 */
import { V1_PRICING } from '../platform/manifest'

export type TemplateModuleId =
  | 'overview'
  | 'pretrip_01'
  | 'pretrip_02'
  | 'pretrip_03'
  | 'pretrip_apps'
  | 'daily_detail'
  | 'budget_final'
  | 'official_menu'
  | 'budget_breakdown'
  | 'luggage_checklist'
  | 'pitfalls'
  | 'alt_itinerary'

export type GuidePackageId =
  | 'preview'
  | 'partial'
  | 'standard'
  | 'full'
  | 'premium'
  | 'custom'

/** V1 · 目的地适配测评（独立产品，见 /travel/assessment） */
export const GUIDE_PRICE_ASSESSMENT_CNY = V1_PRICING.assessmentReportCny

/** V1 · 完整结构化 Word 攻略（含逐日、预算、行李、避坑等） */
export const GUIDE_PRICE_WORD_CNY = V1_PRICING.wordExportCny

/** @deprecated 使用 GUIDE_PRICE_WORD_CNY */
export const GUIDE_PRICE_PREMIUM_CNY = GUIDE_PRICE_WORD_CNY

/** @deprecated 使用 GUIDE_PRICE_WORD_CNY */
export const GUIDE_PRICE_BASIC_CNY = GUIDE_PRICE_WORD_CNY

export const MEMBERSHIP_YEAR_CNY = V1_PRICING.membershipYearCny
export const MEMBERSHIP_MONTH_CNY = V1_PRICING.membershipMonthCny

/** 自定义组合累加上限 */
export const MAX_GUIDE_PRICE_CNY = GUIDE_PRICE_WORD_CNY

export type TemplateModuleDef = {
  id: TemplateModuleId
  label: string
  desc: string
  priceCny: number
  templateRef: string
}

/** 单模块参考价（自定义组合时累加，且不超过 {@link MAX_GUIDE_PRICE_CNY}） */
export const TEMPLATE_MODULES: TemplateModuleDef[] = [
  {
    id: 'overview',
    label: '行程总览',
    desc: '封面、路线摘要、活动怎么排（对应模版前几章）',
    priceCny: 0,
    templateRef: '01 图文导游 · 路线一眼看懂',
  },
  {
    id: 'pretrip_01',
    label: '出发前 · 证件入境',
    desc: '证件包、入境流程（模版 出发前 01）',
    priceCny: 0,
    templateRef: '02 证件与入境申报',
  },
  {
    id: 'pretrip_02',
    label: '出发前 · 天气行李',
    desc: '预报、穿搭、基础行李（模版 出发前 02）',
    priceCny: 0,
    templateRef: '03 天气与行李',
  },
  {
    id: 'pretrip_03',
    label: '出发前 · 交通支付',
    desc: '地铁、打车、现金与汇率（模版 出发前 03）',
    priceCny: 0,
    templateRef: '04 地铁支付与打车',
  },
  {
    id: 'pretrip_apps',
    label: '出发前 · App 登录',
    desc: '5 段 App 下载登录说明（模版 05–09）',
    priceCny: 0,
    templateRef: '05–09 App下载登录',
  },
  {
    id: 'daily_detail',
    label: '逐日图文详程',
    desc: '分时段、餐饮二选一、拍照点（模版主体实稿）',
    priceCny: GUIDE_PRICE_BASIC_CNY,
    templateRef: '10–61 每日行程与二选一',
  },
  {
    id: 'budget_final',
    label: '出发前检查 · 预算',
    desc: '现金、门票比价、最后检查清单（模版 61）',
    priceCny: 0,
    templateRef: '61 注意事项与预算',
  },
  {
    id: 'official_menu',
    label: '官方来源菜单',
    desc: '官网/售票/菜单核实入口索引（模版 62）',
    priceCny: 0,
    templateRef: '62 官方来源菜单',
  },
  {
    id: 'budget_breakdown',
    label: '预算拆解表',
    desc: '机酒/餐饮/交通/门票分项与区间（进阶版专属）',
    priceCny: 5,
    templateRef: '附录 · 预算拆解',
  },
  {
    id: 'luggage_checklist',
    label: '行李清单',
    desc: '按天数与季节的可勾选清单（进阶版专属）',
    priceCny: 3,
    templateRef: '附录 · 行李清单',
  },
  {
    id: 'pitfalls',
    label: '避坑指南',
    desc: '常见踩雷、预约、支付与维权要点（进阶版专属）',
    priceCny: 3,
    templateRef: '附录 · 避坑',
  },
  {
    id: 'alt_itinerary',
    label: '备选行程 B 版',
    desc: '节奏更松/更省的第二套日程（进阶版 · 双版本）',
    priceCny: 4,
    templateRef: '附录 · 行程 B 版',
  },
]

export const GUIDE_PACKAGES: {
  id: GuidePackageId
  label: string
  desc: string
  moduleIds: TemplateModuleId[] | 'all' | 'all_premium'
  priceCny: number
  badge?: string
}[] = [
  {
    id: 'preview',
    label: '免费预览',
    desc: '仅行程总览与路线摘要 · 适合转盘后先看一眼',
    moduleIds: ['overview'],
    priceCny: 0,
    badge: '免费',
  },
  {
    id: 'partial',
    label: '部分攻略',
    desc: '总览 + 检查清单 · 免费（结构固定，可直接改 Word）',
    moduleIds: ['overview', 'budget_final'],
    priceCny: 0,
    badge: '免费',
  },
  {
    id: 'standard',
    label: '标准攻略',
    desc: '出发前证件/天气/交通/App · 免费（适合先给客户一版）',
    moduleIds: [
      'overview',
      'pretrip_01',
      'pretrip_02',
      'pretrip_03',
      'pretrip_apps',
      'budget_final',
    ],
    priceCny: 0,
    badge: '免费',
  },
  {
    id: 'premium',
    label: '完整 Word 攻略',
    desc: '每日行程、交通、预算表、美食景点、避坑、行李清单（V1 ¥19.99）',
    moduleIds: 'all_premium',
    priceCny: GUIDE_PRICE_WORD_CNY,
    badge: `¥${GUIDE_PRICE_WORD_CNY}`,
  },
]

export const PRICING_SKUS = [
  {
    id: 'free',
    title: '免费体验',
    priceLabel: '¥0',
    highlights: ['全球盲盒抽签', '行程大纲网页预览（不可下载完整稿）', '出发前免费章节'],
  },
  {
    id: 'assessment',
    title: '适配测评',
    priceLabel: `¥${GUIDE_PRICE_ASSESSMENT_CNY}`,
    highlights: ['适配分数', '是否适合', '风险与出行建议', '中国护照视角'],
  },
  {
    id: 'word',
    title: 'Word 攻略',
    priceLabel: `¥${GUIDE_PRICE_WORD_CNY}`,
    highlights: ['逐日行程', '交通预算美食景点', '避坑 + 行李清单', '结构化 Word 导出'],
  },
  {
    id: 'member',
    title: '会员',
    priceLabel: `¥${MEMBERSHIP_YEAR_CNY}/年`,
    highlights: ['免费测评/导出权益（接入后）', '次数加成', '专属徽章（规划中）'],
  },
] as const

const CORE_MODULE_IDS: TemplateModuleId[] = [
  'overview',
  'pretrip_01',
  'pretrip_02',
  'pretrip_03',
  'pretrip_apps',
  'daily_detail',
  'budget_final',
  'official_menu',
]

const PREMIUM_EXTRA: TemplateModuleId[] = [
  'budget_breakdown',
  'luggage_checklist',
  'pitfalls',
  'alt_itinerary',
]

export function moduleById(id: TemplateModuleId): TemplateModuleDef {
  const m = TEMPLATE_MODULES.find((x) => x.id === id)
  if (!m) throw new Error(`unknown module ${id}`)
  return m
}

export function priceForModules(ids: TemplateModuleId[]): number {
  const sum = ids.reduce((acc, id) => acc + moduleById(id).priceCny, 0)
  return Math.min(roundPrice(sum), MAX_GUIDE_PRICE_CNY)
}

function roundPrice(n: number): number {
  return Math.round(n * 10) / 10
}

export function formatGuidePrice(priceCny: number): string {
  if (priceCny <= 0) return '免费'
  return `¥${priceCny.toFixed(1)}`
}

export function isPaidGuidePrice(priceCny: number): boolean {
  return priceCny > 0
}

/** 未付费时预览页只展示这些模块 */
export function freePreviewModuleIds(): TemplateModuleId[] {
  return ['overview', 'budget_final']
}

export function resolveModuleIds(
  packageId: GuidePackageId,
  customModules: TemplateModuleId[],
): TemplateModuleId[] {
  if (packageId === 'custom') {
    return [...new Set(customModules)]
  }
  const pkg = GUIDE_PACKAGES.find((p) => p.id === packageId)
  if (!pkg) {
    if (packageId === 'full') {
      return [...CORE_MODULE_IDS, ...PREMIUM_EXTRA]
    }
    return ['overview', 'budget_final']
  }
  if (pkg.moduleIds === 'all') {
    return [...CORE_MODULE_IDS]
  }
  if (pkg.moduleIds === 'all_premium') {
    return [...CORE_MODULE_IDS, ...PREMIUM_EXTRA]
  }
  return pkg.moduleIds
}

export function quotePrice(
  packageId: GuidePackageId,
  customModules: TemplateModuleId[],
): { packageId: GuidePackageId; moduleIds: TemplateModuleId[]; priceCny: number } {
  const moduleIds = resolveModuleIds(packageId, customModules)
  if (packageId === 'custom') {
    return {
      packageId,
      moduleIds,
      priceCny: priceForModules(moduleIds),
    }
  }
  if (packageId === 'full') {
    return {
      packageId,
      moduleIds,
      priceCny: GUIDE_PRICE_WORD_CNY,
    }
  }
  const pkg = GUIDE_PACKAGES.find((p) => p.id === packageId)!
  return {
    packageId,
    moduleIds,
    priceCny: Math.min(pkg.priceCny, MAX_GUIDE_PRICE_CNY),
  }
}
