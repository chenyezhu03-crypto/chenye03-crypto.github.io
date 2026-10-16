import { Link } from 'react-router-dom'
import {
  LIVE_FREE_SESSIONS,
  LIVE_PAID_HOSTS,
  MEMBERSHIP_BLURB,
} from '../../data/platformContentSeed'
import { V1_PRICING } from '../../platform/manifest'

export function TravelLive() {
  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">直播 & 连麦定制</h1>
        <p className="travel-lead">
          免费文旅科普 + 付费一对一行程/签证定制。直播间可挂载会员、Word、测评、文创、助农（规划）。
        </p>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">免费直播</h2>
        <ul className="travel-member-list">
          {LIVE_FREE_SESSIONS.map((s) => (
            <li key={s.id} className="travel-member-card">
              <div>
                <strong>{s.title}</strong>
                <p className="travel-meta">
                  {s.host} · {s.startsAt}
                </p>
                <button type="button" className="btn btn-ghost" disabled>
                  开播提醒（接入中）
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">付费连麦定制</h2>
        <ul className="travel-member-list">
          {LIVE_PAID_HOSTS.map((h) => (
            <li key={h.id} className="travel-member-card">
              <div>
                <strong>{h.name}</strong>
                <p className="travel-meta">
                  ¥{h.rateCny}/{h.unit} · {h.tags.join(' · ')}
                </p>
                <button type="button" className="btn btn-primary">
                  模拟预约
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">直播间挂载</h2>
        <ul className="travel-bullets">
          <li>会员 ¥{MEMBERSHIP_BLURB.month}/月 · ¥{MEMBERSHIP_BLURB.year}/年</li>
          <li>Word 攻略 ¥{V1_PRICING.wordExportCny}</li>
          <li>适配测评 ¥{V1_PRICING.assessmentReportCny}</li>
          <Link to="/travel/eco">非遗文创 & 助农商品 →</Link>
        </ul>
      </section>
    </main>
  )
}
