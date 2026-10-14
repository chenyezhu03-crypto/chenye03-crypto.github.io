/**
 * 国内样本 JD：按 BOSS/智联详情页风格写细，方便条件透视演示。
 * 字段刻意包含：学历必须/优先、985/211、专业必须/优先、经验区间、性别标注、必备/加分技能。
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
    sourceId: 'boss',
    sourceName: 'BOSS样本',
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
      '负责核心产品前端架构与体验落地，推动组件库与工程化，与设计/产品打磨关键路径。',
    requirementText: `
【任职要求】
1. 学历：本科及以上；计算机、软件工程相关专业优先（专业不强制卡死）。
2. 经验：3-5 年前端开发经验，至少 2 年 React 实战。
3. 必备技能：精通 TypeScript、React；熟悉前端工程化、性能优化、设计系统。
4. 加分项：有中后台复杂表单/可视化经验；英文文档阅读能力（CET-6 优先）。
5. 其他：男女不限；可接受偶尔加班；工作地点上海静安，可申请混合办公。
【岗位职责】负责组件库建设、核心链路交付、Code Review 与技术分享。
    `.trim(),
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
      '围绕获客与留存设计增长策略，拆解漏斗，把数据洞察变成可落地实验。',
    requirementText: `
任职资格：
- 本科及以上，专业不限；市场营销、经济学、计算机优先。
- 2 年以上 B 端或增长产品经验。
- 必备：需求分析、数据分析（SQL 加分）、跨团队协作与沟通。
- 加分：有从 0 到 1 增长项目；英语可作为工作语言。
- 性别不限；双休；海淀现场办公。
    `.trim(),
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
    description: '参与交易与消息链路后端建设，保障高可用与可观测性。',
    requirementText: `
岗位要求：
1. 本科及以上学历，计算机、软件工程、电子信息相关专业（必须）。
2. 3 年以上 Java 开发，熟悉 Spring Cloud / 微服务 / MySQL / Redis / Kafka。
3. 有高并发或金融相关业务经验优先。
4. 因岗位需频繁出差机房与客户现场，限男生。
5. 英语能读技术文档；责任心强，抗压。
    `.trim(),
  },
  {
    sourceId: 'liepin',
    sourceName: '猎聘样本',
    externalId: 'sg-ui-004',
    title: 'UI/UX 设计师',
    company: '拾光工作室',
    city: '深圳',
    district: '南山',
    type: '全职',
    salary: '18-28K · 13薪',
    tags: ['Figma', '移动端', '品牌视觉'],
    postedAt: '2026-10-09',
    description: '负责移动端与官网体验，从调研到高保真全流程。',
    requirementText: `
要求：
- 大专及以上；设计、视觉传达、数字媒体相关专业必须。
- 2 年以上 UI/UX 经验；精通 Figma，理解交互与信息架构。
- 加分：品牌视觉、动效、用户研究。
- 女生优先（团队氛围，原文标注）；可接受弹性远程。
    `.trim(),
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
    description: '参与推荐/搜索模型训练与上线，跟进指标复盘。',
    requirementText: `
校招要求（2026/2027 届）：
1. 学历：硕士及以上；计算机、人工智能、数学、统计学相关专业必须。
2. 硬门槛：985/211/双一流院校优先，部分组卡双一流。
3. 必备技能：机器学习、深度学习、Python、PyTorch；有论文或竞赛加分。
4. 英语：能读顶会论文；CET-6 或同等水平。
5. 男女不限；北京朝阳现场 + 可申请混合办公。
    `.trim(),
  },
  {
    sourceId: 'zhilian',
    sourceName: '智联样本',
    externalId: 'hc-da-005',
    title: '数据分析师',
    company: '海潮零售',
    city: '广州',
    district: '天河',
    type: '全职',
    salary: '15-25K · 13薪',
    tags: ['SQL', 'Python', '业务洞察'],
    postedAt: '2026-10-08',
    description: '支持电商与会员指标监控与专题分析。',
    requirementText: `
任职要求：
- 硕士优先，本科及以上可投；统计学、数学、计算机、经济学相关专业。
- 1-3 年数据分析经验；熟练 SQL / Python。
- 有零售或互联网业务理解优先。
- 性别不限；沟通表达清晰。
    `.trim(),
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
    description: '参与求职内容选题与社群维护。',
    requirementText: `
实习要求：
- 在校生，专科及以上；新闻、中文、传播、市场营销相关专业优先。
- 每周可实习 3 天以上；有新媒体或社群运营经历加分。
- 性别不限；可远程。
    `.trim(),
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
    description: '负责社招/校招渠道、简历筛选与面试安排。',
    requirementText: `
岗位要求：
1. 本科学历，人力资源、行政管理、心理学相关专业必须。
2. 1 年以上招聘经验优先；形象气质佳，限女生（原文）。
3. 必备：沟通协调、抗压、责任心；能接受阶段性加班。
    `.trim(),
  },
  {
    sourceId: 'liepin',
    sourceName: '猎聘样本',
    externalId: 'mx-qa-008',
    title: '测试开发工程师',
    company: '明芯软件',
    city: '南京',
    district: '雨花台',
    type: '全职',
    salary: '18-30K · 14薪',
    tags: ['自动化测试', 'Python', 'CI'],
    postedAt: '2026-10-05',
    description: '搭建自动化测试框架，覆盖接口与关键路径。',
    requirementText: `
要求：
- 本科及以上，计算机、软件工程、电子信息相关专业。
- 2-4 年测试开发经验；熟悉 Python、接口测试、CI。
- Docker / Kubernetes 加分；男女不限。
    `.trim(),
  },
  {
    sourceId: 'boss',
    sourceName: 'BOSS样本',
    externalId: 'lh-sales-009',
    title: '医药代表',
    company: '蓝河医药',
    city: '武汉',
    district: '武昌',
    type: '全职',
    salary: '10-18K · 底薪+提成',
    tags: ['销售', '医药', '客户拜访'],
    postedAt: '2026-10-04',
    description: '医院与药店渠道开拓，完成销售目标。',
    requirementText: `
任职资格：
- 大专及以上；药学、医学、生物相关专业优先。
- 有医药销售经验优先；能接受频繁出差。
- 限男生；普通话标准，沟通能力强。
    `.trim(),
  },
  {
    sourceId: 'official',
    sourceName: '企业官网',
    externalId: 'dw-ml-011',
    title: '机器学习平台工程师',
    company: '东望智算',
    city: '北京',
    district: '海淀',
    type: '全职',
    salary: '40-70K · 16薪',
    tags: ['LLM', 'Kubernetes', 'Python'],
    postedAt: '2026-10-13',
    description: '打造训练/推理平台，支撑大模型研发效能。',
    requirementText: `
【硬性条件】
- 硕士及以上；计算机 / 人工智能 / 软件工程；985/211/双一流必须。
- 3 年以上相关经验；熟悉 Python、Kubernetes、分布式训练。
- 有 LLM 训练/推理平台经验优先；英文可作为协作语言。
- 男女不限。
    `.trim(),
  },
  {
    sourceId: 'zhilian',
    sourceName: '智联样本',
    externalId: 'sz-java-012',
    title: 'Java 开发（应届）',
    company: '深海支付',
    city: '深圳',
    district: '南山',
    type: '校招',
    salary: '15-22K · 14薪',
    tags: ['Java', 'Spring', 'MySQL'],
    postedAt: '2026-10-02',
    description: '支付核心链路后端研发，面向 2026 届。',
    requirementText: `
校招 JD：
1. 本科及以上，计算机相关专业必须；双一流优先。
2. 熟悉 Java / Spring / MySQL；有实习或项目经验。
3. 英语四级及以上；男女不限；可接受轮岗培训。
    `.trim(),
  },
]
