import { parseWordFieldLine } from './guideWordMode'
import type { GuideLineKind, GuideSection, TravelGuideDoc } from './travelGuideTypes'

export function classifyGuideLine(line: string, prev?: string): GuideLineKind {
  if (parseWordFieldLine(line)) return 'field'
  if (/^DAY \d ·/.test(line)) return 'day'
  if (line.startsWith('【服务报价单')) return 'section'
  if (/^SINGAPORE ·/.test(line)) return 'title'
  if (/^新加坡\d+晚\d+天/.test(line) || /^【/.test(line)) return 'title'
  if (/^DAY \d\b/.test(line)) return 'day'
  if (
    prev &&
    (/^DAY \d ·/.test(prev) || prev.startsWith('DAY ·')) &&
    line.length <= 28 &&
    !/[。；]/.test(line) &&
    !line.startsWith('本段')
  )
    return 'subhead'
  if (/^出发前/.test(line)) return 'section'
  if (
    line === '六天路线一眼看懂' ||
    line === '活动怎么放才不赶' ||
    line.startsWith('出发前最后检查') ||
    line.startsWith('官方来源菜单')
  )
    return 'section'
  if (
    /^(Routes with|Choose one|Travel documents|Forecast and|MyICA|SG Arrival|预算和现金)/.test(
      line,
    )
  )
    return 'subhead'
  if (/^(官方\/核实来源|图片来源|官方免费申报|官方售票|官方产品|官方票种|官方公布价)/.test(line))
    return 'muted'
  if (/^(主推荐|想看三丽鸥|想买文创|图文说明|预算说明|证件|订单|备份|最先做|费用|体感|雨天改线)/.test(line))
    return 'label'
  if (line.length <= 28 && /[A-Za-z ·]/.test(line) && !/[。；]/.test(line))
    return 'subhead'
  return 'body'
}

export function slugifyGuideTitle(title: string, index: number): string {
  const base = title
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  return `${base || 'sec'}-${index}`
}

export function buildGuideSections(doc: TravelGuideDoc): GuideSection[] {
  const sections: GuideSection[] = []
  doc.lines.forEach((line, i) => {
    const kind = classifyGuideLine(line)
    if (kind === 'day' || kind === 'section' || kind === 'title') {
      sections.push({
        id: slugifyGuideTitle(line, i),
        title: line,
        lineStart: i,
      })
    }
  })
  return sections
}

export function sectionForLine(
  sections: GuideSection[],
  index: number,
): string | undefined {
  let current: GuideSection | undefined
  for (const s of sections) {
    if (s.lineStart <= index) current = s
    else break
  }
  return current?.id
}
