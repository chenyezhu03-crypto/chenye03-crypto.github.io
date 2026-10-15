import type { TemplateModuleId } from './guideTemplateCatalog'
import type { TravelGuideDoc } from './travelGuideTypes'

function push(
  map: Record<TemplateModuleId, string[]>,
  id: TemplateModuleId,
  line: string,
) {
  map[id].push(line)
}

/** 将新加坡完整模版正文切成与 Word 目录一致的模块 */
export function splitSingaporeTemplate(lines: string[]): Record<TemplateModuleId, string[]> {
  const empty = (): Record<TemplateModuleId, string[]> => ({
    overview: [],
    pretrip_01: [],
    pretrip_02: [],
    pretrip_03: [],
    pretrip_apps: [],
    daily_detail: [],
    budget_final: [],
    official_menu: [],
  })
  const map = empty()
  let current: TemplateModuleId = 'overview'

  for (const line of lines) {
    if (line === '出发前 01') current = 'pretrip_01'
    else if (line === '出发前 02') current = 'pretrip_02'
    else if (line === '出发前 03') current = 'pretrip_03'
    else if (line.startsWith('出发前 APP')) current = 'pretrip_apps'
    else if (line.startsWith('DAY 1 ·')) current = 'daily_detail'
    else if (line.startsWith('出发前最后检查')) current = 'budget_final'
    else if (line.startsWith('官方来源菜单')) current = 'official_menu'
    push(map, current, line)
  }
  return map
}

export function mergeTemplateModules(
  parts: Record<TemplateModuleId, string[]>,
  moduleIds: TemplateModuleId[],
): string[] {
  const order: TemplateModuleId[] = [
    'overview',
    'pretrip_01',
    'pretrip_02',
    'pretrip_03',
    'pretrip_apps',
    'daily_detail',
    'budget_final',
    'official_menu',
  ]
  const pick = new Set(moduleIds)
  const out: string[] = []
  for (const id of order) {
    if (!pick.has(id)) continue
    if (parts[id].length) {
      if (out.length) out.push('---')
      out.push(...parts[id])
    }
  }
  return out
}

/** 用客户日期替换模版里一眼能识别的日期行（摘要 DAY 行保留结构） */
export function personalizeOverviewLines(
  lines: string[],
  titleLine: string,
  rangeLine: string,
  subtitle: string,
): string[] {
  return lines.map((line, i) => {
    if (i === 0 && line.includes(' · ')) return rangeLine
    if (i === 1 && line.includes('图文导游')) return titleLine
    if (i === 2 && (line.includes('往返') || line.includes('复核'))) return subtitle
    return line
  })
}

export function buildFromTemplateModules(
  base: TravelGuideDoc,
  parts: Record<TemplateModuleId, string[]>,
  moduleIds: TemplateModuleId[],
  headerLines: string[],
): TravelGuideDoc {
  const body = mergeTemplateModules(parts, moduleIds)
  return {
    ...base,
    lines: [
      ...headerLines,
      '套餐内容说明  下列章节按客户选购模块从标准 Word 模版截取生成。',
      ...body,
    ],
  }
}
