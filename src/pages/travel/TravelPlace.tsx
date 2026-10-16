import { Link, useNavigate, useParams } from 'react-router-dom'
import { travelCustomPath } from '../../lib/travelCustomLink'
import { BUDGET_LABELS, MONTH_LABELS, VIBE_LABELS } from '../../lib/travelTypes'
import { guidesForDestination } from '../../lib/travelGuideCatalog'
import { getDestinationGeo } from '../../data/destinationGeo'
import { getGeoNode } from '../../data/travelGeo'
import { getDestinationById } from '../../lib/travelMatch'
import {
  difficultyLabel,
  getDestinationKnowledge,
} from '../../lib/destinationKnowledge'

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

  const guideList = guidesForDestination(place.id)
  const geo = getDestinationGeo(place.id)
  const geoLine = geo
    ? [
        getGeoNode(geo.zoneId)?.label,
        getGeoNode(geo.subRegionId)?.label,
        getGeoNode(geo.countryId)?.label,
      ]
        .filter(Boolean)
        .join(' › ')
    : ''

  const months = place.bestMonths.map((m) => MONTH_LABELS[m - 1]).join('、')
  const budgets = place.budget.map((b) => BUDGET_LABELS[b].split('（')[0]).join(' / ')
  const vibes = place.vibes.map((v) => VIBE_LABELS[v]).join(' · ')
  const knowledge = getDestinationKnowledge(place.id)

  return (
    <main className="travel-page travel-place-page">
      <section className="travel-card travel-place-hero">
        <p className="travel-place-region">
          {geoLine || place.region}
        </p>
        <h1>{place.name}</h1>
        <p className="travel-place-tagline">{place.tagline}</p>
        <ul className="travel-tags">
          <li>{place.scope === 'domestic' ? '国内' : '出境'}</li>
          <li>
            建议 {place.daysIdeal[0]}–{place.daysIdeal[1]} 天
          </li>
          {knowledge && (
            <>
              <li>难度 {difficultyLabel(knowledge.difficultyLevel)}</li>
              <li>{knowledge.budgetRangeCny}</li>
            </>
          )}
        </ul>
      </section>

      {knowledge && (
        <section className="travel-card">
          <h2 className="travel-h2">中国护照视角 · 知识库</h2>
          <p className="travel-meta">{knowledge.updatedNote}</p>
          <dl className="travel-dl">
            <div>
              <dt>签证/证件</dt>
              <dd>{knowledge.visaForMainland}</dd>
            </div>
            <div>
              <dt>入境要求</dt>
              <dd>{knowledge.entryRequirements}</dd>
            </div>
            <div>
              <dt>禁忌与安全</dt>
              <dd>{knowledge.taboosAndSafety}</dd>
            </div>
            <div>
              <dt>货币物价</dt>
              <dd>{knowledge.currencyAndPrices}</dd>
            </div>
            <div>
              <dt>最佳季节</dt>
              <dd>{knowledge.bestSeason}</dd>
            </div>
            <div>
              <dt>热门打卡</dt>
              <dd>{knowledge.hotspots.join('、')}</dd>
            </div>
            <div>
              <dt>当地美食</dt>
              <dd>{knowledge.localFood.join('、')}</dd>
            </div>
            <div>
              <dt>节日文化</dt>
              <dd>{knowledge.festivalsAndCulture}</dd>
            </div>
            <div>
              <dt>避坑</dt>
              <dd>{knowledge.pitfalls}</dd>
            </div>
          </dl>
          <Link
            className="btn btn-ghost travel-btn-block"
            to={`/travel/assessment?dest=${place.id}`}
          >
            ¥5.99 适配测评（可先预览）
          </Link>
        </section>
      )}

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
        <Link
          className="btn btn-primary travel-btn-block"
          to={travelCustomPath({ dest: place.id })}
        >
          做 Word 攻略（填日期 · 第二步）
        </Link>
        {guideList.length > 0 ? (
          <Link
            className="btn btn-ghost travel-btn-block"
            to={`/travel/guide/${guideList[0].id}`}
          >
            快速预览完整模版
          </Link>
        ) : (
          <Link
            className="btn btn-ghost travel-btn-block"
            to={`/travel/guide/auto?dest=${place.id}`}
          >
            快速预览简版
          </Link>
        )}
        <button
          type="button"
          className="btn btn-ghost travel-btn-block"
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
