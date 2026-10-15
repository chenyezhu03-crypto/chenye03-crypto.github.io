import { Link, useNavigate, useParams } from 'react-router-dom'
import { BUDGET_LABELS, MONTH_LABELS, VIBE_LABELS } from '../../lib/travelTypes'
import { getDestinationById } from '../../lib/travelMatch'

export function TravelPlace() {
  const { id } = useParams()
  const navigate = useNavigate()
  const place = id ? getDestinationById(id) : undefined

  if (!place) {
    return (
      <main className="travel-page">
        <section className="travel-card travel-empty">
          <p>找不到这个目的地。</p>
          <Link className="btn btn-primary" to="/travel/spin">
            回转盘
          </Link>
        </section>
      </main>
    )
  }

  const months = place.bestMonths.map((m) => MONTH_LABELS[m - 1]).join('、')
  const budgets = place.budget.map((b) => BUDGET_LABELS[b].split('（')[0]).join(' / ')
  const vibes = place.vibes.map((v) => VIBE_LABELS[v]).join(' · ')

  return (
    <main className="travel-page travel-place-page">
      <section className="travel-card travel-place-hero">
        <p className="travel-place-region">{place.region}</p>
        <h1>{place.name}</h1>
        <p className="travel-place-tagline">{place.tagline}</p>
        <ul className="travel-tags">
          <li>{place.scope === 'domestic' ? '国内' : '出境'}</li>
          <li>
            建议 {place.daysIdeal[0]}–{place.daysIdeal[1]} 天
          </li>
        </ul>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">为什么值得去</h2>
        <ul className="travel-bullets">
          {place.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">实用信息</h2>
        <dl className="travel-dl">
          <div>
            <dt>较佳月份</dt>
            <dd>{months}</dd>
          </div>
          <div>
            <dt>预算档位</dt>
            <dd>{budgets}</dd>
          </div>
          <div>
            <dt>玩法</dt>
            <dd>{vibes}</dd>
          </div>
        </dl>
        <p className="travel-tip">
          <strong>小贴士：</strong>
          {place.tips}
        </p>
      </section>

      <div className="travel-actions travel-place-actions">
        <button
          type="button"
          className="btn btn-primary travel-btn-block"
          onClick={() => navigate('/travel/spin')}
        >
          不满意，再转一次
        </button>
        <Link className="btn btn-ghost travel-btn-block" to="/travel/prefs">
          改偏好
        </Link>
        <Link className="travel-foot-link" to="/travel">
          回首页
        </Link>
      </div>
    </main>
  )
}
