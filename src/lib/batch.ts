import { buildAdaptivePack } from './adaptiveApply'
import { matchJob } from './match'
import { loadProfile } from './profile'
import { explainResumePick, pickResumeForJob } from './resumes'
import { saveApplication } from './storage'
import type { Job } from './types'

export type QueueItemStatus = '待投递' | '投递中' | '已完成' | '失败'

export type QueueItem = {
  jobId: string
  jobTitle: string
  company: string
  matchScore: number
  hardPass: boolean
  resumeName: string
  resumeVersionId: string
  status: QueueItemStatus
  message?: string
}

export type BatchResult = {
  total: number
  success: number
  failed: number
  items: QueueItem[]
}

export function buildHardPassQueue(jobs: Job[]): QueueItem[] {
  const profile = loadProfile()
  return jobs
    .map((job) => {
      const match = matchJob(profile, job)
      const resume = pickResumeForJob(job)
      return {
        job,
        match,
        resume,
      }
    })
    .filter((row) => row.match.hardPass)
    .sort((a, b) => b.match.score - a.match.score)
    .map((row) => ({
      jobId: row.job.id,
      jobTitle: row.job.title,
      company: row.job.company,
      matchScore: row.match.score,
      hardPass: true,
      resumeName: row.resume.fileName,
      resumeVersionId: row.resume.id,
      status: '待投递' as const,
      message: explainResumePick(row.job, row.resume),
    }))
}

export async function runBatchQueue(
  jobs: Job[],
  selectedIds: string[],
  onProgress?: (items: QueueItem[]) => void,
): Promise<BatchResult> {
  const profile = loadProfile()
  const selected = new Set(selectedIds)
  const targetJobs = jobs.filter((j) => selected.has(j.id))

  const items: QueueItem[] = targetJobs.map((job) => {
    const match = matchJob(profile, job)
    const resume = pickResumeForJob(job)
    return {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      matchScore: match.score,
      hardPass: match.hardPass,
      resumeName: resume.fileName,
      resumeVersionId: resume.id,
      status: '待投递' as const,
      message: explainResumePick(job, resume),
    }
  })

  onProgress?.([...items])

  let success = 0
  let failed = 0

  for (let i = 0; i < items.length; i++) {
    const job = targetJobs[i]
    items[i] = { ...items[i], status: '投递中' }
    onProgress?.([...items])

    // 轻微延迟，便于界面展示队列节奏
    await new Promise((r) => setTimeout(r, 280))

    try {
      if (!items[i].hardPass) {
        throw new Error('硬门槛未通过，已跳过')
      }
      const match = matchJob(profile, job)
      const resume = pickResumeForJob(job)
      const pack = buildAdaptivePack(profile, job, match)

      saveApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        name: profile.name || '未命名候选人',
        email: profile.email || 'unknown@example.com',
        phone: profile.phone || '未填写',
        education: pack.suggestedEducationLine,
        years: pack.suggestedYearsLine,
        resumeName: resume.fileName,
        coverLetter: pack.coverLetter,
        matchScore: match.score,
        hardPass: match.hardPass,
        applyAngle: pack.angle,
        sourceName: job.sourceName,
        resumeVersionId: resume.id,
        resumeVersionName: resume.name,
        batch: true,
      })

      items[i] = {
        ...items[i],
        status: '已完成',
        message: `${explainResumePick(job, resume)} · 已写入投递记录`,
      }
      success += 1
    } catch (err) {
      items[i] = {
        ...items[i],
        status: '失败',
        message: err instanceof Error ? err.message : '投递失败',
      }
      failed += 1
    }

    onProgress?.([...items])
  }

  return { total: items.length, success, failed, items }
}
