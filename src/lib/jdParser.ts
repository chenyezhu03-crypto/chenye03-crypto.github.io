import type {
  EducationLevel,
  GenderPref,
  PoliticalRequirement,
  StructuredRequirements,
} from './types'

const EDU_RANK: EducationLevel[] = ['大专', '本科', '硕士', '博士']

const MAJOR_WORDS = [
  '计算机',
  '软件工程',
  '电子信息',
  '人工智能',
  '数学',
  '统计学',
  '经济学',
  '设计',
  '视觉传达',
  '数字媒体',
  '新闻',
  '中文',
  '传播',
  '市场营销',
  '人力资源',
  '行政管理',
  '心理学',
  '药学',
  '医学',
  '生物',
  '法学',
  '行政管理',
  '公共管理',
  '财政学',
  '会计学',
  '审计学',
  '税务',
  '英语',
  '国际政治',
  '矿业工程',
  '安全工程',
]

export function educationRank(level: EducationLevel | null): number {
  if (!level) return -1
  return EDU_RANK.indexOf(level)
}

function pickEducation(text: string): {
  educationMin: EducationLevel | null
  educationPrefer: EducationLevel | null
} {
  let educationMin: EducationLevel | null = null
  let educationPrefer: EducationLevel | null = null

  if (/博士/.test(text)) educationMin = '博士'
  else if (/硕士及以上|研究生及以上|硕士优先/.test(text) && /硕士优先/.test(text)) {
    educationPrefer = '硕士'
    if (/本科及以上/.test(text)) educationMin = '本科'
    else if (/大专及以上|专科及以上/.test(text)) educationMin = '大专'
  } else if (/硕士及以上|研究生及以上/.test(text)) educationMin = '硕士'
  else if (/本科及以上|本科/.test(text) && !/大专及以上|专科及以上/.test(text))
    educationMin = '本科'
  else if (/大专及以上|专科及以上|大专/.test(text)) educationMin = '大专'

  if (/硕士优先/.test(text)) educationPrefer = '硕士'
  if (/博士优先/.test(text)) educationPrefer = '博士'

  return { educationMin, educationPrefer }
}

function pickGender(text: string): GenderPref {
  if (/男女不限|性别不限/.test(text)) return '不限'
  if (/限男生|仅限男|只要男|男士优先|限男/.test(text)) return '男'
  if (/限女生|仅限女|只要女|女生优先|限女/.test(text)) return '女'
  return '不限'
}

function pickYears(text: string): number | null {
  const m = text.match(/(\d+)\s*年以上/)
  if (m) return Number(m[1])
  if (/应届|在校生|校招/.test(text)) return 0
  return null
}

function pickGrassrootsYears(text: string): number | null {
  const m = text.match(/基层工作(?:经历)?(?:满)?(\d+)\s*年/)
  if (m) return Number(m[1])
  if (/具有2年及以上基层工作经历|二年以上基层/.test(text)) return 2
  if (/具有1年及以上基层工作经历|一年以上基层/.test(text)) return 1
  return null
}

function pickPolitical(text: string): PoliticalRequirement {
  if (/中共党员|党员/.test(text) && !/共青团员/.test(text)) return '党员'
  if (/中共党员或共青团员|党员或团员/.test(text)) return '中共党员或共青团员'
  return '不限'
}

function pickDegreeRequired(text: string): boolean {
  return /取得相应学位|须取得.*学位|具有.*学位/.test(text)
}

function pickMajors(text: string): { majors: string[]; majorFlexible: boolean } {
  if (/专业不限/.test(text)) return { majors: [], majorFlexible: true }
  const majors = MAJOR_WORDS.filter((word) => text.includes(word))
  const majorFlexible = /相关专业优先|专业优先/.test(text) && !/必须.*专业/.test(text)
  return { majors, majorFlexible: majors.length === 0 ? true : majorFlexible }
}

export function parseRequirementText(text: string): StructuredRequirements {
  const { educationMin, educationPrefer } = pickEducation(text)
  const { majors, majorFlexible } = pickMajors(text)
  const genderPref = pickGender(text)
  const yearsMin = pickYears(text)
  const studentOnly = /仅限?\s*20\d{2}届|仅限应届|限应届|面向应届|在校生|校招/.test(
    text,
  )
  const grassrootsYearsMin = pickGrassrootsYears(text)
  const political = pickPolitical(text)
  const degreeRequired = pickDegreeRequired(text)

  const highlights: string[] = []
  if (educationMin) highlights.push(`学历门槛：${educationMin}及以上`)
  if (educationPrefer) highlights.push(`学历偏好：${educationPrefer}`)
  if (degreeRequired) highlights.push('须取得相应学位')
  if (majors.length) highlights.push(`专业：${majors.join(' / ')}`)
  if (genderPref !== '不限') highlights.push(`原文性别标注：${genderPref}`)
  if (political !== '不限') highlights.push(`政治面貌：${political}`)
  if (grassrootsYearsMin != null && grassrootsYearsMin > 0)
    highlights.push(`基层经历：${grassrootsYearsMin}+ 年`)
  if (yearsMin != null && yearsMin > 0) highlights.push(`经验：${yearsMin}+ 年`)
  if (studentOnly) highlights.push('限应届 / 在校')

  return {
    educationMin,
    educationPrefer,
    majors,
    majorFlexible,
    genderPref,
    yearsMin,
    studentOnly,
    grassrootsYearsMin,
    political,
    degreeRequired,
    highlights,
  }
}
