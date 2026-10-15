import { formatCnDate } from './customTripTypes'

/** 对齐 Word 模版《新加坡5晚6天》的单条字段与景点块写法 */

export const WORD_FIELD_LABELS = [
  '时间',
  '地址邮编',
  '怎么去',
  '费用',
  '怎么玩/吃',
  '怎么玩',
  '拍照',
  '预约提醒',
  '本段路线',
  '预算',
  '预算档位',
] as const

export type WordFieldLine = { kind: 'field'; label: string; value: string }

export function parseWordFieldLine(line: string): WordFieldLine | null {
  for (const label of WORD_FIELD_LABELS) {
    if (line.startsWith(`${label}  `)) {
      return { kind: 'field', label, value: line.slice(label.length).trim() }
    }
    if (line.startsWith(`${label} `) && !line.startsWith(`${label}  `)) {
      const rest = line.slice(label.length).trim()
      if (rest) return { kind: 'field', label, value: rest }
    }
  }
  return null
}

export type WordBlockKind =
  | 'meta'
  | 'day'
  | 'section'
  | 'poiTitle'
  | 'poiEn'
  | 'field'
  | 'source'
  | 'body'

export function classifyWordTemplateLine(
  line: string,
  prev?: string,
): WordBlockKind {
  if (/^DAY \d ·/.test(line) || /^DAY \d  /.test(line)) return 'day'
  if (/^出发前/.test(line) || line.startsWith('【服务报价单')) return 'section'
  if (/^(官方\/核实来源|图片来源|实景\/官方)/.test(line)) return 'source'
  if (parseWordFieldLine(line)) return 'field'
  if (
    prev &&
    (/^DAY \d ·/.test(prev) || /^DAY \d  /.test(prev)) &&
    line.length <= 24 &&
    !/[。；]/.test(line)
  )
    return 'poiTitle'
  if (
    prev &&
    /^[\u4e00-\u9fa5]/.test(prev) &&
    /^[A-Za-z]/.test(line) &&
    line.length < 60
  )
    return 'poiEn'
  if (/^(SINGAPORE ·|新加坡)/.test(line)) return 'meta'
  return 'body'
}

export type PoiWordBlock = {
  nameCn: string
  nameEn?: string
  intro?: string
  fields: Partial<Record<(typeof WORD_FIELD_LABELS)[number], string>>
}

/** 按 Word 模版字段，从库内亮点生成一个景点块（非新加坡实稿时用） */
export function poiBlockToLines(poi: PoiWordBlock): string[] {
  const out: string[] = [poi.nameCn]
  if (poi.nameEn) out.push(poi.nameEn)
  if (poi.intro) out.push(poi.intro)
  const order: (typeof WORD_FIELD_LABELS)[number][] = [
    '时间',
    '地址邮编',
    '怎么去',
    '费用',
    '怎么玩/吃',
    '拍照',
    '预约提醒',
  ]
  for (const key of order) {
    const v = poi.fields[key]
    if (v) out.push(`${key}  ${v}`)
  }
  out.push('实景/官方图片参考', '图片来源', '官方/核实来源', 'Google地图·照片·菜单')
  return out
}

export function buildChoiceSectionLines(
  title: string,
  intro: string,
  options: PoiWordBlock[],
): string[] {
  const out = [`DAY · ${title}`, title, intro]
  for (const opt of options) {
    out.push(...poiBlockToLines(opt))
  }
  return out
}

export function buildWordModeDailyDetail(
  startDate: string,
  _endDate: string,
  days: number,
  stops: { name: string; highlights: string[]; tips: string }[],
): string[] {
  const lines: string[] = []
  if (days <= 2 || stops.length === 0) {
    return lines
  }
  const addDays = (iso: string, n: number) => {
    const d = new Date(`${iso}T12:00:00`)
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
  }
  let hi = 0
  for (let d = 2; d < days; d++) {
    const dest = stops[d % stops.length]
    const highlight = dest.highlights[hi % dest.highlights.length]
    hi++
    const iso = addDays(startDate, d - 1)
    lines.push(
      ...buildWordModeDayFromHighlight(
        d,
        formatCnDate(iso),
        dest.name,
        highlight,
        dest.tips,
      ),
    )
  }
  return lines
}

export function buildWordModeDayFromHighlight(
  dayNum: number,
  dateLabel: string,
  destName: string,
  highlight: string,
  tip: string,
): string[] {
  const sectionTitle = highlight
  const poi: PoiWordBlock = {
    nameCn: highlight,
    nameEn: `${destName} · ${highlight}`,
    intro: `安排在第 ${dayNum} 天，按体力和天气微调顺序；${tip}`,
    fields: {
      时间: '09:30–12:00 · 停留约 2–3 小时（示例，请按订单日修改）',
      地址邮编: '出发前用 Google 地图核对最新门牌与邮编',
      怎么去: `前一晚酒店 → ${highlight}：优先地铁/打车，高峰预留 30 分钟`,
      费用: '以官方售票/现场菜单为准，付款前再看结算页',
      '怎么玩/吃': `核心体验：${highlight}；午间留 45 分钟休息`,
      拍照: '主入口与标志性视角各 1–2 张；尊重现场拍摄规定',
      预约提醒: '热门项目建议提前 1–3 天预约；以官网为准',
    },
  }
  return [
    `DAY ${dayNum} · ${dateLabel}`,
    sectionTitle,
    `上午安排 ${highlight}；下午可回酒店休息或商场室内备选。`,
    ...poiBlockToLines(poi),
    `本段路线  酒店 → ${highlight} → 午餐 → 下午自由活动`,
  ]
}
