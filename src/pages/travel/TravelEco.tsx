import { ECO_PRODUCTS, THEME_SEASONS } from '../../data/platformContentSeed'
import { PLATFORM_FEES } from '../../platform/manifest'

export function TravelEco() {
  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">助农 · 非遗 · 主题季</h1>
        <p className="travel-lead">
          助农永久税后 {PLATFORM_FEES.agricultureAfterTaxRate * 100}% 服务费（95% 给农户）·
          非遗抽成 {PLATFORM_FEES.heritageCraftMinRate * 100}–
          {PLATFORM_FEES.heritageCraftMaxRate * 100}%
        </p>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">主题季</h2>
        <ul className="travel-bullets">
          {THEME_SEASONS.map((t) => (
            <li key={t.id}>
              <strong>{t.title}</strong> — {t.desc}
            </li>
          ))}
        </ul>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">商品（演示）</h2>
        <ul className="travel-member-list">
          {ECO_PRODUCTS.map((p) => (
            <li key={p.id} className="travel-member-card">
              <div>
                <strong>{p.name}</strong>
                <p className="travel-meta">¥{p.priceCny}</p>
                {p.type === 'agriculture' && (
                  <p className="travel-meta">
                    农户得 {(p.farmerShare! * 100).toFixed(0)}% · 平台{' '}
                    {(p.platformRate! * 100).toFixed(0)}%
                  </p>
                )}
                {p.type === 'heritage' && (
                  <p className="travel-meta">
                    平台抽成 {(p.platformRateMin! * 100).toFixed(0)}–
                    {(p.platformRateMax! * 100).toFixed(0)}%
                  </p>
                )}
                <button type="button" className="btn btn-primary">
                  模拟下单
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
