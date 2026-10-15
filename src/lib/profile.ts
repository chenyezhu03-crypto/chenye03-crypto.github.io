import type { UserProfile } from './types'

const KEY = 'toujian-profile-v1'

export const defaultProfile = (): UserProfile => ({
  name: '',
  email: '',
  phone: '',
  gender: '不愿透露',
  education: '本科',
  major: '计算机',
  school: '',
  years: 2,
  isStudent: false,
  hasDegree: true,
  isPartyMember: false,
  grassrootsYears: 0,
  skills: ['React', 'TypeScript'],
  highlights: '',
  targetRoles: ['前端'],
  targetCities: ['上海', '远程'],
})

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultProfile()
    return { ...defaultProfile(), ...(JSON.parse(raw) as UserProfile) }
  } catch {
    return defaultProfile()
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEY, JSON.stringify(profile))
}

export function profileCompleteness(profile: UserProfile): number {
  const checks = [
    profile.name,
    profile.email,
    profile.phone,
    profile.education,
    profile.major,
    profile.school,
    profile.skills.length > 0,
    profile.targetRoles.length > 0,
  ]
  const ok = checks.filter(Boolean).length
  return Math.round((ok / checks.length) * 100)
}
