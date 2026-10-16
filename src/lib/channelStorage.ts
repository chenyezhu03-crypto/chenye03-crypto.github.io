import { CHANNEL_ROOMS, type ChannelPost, type ChannelRoom } from '../data/channelSeed'
import { loadCommunityProfile } from './travelCommunityStorage'

const POSTS_KEY = 'travel-channel-posts-v1'

type Stored = Record<string, ChannelPost[]>

function loadExtra(): Stored {
  try {
    return JSON.parse(localStorage.getItem(POSTS_KEY) ?? '{}') as Stored
  } catch {
    return {}
  }
}

export function allChannels(): ChannelRoom[] {
  const extra = loadExtra()
  return CHANNEL_ROOMS.map((room) => ({
    ...room,
    posts: [...(extra[room.id] ?? []), ...room.posts].sort(
      (a, b) => b.createdAt - a.createdAt,
    ),
  }))
}

export function postToChannel(channelId: string, body: string): void {
  const profile = loadCommunityProfile()
  const extra = loadExtra()
  const post: ChannelPost = {
    id: `cp-${Date.now()}`,
    author: profile.displayName,
    body: body.trim(),
    createdAt: Date.now(),
  }
  extra[channelId] = [post, ...(extra[channelId] ?? [])]
  localStorage.setItem(POSTS_KEY, JSON.stringify(extra))
}
