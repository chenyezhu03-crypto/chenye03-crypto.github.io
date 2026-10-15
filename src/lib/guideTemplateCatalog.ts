/** 与 Word 模版《新加坡5晚6天_完整版》对应的可售模块与套餐定价（演示价，可按门店调整） */

export type TemplateModuleId =
  | 'overview'
  | 'pretrip_01'
  | 'pretrip_02'
  | 'pretrip_03'
  | 'pretrip_apps'
  | 'daily_detail'
  | 'budget_final'
  | 'official_menu'

export type GuidePackageId = 'partial' | 'standard' | 'full' | 'custom'

/**
 * 付费上限：聊天模型（豆包等）生成游记近乎免费，
 * 这里只对「已整理好的完整 Word 模版实稿导出」象征性收费。
 */
export const MAX_GUIDE_PRICE_CNY = 9.9

export type TemplateModuleDef = {
  id: TemplateModuleId
  label: string
  desc: string
  priceCny: number
  /** 对应 Word 模版章节说明 */
  templateRef: string
}

/** 单模块参考价（自定义组合时累加，且不超过 {@link MAX_GUIDE_PRICE_CNY}） */
export const TEMPLATE_MODULES: TemplateModuleDef[] = [
  {
    id: 'overview',
    label: '行程总览',
    desc: '封面、六天路线摘要、活动怎么排、预算说明（对应模版前几章）',
    priceCny: 0,
    templateRef: '01 图文导游 · 六天路线一眼看懂',
  },
  {
    id: 'pretrip_01',
    label: '出发前 · 证件入境',
    desc: 'SGAC/MyICA、证件包、入境流程（模版 出发前 01）',
    priceCny: 0,
    templateRef: '02 证件与入境申报',
  },
  {
    id: 'pretrip_02',
    label: '出发前 · 天气行李',
    desc: '预报、穿搭、行李与药品（模版 出发前 02）',
    priceCny: 0,
    templateRef: '03 天气与行李',
  },
  {
    id: 'pretrip_03',
    label: '出发前 · 交通支付',
    desc: '地铁、Grab、现金与汇率（模版 出发前 03）',
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
    desc: 'DAY1–6 分时段、餐饮二选一、拍照点（模版主体，非 AI 现写）',
    priceCny: 9.9,
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
]

export const GUIDE_PACKAGES: {
  id: GuidePackageId
  label: string
  desc: string
  moduleIds: TemplateModuleId[] | 'all'
  priceCny: number
  badge?: string
}[] = [
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
    label: '完整图文版',
    desc: '含逐日详程整本模版实稿（新加坡同款 Word 内容）',
    moduleIds: 'all',
    priceCny: MAX_GUIDE_PRICE_CNY,
    badge: '实稿',
  },
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
    return TEMPLATE_MODULES.map((m) => m.id)
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
