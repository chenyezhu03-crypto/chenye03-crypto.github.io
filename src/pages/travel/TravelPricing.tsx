import { Link } from 'react-router-dom'
import {
  formatGuidePrice,
  GUIDE_PRICE_ASSESSMENT_CNY,
  GUIDE_PRICE_WORD_CNY,
  MEMBERSHIP_YEAR_CNY,
  PRICING_SKUS,
} from '../../lib/guideTemplateCatalog'
import { travelCustomPath } from '../../lib/travelCustomLink'
import { PlatformDisclaimer } from '../../components/travel/PlatformDisclaimer'
import { refundPolicyLines } from '../../platform/refundRules'

export function TravelPricing() {
  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">V1 定价 · 免费 + 单次 + 会员</h1>
        <p className="travel-lead">
          先预览、后付费。免费 AI 对话可写游记，本站卖的是<strong>中国护照视角知识库</strong>
          + 固定 Word 结构 + 测评逻辑。
        </p>
        <Link className="travel-foot-link" to="/travel/roadmap">
          完整开发路线图 →
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
            {sku.id === 'assessment' && (
              <Link className="btn btn-primary travel-btn-block" to="/travel/assessment">
                适配测评 {formatGuidePrice(GUIDE_PRICE_ASSESSMENT_CNY)}
              </Link>
            )}
            {sku.id === 'word' && (
              <Link
                className="btn btn-primary travel-btn-block"
                to={travelCustomPath({ package: 'premium' })}
              >
                Word 攻略 {formatGuidePrice(GUIDE_PRICE_WORD_CNY)}
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
        <h2 className="travel-h2">退款与重生成</h2>
        <ul className="travel-bullets">
          {refundPolicyLines().map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <PlatformDisclaimer variant="full" />
      </section>
    </main>
  )
}
