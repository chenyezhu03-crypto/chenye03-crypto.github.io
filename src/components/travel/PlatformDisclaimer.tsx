import { STANDARD_DISCLAIMER, STANDARD_DISCLAIMER_SHORT } from '../../platform/manifest'

type Props = {
  variant?: 'short' | 'full'
  className?: string
}

export function PlatformDisclaimer({ variant = 'short', className = '' }: Props) {
  const text = variant === 'full' ? STANDARD_DISCLAIMER : STANDARD_DISCLAIMER_SHORT
  return (
    <p className={`travel-disclaimer ${className}`.trim()} role="note">
      {text}
    </p>
  )
}
