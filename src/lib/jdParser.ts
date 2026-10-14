/**
 * JD 条件透视解析器
 * 参考开源实践：
 * - boss-crawler-skill：以详情 JD 为准抽学历/经验/技能，985/211 作硬门槛
 * - agent-hunt / jobstruct：区分 required vs preferred，中英双语字段
 * 本实现为规则引擎（零 token），可后续替换/叠加 LLM 解析层。
 */
import type {
  EducationLevel,
  GenderPref,
  StructuredRequirements,
  WorkMode,
} from './types'

const EDU_RANK: EducationLevel[] = ['大专', '本科', '硕士', '博士']

const MAJOR_DICT: Array<{ name: string; patterns: RegExp[] }> = [
  { name: '计算机', patterns: [/计算机/, /computer\s*science/i, /\bCS\b/] },
  { name: '软件工程', patterns: [/软件工程/, /software\s*engineering/i] },
  { name: '电子信息', patterns: [/电子信息/, /electrical|electronics/i] },
  { name: '人工智能', patterns: [/人工智能/, /artificial\s*intelligence|\bAI\b/i] },
  { name: '数学', patterns: [/数学/, /\bmath(ematics)?\b/i] },
  { name: '统计学', patterns: [/统计学|统计/, /\bstatistics\b/i] },
  { name: '经济学', patterns: [/经济学|金融学/, /\beconomics\b|\bfinance\b/i] },
  { name: '设计', patterns: [/设计学|艺术设计/, /\bdesign\b/i] },
  { name: '视觉传达', patterns: [/视觉传达/] },
  { name: '数字媒体', patterns: [/数字媒体/] },
  { name: '新闻', patterns: [/新闻学|新闻传播/] },
  { name: '中文', patterns: [/汉语言|中国语言文学|中文/] },
  { name: '传播', patterns: [/传播学|传媒/] },
  { name: '市场营销', patterns: [/市场营销|市场学/, /\bmarketing\b/i] },
  { name: '人力资源', patterns: [/人力资源/, /\bHR\b|\bhuman\s*resources?\b/i] },
  { name: '行政管理', patterns: [/行政管理|公共管理/] },
  { name: '心理学', patterns: [/心理学/, /\bpsychology\b/i] },
  { name: '药学', patterns: [/药学/, /\bpharmacy\b/i] },
  { name: '医学', patterns: [/临床医学|医学/, /\bmedicine\b|\bmedical\b/i] },
  { name: '生物', patterns: [/生物工程|生物科学|生物学/, /\bbiolog/i] },
]

const SKILL_DICT = [
  'React',
  'Vue',
  'Angular',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Java',
  'Spring',
  'Python',
  'Go',
  'Golang',
  'C++',
  'Rust',
  'SQL',
  'MySQL',
  'PostgreSQL',
  'Redis',
  'Kafka',
  'Docker',
  'Kubernetes',
  'AWS',
  'Figma',
  'Sketch',
  'LLM',
  'PyTorch',
  'TensorFlow',
  '机器学习',
  '深度学习',
  '数据分析',
  '爬虫',
  '微服务',
  '设计系统',
]

const SOFT_DICT = [
  '沟通',
  '协作',
  '抗压',
  '责任心',
  '学习能力',
  '团队合作',
  'ownership',
  'communication',
  'leadership',
]

export function educationRank(level: EducationLevel | null): number {
  if (!level) return -1
  return EDU_RANK.indexOf(level)
}

function pickEducation(text: string): {
  educationMin: EducationLevel | null
  educationPrefer: EducationLevel | null
  eliteSchoolRequired: boolean
  signals: string[]
} {
  const signals: string[] = []
  let educationMin: EducationLevel | null = null
  let educationPrefer: EducationLevel | null = null

  const eliteSchoolRequired = /985|211|双一流|QS\s*前|名校|top\s*\d+\s*universit/i.test(
    text,
  )
  if (eliteSchoolRequired) signals.push('名校/批次硬门槛')

  // English first
  if (/\bph\.?d\b|\bdoctorate\b/i.test(text)) {
    educationMin = '博士'
    signals.push('PhD/Doctorate')
  } else if (/\bmaster'?s?\b|\bgraduate\s+degree\b/i.test(text)) {
    if (/prefer.*master|master.*prefer|硕士优先/i.test(text)) {
      educationPrefer = '硕士'
      signals.push('Master preferred')
    } else {
      educationMin = '硕士'
      signals.push('Master required')
    }
  } else if (/\bbachelor'?s?\b|\bundergraduate\b|\bbs\/ms\b|\bbs\b/i.test(text)) {
    educationMin = '本科'
    signals.push("Bachelor's")
  }

  // Chinese overrides / fills
  if (/博士及以上|博士学历|博士学位/.test(text)) {
    educationMin = '博士'
    signals.push('博士及以上')
  } else if (/硕士及以上|研究生及以上|硕士学历|硕士学位/.test(text)) {
    educationMin = '硕士'
    signals.push('硕士及以上')
  } else if (/本科及以上|本科学历|学士学位/.test(text)) {
    educationMin = educationMin ?? '本科'
    signals.push('本科及以上')
  } else if (/大专及以上|专科及以上|大专学历/.test(text)) {
    educationMin = educationMin ?? '大专'
    signals.push('大专及以上')
  } else if (/学历不限|不限学历/.test(text)) {
    signals.push('学历不限')
  } else if (/本科/.test(text) && !educationMin) {
    educationMin = '本科'
  }

  if (/硕士优先|研究生优先|prefer.*master/i.test(text)) {
    educationPrefer = '硕士'
    signals.push('硕士优先')
  }
  if (/博士优先|prefer.*ph\.?d/i.test(text)) {
    educationPrefer = '博士'
    signals.push('博士优先')
  }

  // 名校岗至少按本科硬门槛处理（对齐 boss-crawler-skill）
  if (eliteSchoolRequired && !educationMin) educationMin = '本科'

  return { educationMin, educationPrefer, eliteSchoolRequired, signals }
}

