/** 与 Word 模版《新加坡5晚6天_完整版》对应的可售模块与套餐定价 */

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

/** 单次付费 · 标准完整版（含逐日详程 Word 实稿） */
export const GUIDE_PRICE_BASIC_CNY = 9.9

/** 单次付费 · 进阶版（双版本行程 + 预算拆解 + 行李 + 避坑） */
export const GUIDE_PRICE_PREMIUM_CNY = 19.9

/** 年会员 · 无限基础生成等（演示价，支付接入后生效） */
export const MEMBERSHIP_YEAR_CNY = 99

/** 自定义组合累加上限 */
export const MAX_GUIDE_PRICE_CNY = GUIDE_PRICE_PREMIUM_CNY

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
    id: 'full',
    label: '完整版 · 单次',
    desc: '含逐日详程整本模版实稿 + 标准 Word 导出',
    moduleIds: 'all',
    priceCny: GUIDE_PRICE_BASIC_CNY,
    badge: `¥${GUIDE_PRICE_BASIC_CNY}`,
  },
  {
    id: 'premium',
    label: '进阶版 · 单次',
    desc: '完整版 + 预算拆解 + 行李清单 + 避坑 + 行程 B 版',
    moduleIds: 'all_premium',
    priceCny: GUIDE_PRICE_PREMIUM_CNY,
    badge: `¥${GUIDE_PRICE_PREMIUM_CNY}`,
  },
]

export const PRICING_SKUS = [
  {
    id: 'free',
    title: '免费体验',
    priceLabel: '¥0',
    highlights: ['四级转盘抽签', '简略行程预览', '标准出发前章节 Word（不含逐日实稿）'],
  },
  {
    id: 'basic',
    title: '标准单次',
    priceLabel: `¥${GUIDE_PRICE_BASIC_CNY}`,
    highlights: ['完整逐日详程', '新加坡同款 Word 结构', '可打印 PDF'],
  },
  {
    id: 'premium',
    title: '进阶单次',
    priceLabel: `¥${GUIDE_PRICE_PREMIUM_CNY}`,
    highlights: ['标准单次全部内容', '预算拆解 + 行李清单', '避坑 + 双版本行程 B'],
  },
  {
    id: 'member',
    title: '年会员',
    priceLabel: `¥${MEMBERSHIP_YEAR_CNY}/年`,
    highlights: ['无限基础生成', '高级筛选与批量抽签', '美化排版（即将上线）'],
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
  if (!pkg) return ['overview', 'budget_final']
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
  const pkg = GUIDE_PACKAGES.find((p) => p.id === packageId)!
  return {
    packageId,
    moduleIds,
    priceCny: Math.min(pkg.priceCny, MAX_GUIDE_PRICE_CNY),
  }
}
