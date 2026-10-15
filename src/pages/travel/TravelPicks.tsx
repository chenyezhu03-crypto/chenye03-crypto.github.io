import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SpinWheel } from '../../components/travel/SpinWheel'
import {
  formatGeoBreadcrumb,
  pickRandomDestinations,
} from '../../lib/travelGeoMatch'
import { filterDestinations, getDestinationById } from '../../lib/travelMatch'
import { travelCustomPath } from '../../lib/travelCustomLink'
import { loadTravelPrefs, saveTravelPrefs } from '../../lib/travelStorage'

type LocationState = { picks?: string[] }

export function TravelPicks() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as LocationState
  const [prefs] = useState(() => loadTravelPrefs())
  const pool = useMemo(() => filterDestinations(prefs), [prefs])

  const [pickIds, setPickIds] = useState<string[]>(() => {
    if (state.picks?.length) return state.picks
    return pickRandomDestinations(pool, 3).map((d) => d.id)
  })

  const picks = pickIds
    .map((id) => getDestinationById(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))

  const segments = useMemo(
    () => pool.map((d) => ({ id: d.id, label: d.name })),
    [pool],
  )

  function rerollThree() {
    const next = pickRandomDestinations(pool, 3)
    setPickIds(next.map((d) => d.id))
  }

  function goPlace(id: string) {
    navigate(`/travel/place/${id}`)
  }

  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">给你 3 个备选</h1>
        <p className="travel-lead">
          在
          {formatGeoBreadcrumb(prefs.geo)
            ? `「${formatGeoBreadcrumb(prefs.geo)}」`
            : '当前条件'}
          下随机选出，可再换一批或单独转一个。
        </p>
        <button
          type="button"
          className="btn btn-ghost travel-btn-block"
          onClick={rerollThree}
          disabled={pool.length === 0}
        >
          换一批 3 个
        </button>
        <Link
          className="btn btn-primary travel-btn-block"
          to={travelCustomPath({ dests: pickIds })}
        >
          已定案 · 为这 {picks.length} 个做 Word 攻略
        </Link>
      </section>

      <ul className="travel-pick-three">
        {picks.map((d, i) => (
          <li key={d.id} className="travel-pick-card">
            <span className="travel-pick-rank">备选 {i + 1}</span>
            <h2>{d.name}</h2>
            <p className="travel-meta">{d.region} · {d.tagline}</p>
            <div className="travel-pick-actions">
              <Link className="btn btn-ghost" to={`/travel/place/${d.id}`}>
                看详情
              </Link>
              <Link
                className="btn btn-ghost"
                to={travelCustomPath({ dest: d.id })}
              >
                做 Word 攻略
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {pool.length > 3 && (
        <section className="travel-card">
          <h2 className="travel-h2">只定一个？再转一次</h2>
          <SpinWheel segments={segments} onLand={goPlace} />
        </section>
      )}

      <div className="travel-actions">
        <Link className="btn btn-ghost travel-btn-block" to="/travel/region">
          改地区分级
        </Link>
        <button
          type="button"
          className="btn btn-ghost travel-btn-block"
          onClick={() => {
            saveTravelPrefs(prefs)
          }}
        >
          保存当前条件
        </button>
      </div>
    </main>
  )
}
