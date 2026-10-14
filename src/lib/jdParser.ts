import type { EducationLevel, GenderPref, StructuredRequirements } from './types'

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
  const studentOnly = /在校生|校招|应届/.test(text)

  const highlights: string[] = []
  if (educationMin) highlights.push(`学历门槛：${educationMin}及以上`)
  if (educationPrefer) highlights.push(`学历偏好：${educationPrefer}`)
  if (majors.length) highlights.push(`专业：${majors.join(' / ')}`)
  if (genderPref !== '不限') highlights.push(`原文性别标注：${genderPref}`)
  if (yearsMin != null && yearsMin > 0) highlights.push(`经验：${yearsMin}+ 年`)
  if (studentOnly) highlights.push('面向在校 / 应届')

  return {
    educationMin,
    educationPrefer,
    majors,
    majorFlexible,
    genderPref,
    yearsMin,
    studentOnly,
    highlights,
  }
}
