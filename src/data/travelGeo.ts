/** 地区树：一级国内/国外 → 二级洲或中国大区 → 三级子区域 → 四级国家 */

import type { TravelGeoPath } from '../lib/travelTypes'

export type GeoLevel = 1 | 2 | 3 | 4

export type GeoNode = {
  id: string
  label: string
  level: GeoLevel
  scope: 'domestic' | 'abroad'
  parentId: string | null
}

export const GEO_NODES: GeoNode[] = [
  { id: 'domestic', label: '国内', level: 1, scope: 'domestic', parentId: null },
  { id: 'abroad', label: '国外', level: 1, scope: 'abroad', parentId: null },

  /* 国内 · 七大地理分区（二级） */
  { id: 'cn-east', label: '华东', level: 2, scope: 'domestic', parentId: 'domestic' },
  { id: 'cn-south', label: '华南', level: 2, scope: 'domestic', parentId: 'domestic' },
  { id: 'cn-north', label: '华北', level: 2, scope: 'domestic', parentId: 'domestic' },
  { id: 'cn-northeast', label: '东北', level: 2, scope: 'domestic', parentId: 'domestic' },
  { id: 'cn-central', label: '华中', level: 2, scope: 'domestic', parentId: 'domestic' },
  { id: 'cn-southwest', label: '西南', level: 2, scope: 'domestic', parentId: 'domestic' },
  { id: 'cn-northwest', label: '西北', level: 2, scope: 'domestic', parentId: 'domestic' },

  /* 国内 · 三级（省域片） */
  { id: 'cn-zhejiang', label: '浙江', level: 3, scope: 'domestic', parentId: 'cn-east' },
  { id: 'cn-jiangsu', label: '江苏', level: 3, scope: 'domestic', parentId: 'cn-east' },
  { id: 'cn-fujian', label: '福建', level: 3, scope: 'domestic', parentId: 'cn-east' },
  { id: 'cn-shandong', label: '山东', level: 3, scope: 'domestic', parentId: 'cn-east' },
  { id: 'cn-jiangxi', label: '江西', level: 3, scope: 'domestic', parentId: 'cn-east' },
  { id: 'cn-anhui', label: '安徽', level: 3, scope: 'domestic', parentId: 'cn-east' },
  { id: 'cn-guangdong', label: '广东', level: 3, scope: 'domestic', parentId: 'cn-south' },
  { id: 'cn-hainan', label: '海南', level: 3, scope: 'domestic', parentId: 'cn-south' },
  { id: 'cn-guangxi', label: '广西', level: 3, scope: 'domestic', parentId: 'cn-south' },
  { id: 'cn-hkmo', label: '港澳', level: 3, scope: 'domestic', parentId: 'cn-south' },
  { id: 'cn-beijing', label: '京津冀', level: 3, scope: 'domestic', parentId: 'cn-north' },
  { id: 'cn-heilongjiang', label: '黑龙江', level: 3, scope: 'domestic', parentId: 'cn-northeast' },
  { id: 'cn-hunan', label: '湖南', level: 3, scope: 'domestic', parentId: 'cn-central' },
  { id: 'cn-sichuan', label: '四川', level: 3, scope: 'domestic', parentId: 'cn-southwest' },
  { id: 'cn-yunnan', label: '云南', level: 3, scope: 'domestic', parentId: 'cn-southwest' },
  { id: 'cn-chongqing', label: '重庆', level: 3, scope: 'domestic', parentId: 'cn-southwest' },
  { id: 'cn-tibet', label: '西藏', level: 3, scope: 'domestic', parentId: 'cn-southwest' },
  { id: 'cn-shaanxi', label: '陕西', level: 3, scope: 'domestic', parentId: 'cn-northwest' },
  { id: 'cn-gansu', label: '甘肃', level: 3, scope: 'domestic', parentId: 'cn-northwest' },
  { id: 'cn-qinghai', label: '青海', level: 3, scope: 'domestic', parentId: 'cn-northwest' },

  /* 国外 · 六大洲（二级） */
  { id: 'asia', label: '亚洲', level: 2, scope: 'abroad', parentId: 'abroad' },
  { id: 'europe', label: '欧洲', level: 2, scope: 'abroad', parentId: 'abroad' },
  { id: 'africa', label: '非洲', level: 2, scope: 'abroad', parentId: 'abroad' },
  { id: 'north-america', label: '北美洲', level: 2, scope: 'abroad', parentId: 'abroad' },
  { id: 'south-america', label: '南美洲', level: 2, scope: 'abroad', parentId: 'abroad' },
  { id: 'oceania', label: '大洋洲', level: 2, scope: 'abroad', parentId: 'abroad' },

  /* 亚洲 · 三级 */
  { id: 'east-asia', label: '东亚', level: 3, scope: 'abroad', parentId: 'asia' },
  { id: 'southeast-asia', label: '东南亚', level: 3, scope: 'abroad', parentId: 'asia' },
  { id: 'south-asia', label: '南亚', level: 3, scope: 'abroad', parentId: 'asia' },
  { id: 'west-asia', label: '西亚 / 中东', level: 3, scope: 'abroad', parentId: 'asia' },

  /* 欧洲 · 三级 */
  { id: 'west-europe', label: '西欧', level: 3, scope: 'abroad', parentId: 'europe' },
  { id: 'south-europe', label: '南欧', level: 3, scope: 'abroad', parentId: 'europe' },

  /* 大洋洲 · 三级 */
  { id: 'oceania-core', label: '澳新', level: 3, scope: 'abroad', parentId: 'oceania' },

  /* 四级 · 国家 / 地区 */
  { id: 'jp', label: '日本', level: 4, scope: 'abroad', parentId: 'east-asia' },
  { id: 'kr', label: '韩国', level: 4, scope: 'abroad', parentId: 'east-asia' },
  { id: 'th', label: '泰国', level: 4, scope: 'abroad', parentId: 'southeast-asia' },
  { id: 'sg', label: '新加坡', level: 4, scope: 'abroad', parentId: 'southeast-asia' },
  { id: 'id', label: '印度尼西亚', level: 4, scope: 'abroad', parentId: 'southeast-asia' },
  { id: 'mv', label: '马尔代夫', level: 4, scope: 'abroad', parentId: 'south-asia' },
  { id: 'tr', label: '土耳其', level: 4, scope: 'abroad', parentId: 'west-asia' },
  { id: 'ae', label: '阿联酋', level: 4, scope: 'abroad', parentId: 'west-asia' },
  { id: 'fr', label: '法国', level: 4, scope: 'abroad', parentId: 'west-europe' },
  { id: 'it', label: '意大利', level: 4, scope: 'abroad', parentId: 'south-europe' },
  { id: 'es', label: '西班牙', level: 4, scope: 'abroad', parentId: 'south-europe' },
  { id: 'au', label: '澳大利亚', level: 4, scope: 'abroad', parentId: 'oceania-core' },
  { id: 'nz', label: '新西兰', level: 4, scope: 'abroad', parentId: 'oceania-core' },
]

