export type EducationLevel = '大专' | '本科' | '硕士' | '博士'
export type GenderPref = '不限' | '男' | '女'
export type Gender = '男' | '女' | '不愿透露'

export type PoliticalRequirement = '不限' | '党员' | '中共党员或共青团员'

export type StructuredRequirements = {
  educationMin: EducationLevel | null
  educationPrefer: EducationLevel | null
  majors: string[]
  majorFlexible: boolean
  genderPref: GenderPref
  yearsMin: number | null
  studentOnly: boolean
  /** 公考常见：基层工作经历年限（含「服务基层项目」表述） */
  grassrootsYearsMin: number | null
  political: PoliticalRequirement
  /** 是否明确要求取得与学历相应学位 */
  degreeRequired: boolean
  highlights: string[]
}

export type Job = {
  id: string
  title: string
  company: string
  location: string
  city: string
  type: string
  salary: string
  tags: string[]
  postedAt: string
  description: string
  requirements: string[]
  requirementText: string
  sourceId: string
  sourceName: string
  applyUrl?: string
  structured: StructuredRequirements
  crawledAt: string
}

export type UserProfile = {
  name: string
  email: string
  phone: string
  gender: Gender
  education: EducationLevel
  major: string
  school: string
  years: number
  isStudent: boolean
  /** 是否已取得与最高学历相应的学位（公考岗位常作硬性条件） */
  hasDegree: boolean
  /** 是否中共党员（含预备党员，演示级简化） */
  isPartyMember: boolean
  /** 基层工作经历年限（乡镇街道、国企事业单位等，按自述填写） */
  grassrootsYears: number
  skills: string[]
  highlights: string
  targetRoles: string[]
  targetCities: string[]
}

export type MatchDimension = {
  key: string
  label: string
  status: '通过' | '接近' | '缺口' | '无关'
  weight: number
  detail: string
}

export type MatchResult = {
  score: number
  hardPass: boolean
  blockers: string[]
  dimensions: MatchDimension[]
  summary: string
}

export type AdaptivePack = {
  angle: string
  coverLetter: string
  emphasis: string[]
  warnings: string[]
  suggestedEducationLine: string
  suggestedYearsLine: string
}