function pickGender(text: string): { genderPref: GenderPref; signals: string[] } {
  if (/男女不限|性别不限|gender\s*neutral/i.test(text)) {
    return { genderPref: '不限', signals: ['性别不限'] }
  }
  if (/限男生|仅限男|只要男|男士优先|限男|male\s*only/i.test(text)) {
    return { genderPref: '男', signals: ['原文限男'] }
  }
  if (/限女生|仅限女|只要女|女生优先|限女|female\s*only/i.test(text)) {
    return { genderPref: '女', signals: ['原文限女'] }
  }
  return { genderPref: '不限', signals: [] }
}

function pickYears(text: string): {
  yearsMin: number | null
  yearsMax: number | null
  yearsFuzzy: boolean
  signals: string[]
} {
  const signals: string[] = []
  const range = text.match(/(\d+)\s*[-~到至]\s*(\d+)\s*年/)
  if (range) {
    signals.push(`经验 ${range[1]}-${range[2]} 年`)
    return {
      yearsMin: Number(range[1]),
      yearsMax: Number(range[2]),
      yearsFuzzy: false,
      signals,
    }
  }
  const minPlus = text.match(
    /(\d+)\s*\+?\s*years?(?:\s+of)?(?:\s+experience)?|(\d+)\s*年以上/i,
  )
  if (minPlus) {
    const n = Number(minPlus[1] || minPlus[2])
    signals.push(`经验 ${n}+ 年`)
    return { yearsMin: n, yearsMax: null, yearsFuzzy: false, signals }
  }
  if (/有相关经验|多年经验|经验不限|experience\s*preferred/i.test(text)) {
    signals.push('经验表述偏模糊')
    return { yearsMin: null, yearsMax: null, yearsFuzzy: true, signals }
  }
  if (/应届|在校生|校招|new\s*grad|entry[- ]level|0-1\s*年/i.test(text)) {
    signals.push('应届/初级')
    return { yearsMin: 0, yearsMax: 1, yearsFuzzy: false, signals }
  }
  return { yearsMin: null, yearsMax: null, yearsFuzzy: false, signals: [] }
}

function pickMajors(text: string): {
  majorsRequired: string[]
  majorsPreferred: string[]
  majorFlexible: boolean
  signals: string[]
} {
  const signals: string[] = []
  if (/专业不限|不限专业|any\s*major/i.test(text)) {
    signals.push('专业不限')
    return {
      majorsRequired: [],
      majorsPreferred: [],
      majorFlexible: true,
      signals,
    }
  }

  const hit = MAJOR_DICT.filter((m) => m.patterns.some((p) => p.test(text))).map(
    (m) => m.name,
  )
  const preferredOnly =
    /相关专业优先|专业优先|preferred\s*major|plus\s*if/i.test(text) &&
    !/必须.*专业|专业要求|required\s*major|degree\s*in/i.test(text)

  if (!hit.length) {
    return {
      majorsRequired: [],
      majorsPreferred: [],
      majorFlexible: true,
      signals,
    }
  }

  if (preferredOnly) {
    signals.push(`专业优先：${hit.join('/')}`)
    return {
      majorsRequired: [],
      majorsPreferred: hit,
      majorFlexible: true,
      signals,
    }
  }

  signals.push(`专业要求：${hit.join('/')}`)
  return {
    majorsRequired: hit,
    majorsPreferred: [],
    majorFlexible: /相关专业/.test(text),
    signals,
  }
}

