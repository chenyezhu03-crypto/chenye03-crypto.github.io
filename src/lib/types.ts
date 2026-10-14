export type EducationLevel = '大专' | '本科' | '硕士' | '博士'
export type GenderPref = '不限' | '男' | '女'
export type Gender = '男' | '女' | '不愿透露'
export type WorkMode = '现场' | '远程' | '混合' | '不限'

export type StructuredRequirements = {
  educationMin: EducationLevel | null
  educationPrefer: EducationLevel | null
  eliteSchoolRequired: boolean
  majorsRequired: string[]
  majorsPreferred: string[]
  majorFlexible: boolean
  genderPref: GenderPref
  yearsMin: number | null
  yearsMax: number | null
  yearsFuzzy: boolean
  studentOnly: boolean
  skillsRequired: string[]
  skillsPreferred: string[]
  softSkills: string[]
  languages: string[]
  workMode: WorkMode
  highlights: string[]
  rawSignals: string[]
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
  eliteSchool: boolean
  years: number
  isStudent: boolean
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
