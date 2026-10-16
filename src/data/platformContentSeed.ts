import { PLATFORM_FEES, V1_PRICING } from '../platform/manifest'

export const LIVE_FREE_SESSIONS = [
  {
    id: 'live-1',
    title: '春季东南亚怎么选岛',
    host: '文旅讲师·老K',
    startsAt: '本周五 20:00',
    free: true,
  },
  {
    id: 'live-2',
    title: '申根签证材料避坑直播',
    host: '达人·签证姐',
    startsAt: '下周二 19:30',
    free: true,
  },
]

export const LIVE_PAID_HOSTS = [
  {
    id: 'host-1',
    name: '环球规划·Linda',
    rateCny: 99,
    unit: '30分钟',
    tags: ['多国串联', '亲子'],
  },
  {
    id: 'host-2',
    name: '欧洲深度·老周',
    rateCny: 159,
    unit: '45分钟',
    tags: ['签证答疑', '路线修改'],
  },
]

export const QUARTERLY_CONTESTS = [
  {
    quarter: 'Q1',
    title: '全球小众盲盒路线赛',
    status: 'open' as const,
    deadline: '3月31日',
  },
  {
    quarter: 'Q2',
    title: '极限预算规划赛',
    status: 'upcoming' as const,
    deadline: '6月30日',
  },
  {
    quarter: 'Q3',
    title: '多国长线串联大师赛',
    status: 'upcoming' as const,
    deadline: '9月30日',
  },
  {
    quarter: 'Q4',
    title: '世界文旅生活方式策划赛',
    status: 'upcoming' as const,
    deadline: '12月31日',
  },
]

export const ECO_PRODUCTS = [
  {
    id: 'farm-1',
    type: 'agriculture' as const,
    name: '云南小粒咖啡（农户直发）',
    priceCny: 68,
    farmerShare: 0.95,
    platformRate: PLATFORM_FEES.agricultureAfterTaxRate,
  },
  {
    id: 'craft-1',
    type: 'heritage' as const,
    name: '非遗扎染旅行披肩',
    priceCny: 128,
    platformRateMin: PLATFORM_FEES.heritageCraftMinRate,
    platformRateMax: PLATFORM_FEES.heritageCraftMaxRate,
  },
]

export const THEME_SEASONS = [
  { id: 'ethnic-56', title: '56 民族主题季', desc: '民族路线 · 非遗 · 助农联动' },
  { id: 'world-civ', title: '世界文明平行季', desc: '各国本土文化 · 古文明 · 手作' },
]

export const LICENSED_GUIDES = [
  {
    id: 'guide-1',
    name: '东京持证中文导览·佐藤组',
    city: '东京',
    licenseNo: '***已核验（演示）',
    priceFromCny: 800,
    verified: true,
  },
  {
    id: 'guide-2',
    name: '巴黎官方导游·Chen',
    city: '巴黎',
    licenseNo: '***已核验（演示）',
    priceFromCny: 1200,
    verified: true,
  },
]

export const IP_UNIVERSE = {
  hero: '环环',
  tagline: '环球旅行小环，你的文旅向导 IP',
  family: ['环环', '游游', '文文', '创创'],
  assets: ['皮肤', '徽章', '头像框', '表情包', '文创周边', '主题餐厅联名'],
}

export const MEMBERSHIP_BLURB = {
  month: V1_PRICING.membershipMonthCny,
  year: V1_PRICING.membershipYearCny,
  perks: ['免费测评次数', 'Word 导出折扣', '批量抽签', '专属徽章', '无广告（规划）'],
}
