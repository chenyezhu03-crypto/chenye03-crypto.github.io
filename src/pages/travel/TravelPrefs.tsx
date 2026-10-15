import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BUDGET_LABELS,
  MONTH_LABELS,
  VIBE_LABELS,
  type BudgetLevel,
  type TravelVibe,
} from '../../lib/travelTypes'
import { formatGeoBreadcrumb } from '../../lib/travelGeoMatch'
import { filterDestinations, relaxHints } from '../../lib/travelMatch'
import {
  DEFAULT_TRAVEL_PREFS,
  loadTravelPrefs,
  saveTravelPrefs,
} from '../../lib/travelStorage'

const VIBES = Object.keys(VIBE_LABELS) as TravelVibe[]
const BUDGETS = Object.keys(BUDGET_LABELS) as BudgetLevel[]

export function TravelPrefs() {
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState(() => loadTravelPrefs())
  const pool = filterDestinations(prefs)
  const hints = relaxHints(prefs, pool.length)

  function toggleVibe(v: TravelVibe) {
    setPrefs((p) => {
      const on = p.vibes.includes(v)
      const vibes = on ? p.vibes.filter((x) => x !== v) : [...p.vibes, v]
      return { ...p, vibes }
    })
  }

  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">出行偏好</h1>
        <p className="travel-lead">可以少填——留空表示「都行」。</p>

        <div className="field">
          <span className="field-label">地区（推荐在「地区」页分级选到国家）</span>
          <p className="travel-geo-crumb">
            {formatGeoBreadcrumb(prefs.geo) || '未选地区 · 默认全球候选'}
          </p>
          <Link className="btn btn-ghost travel-btn-block" to="/travel/region">
            去选国内/国外 → 洲 → 国家
          </Link>
        </div>

        <div className="field">
          <span className="field-label">玩法（可多选）</span>
          <div className="travel-chips">
            {VIBES.map((v) => (
              <button
                key={v}
                type="button"
                className={
                  prefs.vibes.includes(v) ? 'travel-chip is-on' : 'travel-chip'
                }
                onClick={() => toggleVibe(v)}
              >
                {VIBE_LABELS[v]}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="travel-budget">
            预算
          </label>
          <select
            id="travel-budget"
            value={prefs.budget}
            onChange={(e) =>
              setPrefs((p) => ({
                ...p,
                budget: e.target.value as typeof p.budget,
              }))
            }
          >
            <option value="any">不限</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {BUDGET_LABELS[b]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="travel-month">
            计划月份
          </label>
          <select
            id="travel-month"
            value={prefs.month === 'any' ? 'any' : String(prefs.month)}
            onChange={(e) => {
              const v = e.target.value
              setPrefs((p) => ({
                ...p,
                month: v === 'any' ? 'any' : Number(v),
              }))
            }}
          >
            <option value="any">不限</option>
            {MONTH_LABELS.map((label, i) => (
              <option key={label} value={String(i + 1)}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="travel-days">
            最多能玩几天
          </label>
          <select
            id="travel-days"
            value={prefs.maxDays === 'any' ? 'any' : String(prefs.maxDays)}
            onChange={(e) => {
              const v = e.target.value
              setPrefs((p) => ({
                ...p,
                maxDays: v === 'any' ? 'any' : Number(v),
              }))
            }}
          >
            <option value="any">不限</option>
            {[2, 3, 4, 5, 7, 10].map((d) => (
              <option key={d} value={String(d)}>
                ≤ {d} 天
              </option>
            ))}
          </select>
        </div>

        <p className="travel-match-line">
          当前匹配 <strong>{pool.length}</strong> 个目的地
          {pool.length < 3 && hints.length > 0 && (
            <span className="travel-match-hint">
              {' '}
              · 建议：{hints[0]}
            </span>
          )}
        </p>

        <div className="travel-actions">
          <button
            type="button"
            className="btn btn-primary travel-btn-block"
            onClick={() => {
              saveTravelPrefs(prefs)
              navigate('/travel/picks')
            }}
            disabled={pool.length === 0}
          >
            保存并抽 3 个
          </button>
          <button
            type="button"
            className="btn btn-ghost travel-btn-block"
            onClick={() => setPrefs({ ...DEFAULT_TRAVEL_PREFS })}
          >
            恢复默认
          </button>
          <Link className="travel-foot-link" to="/travel/spin">
            跳过，先看转盘
          </Link>
        </div>
      </section>
    </main>
  )
}