function pickSkills(text: string): {
  skillsRequired: string[]
  skillsPreferred: string[]
  softSkills: string[]
} {
  const lower = text.toLowerCase()
  const skillsRequired: string[] = []
  const skillsPreferred: string[] = []
  for (const skill of SKILL_DICT) {
    const re = new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    if (!re.test(text) && !lower.includes(skill.toLowerCase())) continue
    const around = text.slice(
      Math.max(0, text.toLowerCase().indexOf(skill.toLowerCase()) - 12),
      text.toLowerCase().indexOf(skill.toLowerCase()) + skill.length + 12,
    )
    if (/优先|prefer|nice\s*to\s*have|加分/i.test(around)) skillsPreferred.push(skill)
    else skillsRequired.push(skill)
  }
  const softSkills = SOFT_DICT.filter((s) =>
    new RegExp(s, 'i').test(text),
  ).slice(0, 6)
  return {
    skillsRequired: [...new Set(skillsRequired)].slice(0, 8),
    skillsPreferred: [...new Set(skillsPreferred)].slice(0, 6),
    softSkills,
  }
}

function pickLanguages(text: string): string[] {
  const out: string[] = []
  if (/英语|english|cet-?4|cet-?6|toefl|ielts/i.test(text)) out.push('英语')
  if (/日语|japanese|n1|n2/i.test(text)) out.push('日语')
  if (/普通话|mandarin/i.test(text)) out.push('普通话')
  return out
}

function pickWorkMode(text: string): WorkMode {
  if (/远程|remote|work\s*from\s*home|wfh/i.test(text)) {
    if (/现场|onsite|hybrid|混合/i.test(text)) return '混合'
    return '远程'
  }
  if (/混合|hybrid/i.test(text)) return '混合'
  if (/现场办公|onsite|驻场/i.test(text)) return '现场'
  return '不限'
}

export function parseRequirementText(text: string): StructuredRequirements {
  const edu = pickEducation(text)
  const gender = pickGender(text)
  const years = pickYears(text)
  const majors = pickMajors(text)
  const skills = pickSkills(text)
  const languages = pickLanguages(text)
  const workMode = pickWorkMode(text)
  const studentOnly = /在校生|校招|应届|new\s*grad|intern/i.test(text)

  const highlights: string[] = []
  if (edu.eliteSchoolRequired) highlights.push('硬门槛：985/211/双一流等名校')
  if (edu.educationMin) highlights.push(`学历必须：${edu.educationMin}及以上`)
  if (edu.educationPrefer) highlights.push(`学历优先：${edu.educationPrefer}`)
  if (majors.majorsRequired.length)
    highlights.push(`专业必须：${majors.majorsRequired.join(' / ')}`)
  if (majors.majorsPreferred.length)
    highlights.push(`专业优先：${majors.majorsPreferred.join(' / ')}`)
  if (majors.majorFlexible && !majors.majorsRequired.length)
    highlights.push('专业较灵活 / 不限')
  if (gender.genderPref !== '不限')
    highlights.push(`原文性别标注：${gender.genderPref}`)
  if (years.yearsMin != null && years.yearsMin > 0) {
    highlights.push(
      years.yearsMax
        ? `经验：${years.yearsMin}-${years.yearsMax} 年`
        : `经验：${years.yearsMin}+ 年`,
    )
  } else if (years.yearsFuzzy) highlights.push('经验：有相关经验即可')
  if (studentOnly) highlights.push('面向在校 / 应届 / 实习')
  if (skills.skillsRequired.length)
    highlights.push(`必备技能：${skills.skillsRequired.slice(0, 4).join(' / ')}`)
  if (skills.skillsPreferred.length)
    highlights.push(`加分技能：${skills.skillsPreferred.slice(0, 3).join(' / ')}`)
  if (languages.length) highlights.push(`语言：${languages.join(' / ')}`)
  if (workMode !== '不限') highlights.push(`办公：${workMode}`)

  const rawSignals = [
    ...edu.signals,
    ...gender.signals,
    ...years.signals,
    ...majors.signals,
  ]

  return {
    educationMin: edu.educationMin,
    educationPrefer: edu.educationPrefer,
    eliteSchoolRequired: edu.eliteSchoolRequired,
    majorsRequired: majors.majorsRequired,
    majorsPreferred: majors.majorsPreferred,
    majorFlexible: majors.majorFlexible,
    genderPref: gender.genderPref,
    yearsMin: years.yearsMin,
    yearsMax: years.yearsMax,
    yearsFuzzy: years.yearsFuzzy,
    studentOnly,
    skillsRequired: skills.skillsRequired,
    skillsPreferred: skills.skillsPreferred,
    softSkills: skills.softSkills,
    languages,
    workMode,
    highlights,
    rawSignals,
  }
}
