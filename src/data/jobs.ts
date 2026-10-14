export type Job = {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  tags: string[]
  postedAt: string
  description: string
  requirements: string[]
}

export const jobs: Job[] = [
  {
    id: 'fe-senior-01',
    title: '高级前端工程师',
    company: '云枢科技',
    location: '上海 · 静安',
    type: '全职',
    salary: '30-45K · 15薪',
    tags: ['React', 'TypeScript', '设计系统'],
    postedAt: '2026-10-12',
    description:
      '负责核心产品的前端架构与体验落地，推动组件库与工程化体系建设，与设计、产品紧密协作打磨关键路径。',
    requirements: [
      '3 年以上 React 经验，熟悉 TypeScript 与现代工程链路',
      '有设计系统或中后台产品经验优先',
      '关注可访问性与性能，能独立推动跨团队协作',
    ],
  },
  {
    id: 'pm-product-02',
    title: '产品经理（增长方向）',
    company: '北境数据',
    location: '北京 · 海淀',
    type: '全职',
    salary: '25-40K · 14薪',
    tags: ['B2B', '增长', '数据分析'],
    postedAt: '2026-10-11',
    description:
      '围绕获客与留存设计产品策略，拆解漏斗指标，快速验证假设，把数据洞察转化为可落地的产品方案。',
    requirements: [
      '2 年以上 B 端或增长产品经验',
      '能独立完成需求调研、方案撰写与上线复盘',
      '熟练使用数据分析工具，逻辑清晰、表达有力',
    ],
  },
  {
    id: 'be-java-03',
    title: '后端开发工程师',
    company: '澄空网络',
    location: '杭州 · 余杭',
    type: '全职',
    salary: '28-42K · 16薪',
    tags: ['Java', '微服务', '高并发'],
    postedAt: '2026-10-10',
    description:
      '参与交易与消息链路的后端服务建设，保障高可用与可观测性，持续优化接口性能与稳定性。',
    requirements: [
      '扎实的 Java 基础，熟悉 Spring Cloud / 微服务架构',
      '了解常见中间件与数据库优化手段',
      '有高并发或金融相关业务经验加分',
    ],
  },
  {
    id: 'design-ui-04',
    title: 'UI/UX 设计师',
    company: '拾光工作室',
    location: '深圳 · 南山',
    type: '全职',
    salary: '18-28K · 13薪',
    tags: ['Figma', '移动端', '品牌视觉'],
    postedAt: '2026-10-09',
    description:
      '负责移动端与官网体验设计，从调研到高保真交付全流程参与，建立统一、克制的视觉语言。',
    requirements: [
      '精通 Figma，具备完整作品集',
      '理解交互逻辑与信息架构，而非仅做视觉美化',
      '有品牌或内容型产品设计经验优先',
    ],
  },
  {
    id: 'data-analyst-05',
    title: '数据分析师',
    company: '海潮零售',
    location: '广州 · 天河',
    type: '全职',
    salary: '15-25K · 13薪',
    tags: ['SQL', 'Python', '业务洞察'],
    postedAt: '2026-10-08',
    description:
      '支持电商与会员业务的指标监控与专题分析，输出可执行建议，协助业务方做决策。',
    requirements: [
      '熟练 SQL / Python，能独立完成数据清洗与建模',
      '具备零售或互联网业务理解',
      '善于把复杂分析讲清楚，推动落地',
    ],
  },
  {
    id: 'ops-intern-06',
    title: '内容运营实习生',
    company: '投简传媒',
    location: '远程 / 上海',
    type: '实习',
    salary: '200-280/天',
    tags: ['内容', '社群', '新媒体'],
    postedAt: '2026-10-07',
    description:
      '参与求职内容选题与社群维护，协助活动策划与用户反馈整理，适合对职业内容感兴趣的同学。',
    requirements: [
      '在校生，每周可实习 3 天以上',
      '文字表达清晰，对职场话题有兴趣',
      '有新媒体或社群运营经历优先',
    ],
  },
]

export function getJobById(id: string): Job | undefined {
  return jobs.find((job) => job.id === id)
}
