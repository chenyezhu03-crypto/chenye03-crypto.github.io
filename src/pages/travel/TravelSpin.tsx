import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SpinWheel } from '../../components/travel/SpinWheel'
import { formatGeoBreadcrumb } from '../../lib/travelGeoMatch'
import { filterDestinations, relaxHints } from '../../lib/travelMatch'
import { travelCustomPath } from '../../lib/travelCustomLink'
import { saveTravelPlanMode } from '../../lib/travelPlanMode'
import { loadTravelPrefs, saveTravelPrefs } from '../../lib/travelStorage'
import { useEffect } from 'react'

export function TravelSpin() {
  const navigate = useNavigate()
  const [prefs] = useState(() => loadTravelPrefs())

  useEffect(() => {
    saveTravelPlanMode('needs_help')
  }, [])
  const pool = useMemo(() => filterDestinations(prefs), [prefs])
  const hints = relaxHints(prefs, pool.length)

  const segments = useMemo(
    () => pool.map((d) => ({ id: d.id, label: d.name })),
    [pool],
  )

  function goPlace(id: string) {
    navigate(`/travel/place/${id}`)
  }

  function blindPick() {
    if (pool.length === 0) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    goPlace(pick.id)
  }

  function syncPrefs() {
    saveTravelPrefs(prefs)
  }

  return (
    <main className="travel-page travel-spin-page">
      <section className="travel-card travel-spin-intro">
        <h1 className="travel-h1">目的地大转盘</h1>
        <p className="travel-lead">
          {formatGeoBreadcrumb(prefs.geo)
            ? `范围：${formatGeoBreadcrumb(prefs.geo)} · `
            : ''}
          只在 {pool.length} 个候选里随机。
        </p>
        <Link
          className="btn btn-primary travel-btn-block"
          to={travelCustomPath()}
        >
          不用转盘 · 直接做 Word 攻略
        </Link>
        <Link className="travel-foot-link" to="/travel/region">
          先改地区分级（到国家）
        </Link>
        {pool.length < 3 && hints.length > 0 && (
          <p className="travel-warn">
            候选有点少，试试
            <Link to="/travel/prefs"> 放宽偏好 </Link>
            {hints[0]}。
          </p>
        )}
      </section>

      <SpinWheel segments={segments} onLand={goPlace} />

      <section className="travel-card travel-alt-pick">
        <h2 className="travel-h2">换一种决定方式</h2>
        <p className="travel-meta">不看转盘，直接从候选里盲抽一张。</p>
        <button
          type="button"
          className="btn btn-ghost travel-btn-block"
          onClick={blindPick}
          disabled={pool.length === 0}
        >
          盲抽目的地
        </button>
      </section>

      {segments.length > 0 && (
        <section className="travel-card">
          <h2 className="travel-h2">本轮候选</h2>
          <ul className="travel-pool-list">
            {pool.map((d) => (
              <li key={d.id}>
                <Link to={`/travel/place/${d.id}`} onClick={syncPrefs}>
                  {d.name}
                  <span>{d.region}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
