import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SpinWheel } from '../../components/travel/SpinWheel'
import { geoPathLabels, levelTitle, nextGeoLevel } from '../../data/travelGeo'
import {
  applyGeoPick,
  formatGeoBreadcrumb,
  geoChildrenWithDestinations,
  pickRandomDestinations,
  scopeFromGeo,
} from '../../lib/travelGeoMatch'
import { filterDestinations } from '../../lib/travelMatch'
import {
  EMPTY_GEO_PATH,
  type TravelGeoPath,
} from '../../lib/travelTypes'
import { loadTravelPrefs, saveTravelPrefs } from '../../lib/travelStorage'

type PickMode = 'manual' | 'wheel'

function parentIdForLevel(path: TravelGeoPath, level: 1 | 2 | 3 | 4): string | null {
  if (level === 1) return null
  if (level === 2) return path.l1
  if (level === 3) return path.l2
  return path.l3
}

export function TravelRegion() {
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState(() => loadTravelPrefs())
  const [path, setPath] = useState<TravelGeoPath>(() => ({
    ...prefs.geo,
  }))
  const [mode, setMode] = useState<PickMode>('manual')

  const level = nextGeoLevel(path)
  const pool = useMemo(
    () => filterDestinations({ ...prefs, geo: path }),
    [prefs, path],
  )

  const activeLevel = level
  const parentId =
    activeLevel != null ? parentIdForLevel(path, activeLevel) : null
  const options = useMemo(() => {
    if (activeLevel == null) return []
    return geoChildrenWithDestinations(parentId, prefs, path)
  }, [activeLevel, parentId, prefs, path])

  function commitPath(next: TravelGeoPath) {
    setPath(next)
    const scope = scopeFromGeo(next)
    setPrefs((p) => ({
      ...p,
      geo: next,
      scope: next.l1 ? scope : p.scope,
    }))
  }

  function selectNode(levelN: 1 | 2 | 3 | 4, id: string) {
    commitPath(applyGeoPick(path, levelN, id))
  }

  function resetGeo() {
    commitPath({ ...EMPTY_GEO_PATH })
  }

  function saveAndGoPicks() {
    const merged = { ...prefs, geo: path }
    saveTravelPrefs(merged)
    navigate('/travel/picks')
  }

  function spinThreeNow() {
    const merged = { ...prefs, geo: path }
    saveTravelPrefs(merged)
    const picks = pickRandomDestinations(filterDestinations(merged), 3)
    navigate('/travel/picks', { state: { picks: picks.map((p) => p.id) } })
  }

  const breadcrumb = formatGeoBreadcrumb(path)
  const labels = geoPathLabels(path)

  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">选地区</h1>
        <p className="travel-lead">
          一级国内/国外 → 二级大洲或国内大区 → 三级子区域 →
          <strong> 四级国家</strong>（国内统一为中国）。选完再帮你
          <strong> 抽 3 个</strong> 具体目的地。
        </p>

        <div className="travel-segment travel-segment-2">
          <button
            type="button"
            className={mode === 'manual' ? 'is-on' : ''}
            onClick={() => setMode('manual')}
          >
            手动点选
          </button>
          <button
            type="button"
            className={mode === 'wheel' ? 'is-on' : ''}
            onClick={() => setMode('wheel')}
          >
            每层转盘
          </button>
        </div>

        {breadcrumb ? (
          <p className="travel-geo-crumb" aria-live="polite">
            已选：{breadcrumb}
          </p>
        ) : (
          <p className="travel-meta">尚未选择地区</p>
        )}

        {labels.length > 0 && (
          <ol className="travel-geo-steps">
            {labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ol>
        )}
      </section>

      {level != null && mode === 'manual' && (
        <section className="travel-card">
          <h2 className="travel-h2">{levelTitle(level)}</h2>
          <div className="travel-chips">
            {options.map((node) => (
              <button
                key={node.id}
                type="button"
                className="travel-chip"
                onClick={() => selectNode(level, node.id)}
              >
                {node.label}
              </button>
            ))}
          </div>
          {options.length === 0 && (
            <p className="travel-warn">这一层没有匹配的目的地，请返回上一级或改偏好。</p>
          )}
        </section>
      )}

      {mode === 'wheel' && level != null && (
        <section className="travel-card">
          <h2 className="travel-h2">{levelTitle(level)}</h2>
          <p className="travel-meta">转出哪块，就进入下一层。</p>
          <SpinWheel
            segments={options.map((n) => ({ id: n.id, label: n.label }))}
            onLand={(id) => selectNode(level, id)}
          />
        </section>
      )}

      <section className="travel-card">
        <p className="travel-match-line">
          当前条件下共 <strong>{pool.length}</strong> 个城市/目的地
        </p>
        <div className="travel-actions">
          <button
            type="button"
            className="btn btn-primary travel-btn-block"
            onClick={spinThreeNow}
            disabled={pool.length === 0}
          >
            帮我抽 3 个目的地
          </button>
          <button
            type="button"
            className="btn btn-ghost travel-btn-block"
            onClick={saveAndGoPicks}
            disabled={pool.length === 0}
          >
            去结果页（可再转）
          </button>
          <button
            type="button"
            className="btn btn-ghost travel-btn-block"
            onClick={resetGeo}
          >
            清空地区重选
          </button>
          <Link className="travel-foot-link" to="/travel/prefs">
            调整预算 / 玩法偏好
          </Link>
        </div>
      </section>

      {level === null && (
        <section className="travel-card travel-geo-done">
          <h2 className="travel-h2">已选到国家</h2>
          <p className="travel-lead">
            {breadcrumb} — 下面可以从 {pool.length} 个候选里一次抽 3 个。
          </p>
        </section>
      )}
    </main>
  )
}
