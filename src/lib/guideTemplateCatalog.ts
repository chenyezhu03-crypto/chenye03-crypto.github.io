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

export type TemplateModuleDef = {
  id: TemplateModuleId
  label: string
  desc: string
  priceCny: number
  /** 对应 Word 模版章节说明 */
  templateRef: string
}

export const TEMPLATE_MODULES: TemplateModuleDef[] = [
  {
    id: 'overview',
    label: '行程总览',
    desc: '封面、六天路线摘要、活动怎么排、预算说明（对应模版前几章）',
    priceCny: 198,
    templateRef: '01 图文导游 · 六天路线一眼看懂',
  },
  {
    id: 'pretrip_01',
    label: '出发前 · 证件入境',
    desc: 'SGAC/MyICA、证件包、入境流程（模版 出发前 01）',
    priceCny: 128,
    templateRef: '02 证件与入境申报',
  },
  {
    id: 'pretrip_02',
    label: '出发前 · 天气行李',
    desc: '预报、穿搭、行李与药品（模版 出发前 02）',
    priceCny: 128,
    templateRef: '03 天气与行李',
  },
  {
    id: 'pretrip_03',
    label: '出发前 · 交通支付',
    desc: '地铁、Grab、现金与汇率（模版 出发前 03）',
    priceCny: 128,
    templateRef: '04 地铁支付与打车',
  },
  {
    id: 'pretrip_apps',
    label: '出发前 · App 登录',
    desc: '5 段 App 下载登录说明（模版 05–09）',
    priceCny: 168,
    templateRef: '05–09 App下载登录',
  },
  {
    id: 'daily_detail',
    label: '逐日图文详程',
    desc: 'DAY1–6 分时段、餐饮二选一、拍照点（模版主体最大部分）',
    priceCny: 598,
    templateRef: '10–61 每日行程与二选一',
  },
  {
    id: 'budget_final',
    label: '出发前检查 · 预算',
    desc: '现金、门票比价、最后检查清单（模版 61）',
    priceCny: 98,
    templateRef: '61 注意事项与预算',
  },
  {
    id: 'official_menu',
    label: '官方来源菜单',
    desc: '官网/售票/菜单核实入口索引（模版 62）',
    priceCny: 68,
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
    desc: '只要总览 + 检查清单，适合已有大致想法、需快速成稿',
    moduleIds: ['overview', 'budget_final'],
    priceCny: 268,
    badge: '入门',
  },
  {
    id: 'standard',
    label: '标准攻略',
    desc: '总览 + 出发前 01–03 + App + 预算检查（不含逐日详程）',
    moduleIds: [
      'overview',
      'pretrip_01',
      'pretrip_02',
      'pretrip_03',
      'pretrip_apps',
      'budget_final',
    ],
    priceCny: 688,
    badge: '热销',
  },
  {
    id: 'full',
    label: '完整图文版',
    desc: 'Word 模版全部章节（含逐日详程与官方来源）',
    moduleIds: 'all',
    priceCny: 1288,
    badge: '同款模版',
  },
]

export function moduleById(id: TemplateModuleId): TemplateModuleDef {
  const m = TEMPLATE_MODULES.find((x) => x.id === id)
  if (!m) throw new Error(`unknown module ${id}`)
  return m
}

export function priceForModules(ids: TemplateModuleId[]): number {
  return ids.reduce((sum, id) => sum + moduleById(id).priceCny, 0)
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
    return { packageId, moduleIds, priceCny: priceForModules(moduleIds) }
  }
  const pkg = GUIDE_PACKAGES.find((p) => p.id === packageId)!
  return { packageId, moduleIds, priceCny: pkg.priceCny }
}
