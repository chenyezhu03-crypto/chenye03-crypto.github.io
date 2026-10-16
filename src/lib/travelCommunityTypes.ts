/** 类似微信状态的即时状态（可随时切换） */
export type TravelMomentStatusId =
  | 'sleeping'
  | 'transit'
  | 'packing'
  | 'exploring'
  | 'foodie'
  | 'photo'
  | 'rest'
  | 'buddy'
  | 'writing'
  | 'dnd'

export type TravelMomentStatus = {
  id: TravelMomentStatusId
  emoji: string
  label: string
  hint: string
}

export type TravelCommunityProfile = {
  userId: string
  displayName: string
  avatarEmoji: string
  /** 计划/进行中的出行 */
  tripStart: string
  tripEnd: string
  destinationLabel: string
  destinationId?: string
  statusId: TravelMomentStatusId
  statusText: string
  statusUpdatedAt: number
  /** 是否对他人可见（同期行者 & 动态） */
  visible: boolean
}

export type CommunityPost = {
  id: string
  authorId: string
  authorName: string
  authorEmoji: string
  createdAt: number
  body: string
  destinationLabel?: string
  tripStart?: string
  tripEnd?: string
  statusId?: TravelMomentStatusId
  replyToId?: string
}

export type CommunityMember = TravelCommunityProfile & {
  /** 演示数据 / 其它用户 */
  isDemo?: boolean
}
