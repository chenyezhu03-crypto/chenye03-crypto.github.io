/**
 * 多源岗位原始语料（演示用）。
 * 真实环境可替换为：官网 RSS / 开放数据集 / 合规 API。
 * 刻意保留学历、专业、性别、经验等原文表述，供条件解析器抽取。
 */
export type RawFeedItem = {
  sourceId: string
  sourceName: string
  externalId: string
  title: string
  company: string
  city: string
  district?: string
  type: string
  salary: string
  tags: string[]
  postedAt: string
  description: string
  requirementText: string
  applyUrl?: string
}

export const RAW_FEEDS: RawFeedItem[] = [
  {
    sourceId: 'official',
    sourceName: '企业官网',
    externalId: 'ys-fe-001',
    title: '高级前端工程师',
    company: '云枢科技',
    city: '上海',
    district: '静安',
    type: '全职',
    salary: '30-45K · 15薪',
    tags: ['React', 'TypeScript', '设计系统'],
    postedAt: '2026-10-12',
    description:
      '负责核心产品的前端架构与体验落地，推动组件库与工程化体系建设，与设计、产品紧密协作打磨关键路径。',
    requirementText:
      '岗位要求：本科及以上学历，计算机、软件工程相关专业优先；3 年以上 React 经验，熟悉 TypeScript；男女不限；有设计系统或中后台产品经验优先。',
    applyUrl: 'https://example.com/jobs/ys-fe-001',
  },
  {
    sourceId: 'zhilian',
    sourceName: '智联样本',
    externalId: 'bj-pm-002',
    title: '产品经理（增长方向）',
    company: '北境数据',
    city: '北京',
    district: '海淀',
    type: '全职',
    salary: '25-40K · 14薪',
    tags: ['B2B', '增长', '数据分析'],
    postedAt: '2026-10-11',
    description:
      '围绕获客与留存设计产品策略，拆解漏斗指标，快速验证假设，把数据洞察转化为可落地的产品方案。',
    requirementText:
      '要求：本科及以上，专业不限；2 年以上 B 端或增长产品经验；能独立完成需求调研与复盘；性别不限。',
  },
  {
    sourceId: 'boss',
    sourceName: 'BOSS样本',
    externalId: 'ck-be-003',
    title: '后端开发工程师',
    company: '澄空网络',
    city: '杭州',
    district: '余杭',
    type: '全职',
    salary: '28-42K · 16薪',
    tags: ['Java', '微服务', '高并发'],
    postedAt: '2026-10-10',
    description:
      '参与交易与消息链路的后端服务建设，保障高可用与可观测性，持续优化接口性能与稳定性。',
    requirementText:
      '本科及以上学历，计算机相关专业；扎实的 Java 基础，熟悉 Spring Cloud；了解高并发与数据库优化；限男生（出差较多）。',
  },
  {
    sourceId: 'official',
    sourceName: '企业官网',
    externalId: 'sg-ui-004',
    title: 'UI/UX 设计师',
    company: '拾光工作室',
    city: '深圳',
    district: '南山',
    type: '全职',
    salary: '18-28K · 13薪',
    tags: ['Figma', '移动端', '品牌视觉'],
    postedAt: '2026-10-09',
    description:
      '负责移动端与官网体验设计，从调研到高保真交付全流程参与，建立统一、克制的视觉语言。',
    requirementText:
      '大专及以上，设计、视觉传达、数字媒体相关专业；精通 Figma；理解交互与信息架构；女生优先（团队氛围）。',
  },
  {
    sourceId: 'liepin',
    sourceName: '猎聘样本',
    externalId: 'hc-da-005',
    title: '数据分析师',
    company: '海潮零售',
    city: '广州',
    district: '天河',
    type: '全职',
    salary: '15-25K · 13薪',
    tags: ['SQL', 'Python', '业务洞察'],
    postedAt: '2026-10-08',
    description:
      '支持电商与会员业务的指标监控与专题分析，输出可执行建议，协助业务方做决策。',
    requirementText:
      '硕士优先，统计学、数学、计算机、经济学相关专业；熟练 SQL / Python；有零售或互联网业务理解；男女不限。',
  },
  {
    sourceId: 'campus',
    sourceName: '校招汇总',
    externalId: 'tj-ops-006',
    title: '内容运营实习生',
    company: '投简传媒',
    city: '上海',
    district: '远程可选',
    type: '实习',
    salary: '200-280/天',
    tags: ['内容', '社群', '新媒体'],
    postedAt: '2026-10-07',
    description:
      '参与求职内容选题与社群维护，协助活动策划与用户反馈整理，适合对职业内容感兴趣的同学。',
    requirementText:
      '在校生，专科及以上，新闻、中文、传播、市场营销相关专业优先；每周可实习 3 天以上；性别不限。',
  },
  {
    sourceId: 'boss',
    sourceName: 'BOSS样本',
    externalId: 'qx-hr-007',
    title: '招聘专员',
    company: '青溪人力',
    city: '成都',
    district: '高新区',
    type: '全职',
    salary: '8-12K · 13薪',
    tags: ['招聘', '校招', '沟通'],
    postedAt: '2026-10-06',
    description:
      '负责社招/校招渠道维护、简历筛选与面试安排，协助搭建人才库与雇主品牌内容。',
    requirementText:
      '本科，人力资源、行政管理、心理学相关专业；1 年以上招聘经验优先；形象气质佳，限女生；能接受加班。',
  },
  {
    sourceId: 'zhilian',
    sourceName: '智联样本',
    externalId: 'mx-qa-008',
    title: '测试开发工程师',
    company: '明芯软件',
    city: '南京',
    district: '雨花台',
    type: '全职',
    salary: '18-30K · 14薪',
    tags: ['自动化测试', 'Python', 'CI'],
    postedAt: '2026-10-05',
    description:
      '搭建自动化测试框架，覆盖接口与关键路径，提升发布质量与回归效率。',
    requirementText:
      '本科及以上，计算机、软件工程、电子信息相关专业；熟悉 Python / 接口测试；2 年以上测试经验；男女不限。',
  },
  {
    sourceId: 'official',
    sourceName: '企业官网',
    externalId: 'lh-sales-009',
    title: '医药代表',
    company: '蓝河医药',
    city: '武汉',
    district: '武昌',
    type: '全职',
    salary: '10-18K · 底薪+提成',
    tags: ['销售', '医药', '客户拜访'],
    postedAt: '2026-10-04',
    description:
      '负责医院与药店渠道开拓，传递产品信息，完成销售目标并维护长期客户关系。',
    requirementText:
      '大专及以上，药学、医学、生物相关专业优先；能接受频繁出差；限男生；有医药销售经验优先。',
  },
  {
    sourceId: 'campus',
    sourceName: '校招汇总',
    externalId: 'yh-algo-010',
    title: '算法工程师（校招）',
    company: '远航智能',
    city: '北京',
    district: '朝阳',
    type: '校招',
    salary: '25-35K · 16薪',
    tags: ['机器学习', '深度学习', 'Python'],
    postedAt: '2026-10-03',
    description:
      '参与推荐/搜索相关模型训练与上线，跟进指标复盘，与工程同学协作落地。',
    requirementText:
      '硕士及以上，计算机、人工智能、数学相关专业；扎实的机器学习基础；有论文或竞赛经历优先；2026/2027 届；男女不限。',
  },
]
