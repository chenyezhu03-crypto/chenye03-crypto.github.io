import type { RawFeedItem } from '../data/rawFeeds'
import { parseRequirementText } from './jdParser'
import type { Job } from './types'

export function normalizeFeedItem(item: RawFeedItem, crawledAt: string): Job {
  const structured = parseRequirementText(item.requirementText)
  const location = item.district
    ? `${item.city} · ${item.district}`
    : item.city

  return {
    id: `${item.sourceId}-${item.externalId}`,
    title: item.title,
    company: item.company,
    location,
    city: item.city,
    type: item.type,
    salary: item.salary,
    tags: item.tags,
    postedAt: item.postedAt,
    description: item.description,
    requirements: item.requirementText
      .split(/[；;。]/)
      .map((x) => x.trim())
      .filter((x) => x.length > 4)
      .slice(0, 6),
    requirementText: item.requirementText,
    sourceId: item.sourceId,
    sourceName: item.sourceName,
    applyUrl: item.applyUrl,
    structured,
    crawledAt,
    guokaoMeta: item.meta
      ? {
          deptCode: item.meta.deptCode,
          positionCode: item.meta.positionCode,
          bureau: item.meta.bureau,
          orgNature: item.meta.orgNature,
          positionAttr: item.meta.positionAttr,
          positionDistribution: item.meta.positionDistribution,
          orgLevel: item.meta.orgLevel,
          headcount: item.meta.headcount,
          interviewRatio: item.meta.interviewRatio,
          settleLocation: item.meta.settleLocation,
          deptWebsite: item.meta.deptWebsite,
          phones: item.meta.phones,
        }
      : undefined,
  }
}
