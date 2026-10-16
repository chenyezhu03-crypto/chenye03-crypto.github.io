/**
 * 全球中文旅行文旅 · 平台常量（写死在代码，AI/产品勿随意改语义）
 * @see docs/DEVELOPMENT_FRAMEWORK.zh-CN.md
 */

export const PLATFORM = {
  name: '全球中文旅行文旅',
  productType: 'mini_program_web_prototype',
  locale: 'zh-CN',
  /** 只服务中国大陆用户：无海外版、无多语言 */
  audience: 'mainland_china_only' as const,
  perspective: 'china_passport_outbound' as const,
} as const

/** V1 核心单次付费（最小盈利闭环） */
export const V1_PRICING = {
  assessmentReportCny: 5.99,
  wordExportCny: 19.99,
  membershipMonthCny: 19.9,
  membershipYearCny: 99,
} as const

/** 未来版本抽成（V2+ 实现时引用） */
export const PLATFORM_FEES = {
  ugcTipRate: 0.05,
  ugcPaidGuideRate: 0.1,
  agricultureAfterTaxRate: 0.05,
  heritageCraftMinRate: 0.1,
  heritageCraftMaxRate: 0.15,
} as const

/** 平台绝对规则 */
export const ABSOLUTE_RULES = [
  '只服务中国大陆用户，无海外版、无多语言',
  '所有内容均为中国人出境/境内旅行视角',
  '所有 UGC 自动加水印防盗版（上线后强制）',
  '助农永久税后 5% 服务费，不涨价',
  'AI 与平台内容仅作规划参考，不承担出行风险',
  '地陪须核验当地官方导游证（V5）',
  '社区禁止无资质旅游接单',
  '先预览、后付费，降低退款率',
] as const

export const REFUND_POLICY = {
  freeRegenerateAfterPay: 1,
  manualRefundWindowHours: 24,
  manualRefundRequires: '明确诉求不符 + 截图',
  noRefundReasons: ['主观不喜欢', '审美问题', '不会使用产品'],
} as const

export type PhaseStatus = 'prototype' | 'in_progress' | 'planned'

export const RELEASE_PHASES: {
  id: string
  title: string
  goal: string
  status: PhaseStatus
}[] = [
  {
    id: 'V1',
    title: '工具 + 付费',
    goal: '盲盒引流、知识库、AI 行程、5.99/19.99、会员',
    status: 'prototype',
  },
  {
    id: 'V2',
    title: 'UGC + 24h 状态',
    goal: '攻略上传、水印、打赏/售卖、轻量状态',
    status: 'prototype',
  },
  {
    id: 'V2.5',
    title: '频道社群',
    goal: '洲/国频道、组队、签证区',
    status: 'prototype',
  },
  { id: 'V3', title: '直播连麦', goal: '科普直播、付费定制连麦', status: 'prototype' },
  { id: 'V3.5', title: '季度赛事', goal: '四季大赛、排名、商城', status: 'prototype' },
  {
    id: 'V4',
    title: '文创助农主题季',
    goal: '非遗、56 民族、世界文明季',
    status: 'prototype',
  },
  { id: 'V5', title: '持证地陪撮合', goal: '托管、核验、不做旅行社', status: 'prototype' },
  { id: 'V6', title: 'IP 宇宙', goal: '环环 IP、周边、线下联名', status: 'prototype' },
]

export const HOME_ADVANTAGES = [
  '全球多国串联 AI 行程规划（中文、中国护照视角）',
  '盲盒抽签短视频引流体系',
  'UGC 攻略可变现社区',
  '季度赛事创作平台',
  '56 民族 + 世界文明双主题季',
  '助农低费率公益 + 非遗文创生态',
  '自研 IP「环环」长期品牌',
] as const

export const STANDARD_DISCLAIMER =
  '本平台内容仅供旅行规划参考，非签证机关、使领馆或交通运输官方结论。出行前请以权威渠道为准，风险自担。'

export const STANDARD_DISCLAIMER_SHORT = '旅行参考，非官方决策依据。'
