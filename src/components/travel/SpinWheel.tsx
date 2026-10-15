import { useCallback, useMemo, useState } from 'react'

export type WheelSegment = { id: string; label: string }

type Props = {
  segments: WheelSegment[]
  onLand: (id: string) => void
  disabled?: boolean
}

const WHEEL_COLORS = [
  '#1a6b8a',
  '#2d8f6f',
  '#c45c26',
  '#5c4d7a',
  '#1f7a8c',
  '#b8860b',
  '#3d6b8c',
  '#8b4513',
  '#2e6f5e',
  '#6b3a6b',
  '#4a7c59',
  '#9b4d32',
]

export function SpinWheel({ segments, onLand, disabled }: Props) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const n = segments.length
  const segAngle = n > 0 ? 360 / n : 0

  const gradient = useMemo(() => {
    if (n === 0) return 'conic-gradient(#ccc 0deg 360deg)'
    const parts = segments.map((_, i) => {
      const c = WHEEL_COLORS[i % WHEEL_COLORS.length]
      const start = i * segAngle
      const end = (i + 1) * segAngle
      return `${c} ${start}deg ${end}deg`
    })
    return `conic-gradient(from -90deg, ${parts.join(', ')})`
  }, [segments, n, segAngle])

  const spin = useCallback(() => {
    if (disabled || spinning || n < 2) return
    setSpinning(true)
    const winner = Math.floor(Math.random() * n)
    const center = winner * segAngle + segAngle / 2
    const targetMod = (360 - center) % 360
    const currentMod = ((rotation % 360) + 360) % 360
    const delta = (targetMod - currentMod + 360) % 360
    const extra = 5 + Math.floor(Math.random() * 4)
    const next = rotation + extra * 360 + delta

    setRotation(next)

    const ms = 4200
    window.setTimeout(() => {
      setSpinning(false)
      onLand(segments[winner].id)
    }, ms)
  }, [disabled, spinning, n, segAngle, rotation, segments, onLand])

  if (n === 0) {
    return (
      <div className="travel-wheel-empty">
        <p>没有可转的目的地，请先放宽筛选条件。</p>
      </div>
    )
  }

  if (n === 1) {
    return (
      <div className="travel-wheel-single">
        <p className="travel-wheel-single-name">{segments[0].label}</p>
        <button
          type="button"
          className="btn btn-primary travel-spin-btn"
          onClick={() => onLand(segments[0].id)}
        >
          就是这里
        </button>
      </div>
    )
  }

  return (
    <div className="travel-wheel-wrap">
      <div className="travel-wheel-pointer" aria-hidden="true" />
      <div
        className="travel-wheel"
        style={{
          background: gradient,
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? 'transform 4.2s cubic-bezier(0.15, 0.85, 0.2, 1)'
            : 'none',
        }}
        role="img"
        aria-label={`转盘共 ${n} 个目的地`}
      />
      <ul className="travel-wheel-legend" aria-label="转盘分区">
        {segments.map((s, i) => (
          <li key={s.id}>
            <span
              className="travel-wheel-swatch"
              style={{ background: WHEEL_COLORS[i % WHEEL_COLORS.length] }}
              aria-hidden="true"
            />
            {s.label}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn btn-primary travel-spin-btn"
        onClick={spin}
        disabled={disabled || spinning}
      >
        {spinning ? '转盘中…' : '转一次'}
      </button>
    </div>
  )
}
