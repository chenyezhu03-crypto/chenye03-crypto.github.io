import { LICENSED_GUIDES } from '../../data/platformContentSeed'
import { PlatformDisclaimer } from '../../components/travel/PlatformDisclaimer'

export function TravelGuideMarket() {
  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">持证地陪撮合</h1>
        <p className="travel-lead">
          仅对接海外<strong>当地官方执照</strong>中文导游 · 平台托管资金 · 仲裁 ·
          <strong> 只做撮合，不做旅行社业务</strong>
        </p>
      </section>

      <section className="travel-card">
        <ul className="travel-member-list">
          {LICENSED_GUIDES.map((g) => (
            <li key={g.id} className="travel-member-card">
              <div>
                <strong>{g.name}</strong>
                <p className="travel-meta">
                  {g.city} · 执照 {g.licenseNo} · 从 ¥{g.priceFromCny}/天
                </p>
                <button type="button" className="btn btn-primary" disabled={!g.verified}>
                  预约（演示）
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="travel-warn">社区禁止无资质旅游接单 — 见平台绝对规则</p>
        <PlatformDisclaimer variant="full" />
      </section>
    </main>
  )
}
