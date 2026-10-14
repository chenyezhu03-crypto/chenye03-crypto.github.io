import type { RawFeedItem } from './rawFeeds'

/** 扩充国内细 JD 样本（按城市/职能铺开，供条件透视演示） */
const CITIES = [
  ['上海', '浦东'],
  ['北京', '海淀'],
  ['深圳', '南山'],
  ['杭州', '西湖'],
  ['广州', '天河'],
  ['成都', '高新区'],
  ['南京', '鼓楼'],
  ['武汉', '洪山'],
  ['苏州', '工业园区'],
  ['西安', '雁塔'],
]

const ROLES: Array<{
  title: string
  tags: string[]
  edu: string
  major: string
  years: string
  skills: string
  extra?: string
}> = [
  {
    title: '前端开发工程师',
    tags: ['Vue', 'TypeScript'],
    edu: '本科及以上',
    major: '计算机、软件工程相关专业优先',
    years: '1-3 年',
    skills: '必备 Vue/TypeScript；加分 React、设计系统',
  },
  {
    title: 'Java 后端工程师',
    tags: ['Java', 'Spring'],
    edu: '本科及以上',
    major: '计算机、软件工程、电子信息相关专业必须',
    years: '3 年以上',
    skills: '必备 Java、Spring Cloud、MySQL、Redis',
  },
  {
    title: '数据分析师',
    tags: ['SQL', 'Python'],
    edu: '本科及以上，硕士优先',
    major: '统计学、数学、经济学、计算机相关专业',
    years: '1-3 年',
    skills: '必备 SQL、Python；加分 Tableau',
  },
  {
    title: '产品经理',
    tags: ['B端', '需求分析'],
    edu: '本科及以上',
    major: '专业不限，计算机/经管优先',
    years: '2 年以上',
    skills: '必备需求分析、沟通协作；加分 SQL',
  },
  {
    title: '测试开发工程师',
    tags: ['Python', '自动化测试'],
    edu: '本科及以上',
    major: '计算机、软件工程相关专业',
    years: '2-4 年',
    skills: '必备 Python、接口测试、CI',
  },
  {
    title: '运维开发工程师',
    tags: ['Linux', 'Kubernetes'],
    edu: '本科及以上',
    major: '计算机相关专业必须',
    years: '3 年以上',
    skills: '必备 Linux、Docker、Kubernetes；加分 Go',
  },
  {
    title: 'UI 设计师',
    tags: ['Figma', '移动端'],
    edu: '大专及以上',
    major: '设计、视觉传达、数字媒体相关专业必须',
    years: '2 年以上',
    skills: '必备 Figma；加分动效、用户研究',
    extra: '女生优先（原文标注）；男女亦可沟通。',
  },
  {
    title: '人力资源专员',
    tags: ['招聘', '校招'],
    edu: '本科',
    major: '人力资源、行政管理、心理学相关专业必须',
    years: '1 年以上优先',
    skills: '必备沟通协调、抗压',
    extra: '限女生（原文）。',
  },
  {
    title: '算法工程师',
    tags: ['机器学习', 'PyTorch'],
    edu: '硕士及以上',
    major: '计算机、人工智能、数学、统计学相关专业必须',
    years: '应届或 1-3 年',
    skills: '必备 Python、机器学习、深度学习；加分 PyTorch',
    extra: '985/211/双一流硬门槛。',
  },
  {
    title: '销售代表',
    tags: ['销售', '客户拜访'],
    edu: '大专及以上',
    major: '专业不限，营销相关优先',
    years: '有相关经验即可',
    skills: '必备沟通、抗压',
    extra: '限男生；能接受出差。',
  },
]

const COMPANIES = [
  '星澜科技',
  '青禾数据',
  '云桥网络',
  '北辰智能',
  '南屿软件',
  '西岭信息',
  '东湖智造',
  '枫桥互联',
  '望京数科',
  '钱塘云',
]

export const EXTRA_CN_FEEDS: RawFeedItem[] = CITIES.flatMap(([city, district], ci) =>
  ROLES.map((role, ri) => {
    const company = COMPANIES[(ci + ri) % COMPANIES.length]
    const id = `cn-${ci}-${ri}`
    return {
      sourceId: 'cn-board',
      sourceName: '国内细JD样本',
      externalId: id,
      title: role.title,
      company,
      city,
      district,
      type: /应届|校招/.test(role.years) ? '校招' : '全职',
      salary:
        role.title.includes('算法')
          ? '25-45K · 16薪'
          : role.title.includes('销售')
            ? '8-15K · 底薪+提成'
            : '15-35K · 14薪',
      tags: role.tags,
      postedAt: `2026-10-${String(14 - ((ci + ri) % 12)).padStart(2, '0')}`,
      description: `${company}招聘${role.title}，工作地${city}·${district}。`,
      requirementText: `
【任职要求】
1. 学历：${role.edu}。
2. 专业：${role.major}。
3. 经验：${role.years}。
4. 技能：${role.skills}。
5. 其他：${role.extra || '男女不限；英语能阅读文档优先。'}
【岗位职责】参与业务交付、复盘与协作，保持稳定输出。
      `.trim(),
      applyUrl: `https://example.com/jobs/${id}`,
    } satisfies RawFeedItem
  }),
)
