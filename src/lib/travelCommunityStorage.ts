import { CUSTOM_BRIEF_STORAGE_KEY, type CustomTripBrief } from './customTripTypes'
import { getDestinationById } from './travelMatch'
import {
  DEMO_COMMUNITY_MEMBERS,
  DEMO_COMMUNITY_POSTS,
} from '../data/travelCommunitySeed'
import { statusById } from '../data/travelStatusPresets'
import type {
  CommunityMember,
  CommunityPost,
  TravelCommunityProfile,
  TravelMomentStatusId,
} from './travelCommunityTypes'
import { tripsOverlap } from './travelTripOverlap'

const PROFILE_KEY = 'travel-community-profile-v1'
const POSTS_KEY = 'travel-community-posts-v1'

function randomId(): string {
  return `u-${Math.random().toString(36).slice(2, 10)}`
}

function defaultTripRange(): { start: string; end: string } {
  const start = new Date()
  const end = new Date(start)
  end.setDate(end.getDate() + 5)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export function loadCommunityProfile(): TravelCommunityProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) {
      return JSON.parse(raw) as TravelCommunityProfile
    }
  } catch {
    /* ignore */
  }
  const { start, end } = defaultTripRange()
  const profile: TravelCommunityProfile = {
    userId: randomId(),
    displayName: '旅友' + Math.floor(Math.random() * 900 + 100),
    avatarEmoji: '🧳',
    tripStart: start,
    tripEnd: end,
    destinationLabel: '未填写',
    statusId: 'exploring',
    statusText: '',
    statusUpdatedAt: Date.now(),
    visible: true,
  }
  saveCommunityProfile(profile)
  return profile
}

export function saveCommunityProfile(profile: TravelCommunityProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function applyStatus(
  profile: TravelCommunityProfile,
  statusId: TravelMomentStatusId,
  statusText?: string,
): TravelCommunityProfile {
  const preset = statusById(statusId)
  const next: TravelCommunityProfile = {
    ...profile,
    statusId,
    statusText: (statusText ?? preset.hint).trim(),
    statusUpdatedAt: Date.now(),
  }
  saveCommunityProfile(next)
  return next
}

/** 从第二步定制表单同步出行日期与目的地（若有） */
export function syncProfileFromCustomBrief(
  profile: TravelCommunityProfile,
): TravelCommunityProfile {
  try {
    const raw = sessionStorage.getItem(CUSTOM_BRIEF_STORAGE_KEY)
    if (!raw) return profile
    const brief = JSON.parse(raw) as Partial<CustomTripBrief>
    if (!brief.startDate || !brief.endDate) return profile
    const dest =
      brief.destinationIds?.map((id) => getDestinationById(id)?.name).filter(Boolean) ??
      []
    const label =
      dest.length > 0
        ? dest.join('、')
        : brief.customPlaces?.join('、') || profile.destinationLabel
    const next: TravelCommunityProfile = {
      ...profile,
      tripStart: brief.startDate,
      tripEnd: brief.endDate,
      destinationLabel: label || profile.destinationLabel,
      destinationId: brief.destinationIds?.[0],
    }
    saveCommunityProfile(next)
    return next
  } catch {
    return profile
  }
}

export function loadUserPosts(): CommunityPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY)
    if (raw) return JSON.parse(raw) as CommunityPost[]
  } catch {
    /* ignore */
  }
  return []
}

function saveUserPosts(posts: CommunityPost[]): void {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export function addCommunityPost(
  profile: TravelCommunityProfile,
  body: string,
): CommunityPost {
  const post: CommunityPost = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    authorId: profile.userId,
    authorName: profile.displayName,
    authorEmoji: profile.avatarEmoji,
    createdAt: Date.now(),
    body: body.trim(),
    destinationLabel: profile.destinationLabel,
    tripStart: profile.tripStart,
    tripEnd: profile.tripEnd,
    statusId: profile.statusId,
  }
  const list = [post, ...loadUserPosts()]
  saveUserPosts(list)
  return post
}

export function allVisibleMembers(
  self: TravelCommunityProfile,
): CommunityMember[] {
  const me: CommunityMember = { ...self, isDemo: false }
  const demos = DEMO_COMMUNITY_MEMBERS.filter((d) => d.visible)
  return [me, ...demos.filter((d) => d.userId !== self.userId)]
}

export function membersOnSameTrip(
  self: TravelCommunityProfile,
): CommunityMember[] {
  return allVisibleMembers(self).filter(
    (m) =>
      m.userId !== self.userId &&
      m.visible &&
      tripsOverlap(self.tripStart, self.tripEnd, m.tripStart, m.tripEnd),
  )
}

export function membersSameDestination(
  self: TravelCommunityProfile,
): CommunityMember[] {
  if (!self.destinationLabel || self.destinationLabel === '未填写') return []
  const key = self.destinationLabel.replace(/\s/g, '')
  return allVisibleMembers(self).filter((m) => {
    if (m.userId === self.userId || !m.visible) return false
    if (self.destinationId && m.destinationId) {
      return self.destinationId === m.destinationId
    }
    const other = m.destinationLabel.replace(/\s/g, '')
    return key.includes(other.slice(0, 2)) || other.includes(key.slice(0, 2))
  })
}

export function communityFeed(_self: TravelCommunityProfile): CommunityPost[] {
  const userPosts = loadUserPosts()
  const merged = [...userPosts, ...DEMO_COMMUNITY_POSTS]
  merged.sort((a, b) => b.createdAt - a.createdAt)
  return merged
}

export function formatStatusAgo(ms: number): string {
  const diff = Date.now() - ms
  if (diff < 60_000) return '刚刚'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`
  return `${Math.floor(diff / 86400_000)} 天前`
}
