/** 全平台模块入口（与产品框架 V1–V6 一一对应） */

export type PlatformModule = {
  id: string
  phase: string
  title: string
  desc: string
  path: string
  emoji: string
}

export const PLATFORM_MODULES: PlatformModule[] = [
  {
    id: 'spin',
    phase: 'V1',
    title: '全球盲盒抽签',
    desc: '国家/城市池 · 短视频录屏友好',
    path: '/travel/spin',
    emoji: '🎡',
  },
  {
    id: 'knowledge',
    phase: 'V1',
    title: '目的地知识库',
    desc: '中国护照视角 · 签证/避坑/美食',
    path: '/travel/region',
    emoji: '📚',
  },
  {
    id: 'plan',
    phase: 'V1',
    title: 'AI 行程规划',
    desc: '多国串联 · 免费预览 · Word 付费',
    path: '/travel/custom',
    emoji: '🗺️',
  },
  {
    id: 'assessment',
    phase: 'V1',
    title: '适配测评 ¥5.99',
    desc: '分数 · 风险 · 是否适合',
    path: '/travel/assessment',
    emoji: '📊',
  },
  {
    id: 'pricing',
    phase: 'V1',
    title: '付费与会员',
    desc: '5.99 / 19.99 / 年卡',
    path: '/travel/pricing',
    emoji: '💳',
  },
  {
    id: 'ugc',
    phase: 'V2',
    title: '攻略创作交易',
    desc: '上传 · 水印 · 打赏5% / 售卖10%',
    path: '/travel/ugc',
    emoji: '✍️',
  },
  {
    id: 'community',
    phase: 'V2',
    title: '24h 旅行状态',
    desc: '微信式状态 · 同期出行 · 广场',
    path: '/travel/community',
    emoji: '💬',
  },
  {
    id: 'channels',
    phase: 'V2.5',
    title: '全球频道',
    desc: '洲/国 · 签证 · 组队 · 创作',
    path: '/travel/channels',
    emoji: '📢',
  },
  {
    id: 'live',
    phase: 'V3',
    title: '直播 & 连麦定制',
    desc: '免费科普 · 付费一对一规划',
    path: '/travel/live',
    emoji: '🎙️',
  },
  {
    id: 'contests',
    phase: 'V3.5',
    title: '季度大赛',
    desc: '四季赛事 · 排名 · 上架商城',
    path: '/travel/contests',
    emoji: '🏆',
  },
  {
    id: 'eco',
    phase: 'V4',
    title: '助农 & 非遗文创',
    desc: '助农税后5% · 主题季',
    path: '/travel/eco',
    emoji: '🌾',
  },
  {
    id: 'guides',
    phase: 'V5',
    title: '持证地陪撮合',
    desc: '核验执照 · 托管 · 不做旅行社',
    path: '/travel/guides',
    emoji: '🧑‍✈️',
  },
  {
    id: 'ip',
    phase: 'V6',
    title: 'IP 宇宙 · 环环',
    desc: '形象 · 皮肤 · 周边 · 联名',
    path: '/travel/ip',
    emoji: '🐼',
  },
  {
    id: 'roadmap',
    phase: '—',
    title: '开发框架说明',
    desc: 'V1–V6 与平台规则',
    path: '/travel/roadmap',
    emoji: '📋',
  },
]
