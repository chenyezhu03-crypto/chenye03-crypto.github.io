import { Link } from 'react-router-dom'
import {
  formatGuidePrice,
  GUIDE_PRICE_BASIC_CNY,
  GUIDE_PRICE_PREMIUM_CNY,
  MEMBERSHIP_YEAR_CNY,
  PRICING_SKUS,
} from '../../lib/guideTemplateCatalog'
import { travelCustomPath } from '../../lib/travelCustomLink'

export function TravelPricing() {
  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">定价 · 免费 + 单次 + 会员</h1>
        <p className="travel-lead">
          转盘与简略预览<strong>永久免费</strong>；完整 Word 实稿与进阶附录按次付费；重度用户可开年卡。
          当前为<strong>演示站</strong>，付费按钮为模拟解锁，接入支付后同一套 SKU 不变。
        </p>
        <Link className="travel-foot-link" to="/travel">
          ← 回第一步
        </Link>
      </section>

      <section className="travel-pricing-grid">
        {PRICING_SKUS.map((sku) => (
          <article key={sku.id} className="travel-pricing-card">
            <h2 className="travel-h2">{sku.title}</h2>
            <p className="travel-pricing-amount">{sku.priceLabel}</p>
            <ul className="travel-bullets">
              {sku.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            {sku.id === 'free' && (
              <Link className="btn btn-ghost travel-btn-block" to="/travel/spin">
                免费抽签
              </Link>
            )}
            {sku.id === 'basic' && (
              <Link
                className="btn btn-primary travel-btn-block"
                to={travelCustomPath({ package: 'full' })}
              >
                选完整版 {formatGuidePrice(GUIDE_PRICE_BASIC_CNY)}
              </Link>
            )}
            {sku.id === 'premium' && (
              <Link
                className="btn btn-primary travel-btn-block"
                to={travelCustomPath({ package: 'premium' })}
              >
                选进阶版 {formatGuidePrice(GUIDE_PRICE_PREMIUM_CNY)}
              </Link>
            )}
            {sku.id === 'member' && (
              <button type="button" className="btn btn-ghost travel-btn-block" disabled>
                年卡 {MEMBERSHIP_YEAR_CNY} 元 · 支付接入中
              </button>
            )}
          </article>
        ))}
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">和免费 AI 的差别</h2>
        <ul className="travel-bullets travel-vs-ai">
          <li>豆包等：对话现写，每次格式不同，需自己排版核对</li>
          <li>
            本站：固定 Word 模版 + 新加坡实稿切片；标准{' '}
            {formatGuidePrice(GUIDE_PRICE_BASIC_CNY)} / 进阶{' '}
            {formatGuidePrice(GUIDE_PRICE_PREMIUM_CNY)}
          </li>
        </ul>
      </section>
    </main>
  )
}
