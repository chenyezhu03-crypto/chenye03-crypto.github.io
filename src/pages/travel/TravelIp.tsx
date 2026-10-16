import { IP_UNIVERSE } from '../../data/platformContentSeed'

export function TravelIp() {
  return (
    <main className="travel-page">
      <section className="travel-card travel-ip-hero">
        <p className="travel-meta">V6 · 自研 IP</p>
        <h1 className="travel-h1">{IP_UNIVERSE.hero}</h1>
        <p className="travel-lead">{IP_UNIVERSE.tagline}</p>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">IP 家族</h2>
        <div className="travel-status-grid">
          {IP_UNIVERSE.family.map((name) => (
            <div key={name} className="travel-status-chip">
              <span className="travel-status-chip-emoji">✨</span>
              {name}
            </div>
          ))}
        </div>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">全平台资产（规划）</h2>
        <ul className="travel-bullets">
          {IP_UNIVERSE.assets.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="travel-meta">视觉将逐步统一至「环环」体系 · 主题餐厅/线下联名</p>
      </section>
    </main>
  )
}
