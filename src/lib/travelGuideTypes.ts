export type GuideLineKind =
  | 'title'
  | 'subtitle'
  | 'day'
  | 'section'
  | 'subhead'
  | 'label'
  | 'muted'
  | 'body'

export type TravelGuideDoc = {
  id: string
  title: string
  destinationId: string
  nights: number
  days: number
  dateRange?: string
  subtitle?: string
  lines: string[]
}

export type GuideSection = {
  id: string
  title: string
  lineStart: number
}
