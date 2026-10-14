import type { Job, UserProfile } from './types'

export type ResumeVersion = {
  id: string
  name: string
  fileName: string
  targetRoles: string[]
  skills: string[]
  summary: string
  isDefault: boolean
  updatedAt: string
}

const KEY = 'toujian-resumes-v1'

export function defaultResumes(profile?: UserProfile): ResumeVersion[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'rv-general',
      name: '通用版',
      fileName: 'resume-general.pdf',
      targetRoles: profile?.targetRoles?.length
        ? profile.targetRoles
        : ['综合'],
      skills: profile?.skills?.length ? profile.skills : ['沟通', '落地'],
      summary: '平衡叙事，适合大多数岗位首投。',
      isDefault: true,
      updatedAt: now,
    },
    {
      id: 'rv-tech',
      name: '技术向',
      fileName: 'resume-tech.pdf',
      targetRoles: ['前端', '后端', '测试', '算法', '工程师'],
      skills: ['React', 'TypeScript', 'Java', 'Python', 'SQL'],
      summary: '强调工程能力、项目指标与技术栈关键词。',
      isDefault: false,
      updatedAt: now,
    },
    {
      id: 'rv-biz',
      name: '业务向',
      fileName: 'resume-biz.pdf',
      targetRoles: ['产品', '运营', '增长', '招聘', '销售'],
      skills: ['需求分析', '数据分析', '跨团队协作'],
      summary: '强调业务理解、结果导向与协作推进。',
      isDefault: false,
      updatedAt: now,
    },
  ]
}

export function loadResumes(): ResumeVersion[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultResumes()
    const parsed = JSON.parse(raw) as ResumeVersion[]
    return Array.isArray(parsed) && parsed.length ? parsed : defaultResumes()
  } catch {
    return defaultResumes()
  }
}

export function saveResumes(list: ResumeVersion[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function upsertResume(version: ResumeVersion): ResumeVersion[] {
  const list = loadResumes()
  const idx = list.findIndex((r) => r.id === version.id)
  const next = [...list]
  if (version.isDefault) {
    for (let i = 0; i < next.length; i++) next[i] = { ...next[i], isDefault: false }
  }
  if (idx >= 0) next[idx] = version
  else next.unshift(version)
  if (!next.some((r) => r.isDefault) && next[0]) {
    next[0] = { ...next[0], isDefault: true }
  }
  saveResumes(next)
  return next
}

export function deleteResume(id: string): ResumeVersion[] {
  let next = loadResumes().filter((r) => r.id !== id)
  if (!next.length) next = defaultResumes()
  if (!next.some((r) => r.isDefault)) next[0] = { ...next[0], isDefault: true }
  saveResumes(next)
  return next
}

function scoreResume(version: ResumeVersion, job: Job): number {
  const hay = `${job.title} ${job.tags.join(' ')} ${job.requirementText}`.toLowerCase()
  let score = version.isDefault ? 2 : 0
  for (const role of version.targetRoles) {
    if (role && hay.includes(role.toLowerCase())) score += 8
  }
  for (const skill of version.skills) {
    if (skill && hay.includes(skill.toLowerCase())) score += 5
  }
  return score
}

export function pickResumeForJob(job: Job, resumes = loadResumes()): ResumeVersion {
  const ranked = [...resumes].sort(
    (a, b) => scoreResume(b, job) - scoreResume(a, job),
  )
  return ranked[0] ?? defaultResumes()[0]
}

export function explainResumePick(job: Job, version: ResumeVersion): string {
  const hay = `${job.title} ${job.tags.join(' ')}`.toLowerCase()
  const hits = [...version.targetRoles, ...version.skills].filter(
    (x) => x && hay.includes(x.toLowerCase()),
  )
  if (hits.length) return `因命中「${hits.slice(0, 3).join(' / ')}」自动选用「${version.name}」`
  if (version.isDefault) return `未命中专项标签，回退默认「${version.name}」`
  return `相对其他版本更贴近「${job.title}」，选用「${version.name}」`
}
