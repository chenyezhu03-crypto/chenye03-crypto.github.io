import type { TravelMomentStatus } from '../lib/travelCommunityTypes'

export const TRAVEL_MOMENT_STATUSES: TravelMomentStatus[] = [
  { id: 'sleeping', emoji: '😴', label: '睡觉中', hint: '勿扰，明天再聊' },
  { id: 'transit', emoji: '✈️', label: '在路上', hint: '赶飞机/高铁中' },
  { id: 'packing', emoji: '🧳', label: '收拾行李', hint: '出发倒计时' },
  { id: 'exploring', emoji: '🗺️', label: '探索中', hint: '正在外面玩' },
  { id: 'foodie', emoji: '🍜', label: '找吃的', hint: '觅食/排队中' },
  { id: 'photo', emoji: '📸', label: '拍照营业', hint: '出片中' },
  { id: 'rest', emoji: '☕', label: '休息摸鱼', hint: '咖啡馆躺平' },
  { id: 'buddy', emoji: '🤝', label: '找搭子', hint: '想约同期同行' },
  { id: 'writing', emoji: '📝', label: '写攻略', hint: '整理行程/笔记' },
  { id: 'dnd', emoji: '🌙', label: '勿扰', hint: '暂时不回复' },
]

export function statusById(id: TravelMomentStatus['id']): TravelMomentStatus {
  const s = TRAVEL_MOMENT_STATUSES.find((x) => x.id === id)
  return s ?? TRAVEL_MOMENT_STATUSES[3]
}
