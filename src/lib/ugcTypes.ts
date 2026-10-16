export type UgcPublishMode = 'free_tip' | 'paid'

export type UgcGuideListing = {
  id: string
  authorId: string
  authorName: string
  title: string
  bodyPreview: string
  bodyFull: string
  destinationLabel: string
  mode: UgcPublishMode
  /** 付费模式用户定价 1–99 */
  priceCny: number
  createdAt: number
  tipsCny: number
  sales: number
  previewRatio: number
}
