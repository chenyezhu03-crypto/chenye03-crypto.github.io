export type Application = {
  id: string
  jobId: string
  jobTitle: string
  company: string
  name: string
  email: string
  phone: string
  education: string
  years: string
  resumeName: string
  coverLetter: string
  matchScore: number
  hardPass: boolean
  applyAngle: string
  sourceName: string
  resumeVersionId?: string
  resumeVersionName?: string
  batch?: boolean
  status: '已投递' | '已查看' | '面试邀请'
  submittedAt: string
}

const KEY = 'toujian-applications-v1'

export function listApplications(): Application[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Application[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveApplication(
  input: Omit<Application, 'id' | 'status' | 'submittedAt'>,
): Application {
  const next: Application = {
    ...input,
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: '已投递',
    submittedAt: new Date().toISOString(),
  }
  const all = [next, ...listApplications()]
  localStorage.setItem(KEY, JSON.stringify(all))
  return next
}

export function clearApplications(): void {
  localStorage.removeItem(KEY)
}

export function hasApplied(jobId: string): boolean {
  return listApplications().some((item) => item.jobId === jobId)
}