/** 国内四级统一为中国：各省片下均可挂 cn */
const CN_COUNTRY: GeoNode = {
  id: 'cn',
  label: '中国',
  level: 4,
  scope: 'domestic',
  parentId: '',
}

export function getGeoNode(id: string): GeoNode | undefined {
  if (id === 'cn') return { ...CN_COUNTRY, parentId: '' }
  return GEO_NODES.find((n) => n.id === id)
}

export function getGeoChildren(parentId: string | null): GeoNode[] {
  if (parentId === null) {
    return GEO_NODES.filter((n) => n.level === 1)
  }
  if (parentId.startsWith('cn-') && parentId !== 'cn' && getGeoNode(parentId)?.level === 3) {
    return [{ ...CN_COUNTRY, parentId }]
  }
  return GEO_NODES.filter((n) => n.parentId === parentId)
}

export function geoPathLabels(path: TravelGeoPath): string[] {
  const ids = [path.l1, path.l2, path.l3, path.l4].filter(Boolean) as string[]
  return ids.map((id) => getGeoNode(id)?.label ?? id)
}

/** 当前应操作的层级（1–4），null 表示已选到国家/中国 */
export function nextGeoLevel(path: TravelGeoPath): GeoLevel | null {
  if (!path.l1) return 1
  if (!path.l2) return 2
  if (!path.l3) return 3
  if (!path.l4) return 4
  return null
}

export function levelTitle(level: GeoLevel): string {
  switch (level) {
    case 1:
      return '一级 · 国内 / 国外'
    case 2:
      return '二级 · 大区 / 大洲'
    case 3:
      return '三级 · 子区域 / 省域'
    case 4:
      return '四级 · 国家 / 地区'
  }
}
