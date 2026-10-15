import { loadJobs } from './crawl'
import { getGuokao2027JobById } from './guokao2027'
import type { Job } from './types'

export function getJobById(id: string): Job | undefined {
  return loadJobs().find((job) => job.id === id) ?? getGuokao2027JobById(id)
}
