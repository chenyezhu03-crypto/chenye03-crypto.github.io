import { watermarkLabel } from '../../lib/ugcStorage'

type Props = {
  buyerName: string
  authorName: string
  className?: string
}

/** UGC 强制水印层（演示：CSS 重复文字） */
export function UgcWatermark({ buyerName, authorName, className = '' }: Props) {
  const text = `${watermarkLabel(buyerName)} · 作者 ${authorName}`
  return (
    <div
      className={`travel-ugc-watermark ${className}`.trim()}
      aria-hidden
      data-watermark={text}
    />
  )
}
