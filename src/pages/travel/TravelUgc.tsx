import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UgcWatermark } from '../../components/travel/UgcWatermark'
import { PlatformDisclaimer } from '../../components/travel/PlatformDisclaimer'
import { PLATFORM_FEES } from '../../platform/manifest'
import { loadCommunityProfile } from '../../lib/travelCommunityStorage'
import {
  listUgcGuides,
  platformCut,
  publishUgcGuide,
  purchasedIds,
  simulatePurchase,
  simulateTip,
} from '../../lib/ugcStorage'
import type { UgcPublishMode } from '../../lib/ugcTypes'

export function TravelUgc() {
  const [tab, setTab] = useState<'market' | 'create' | 'mine'>('market')
  const [tick, setTick] = useState(0)
  const profile = loadCommunityProfile()
  const bought = useMemo(() => new Set(purchasedIds()), [tick])
  const listings = useMemo(() => listUgcGuides(), [tick])

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [dest, setDest] = useState('')
  const [mode, setMode] = useState<UgcPublishMode>('free_tip')
  const [price, setPrice] = useState(9.9)

  function refresh() {
    setTick((t) => t + 1)
  }

  function submit() {
    if (!title.trim() || !body.trim()) return
    publishUgcGuide({
      title,
      body,
      destinationLabel: dest,
      mode,
      priceCny: price,
    })
    setTitle('')
    setBody('')
    setTab('market')
    refresh()
  }

  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">攻略创作 & 交易</h1>
        <p className="travel-lead">
          模式 A：免费公开 + 打赏（平台抽 {PLATFORM_FEES.ugcTipRate * 100}%）·
          模式 B：付费售卖（抽 {PLATFORM_FEES.ugcPaidGuideRate * 100}%）·
          <strong> 强制水印 + 作者署名</strong>
        </p>
      </section>

      <nav className="travel-community-tabs">
        {(
          [
            ['market', '市集'],
            ['create', '上架'],
            ['mine', '我的库'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'travel-community-tab is-on' : 'travel-community-tab'}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'market' && (
        <section className="travel-card">
          <ul className="travel-feed-list">
            {listings.map((g) => {
              const owned = bought.has(g.id) || g.mode === 'free_tip'
              const showFull = owned
              return (
                <li key={g.id} className="travel-feed-item travel-ugc-item">
                  <div className="travel-feed-head">
                    <strong>{g.title}</strong>
                    <span className="travel-meta">
                      {g.authorName} · {g.destinationLabel}
                    </span>
                  </div>
                  <div className="travel-ugc-preview-wrap">
                    {showFull ? (
                      <p className="travel-feed-body">{g.bodyFull}</p>
                    ) : (
                      <p className="travel-feed-body">{g.bodyPreview}</p>
                    )}
                    {showFull && g.mode === 'paid' && (
                      <UgcWatermark buyerName={profile.displayName} authorName={g.authorName} />
                    )}
                  </div>
                  <p className="travel-meta">
                    {g.mode === 'paid'
                      ? `¥${g.priceCny} · 已售 ${g.sales}`
                      : `打赏累计 ¥${g.tipsCny}`}
                  </p>
                  <div className="travel-actions">
                    {g.mode === 'paid' && !bought.has(g.id) && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          simulatePurchase(g.id)
                          refresh()
                        }}
                      >
                        模拟购买 ¥{g.priceCny}（平台抽{' '}
                        {platformCut('paid', g.priceCny)}）
                      </button>
                    )}
                    {g.mode === 'free_tip' && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          simulateTip(g.id, 5)
                          refresh()
                        }}
                      >
                        打赏 ¥5（平台抽 {platformCut('free_tip', 5)}）
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {tab === 'create' && (
        <section className="travel-card travel-form">
          <h2 className="travel-h2">上架攻略</h2>
          <div className="field">
            <span className="field-label">发布模式</span>
            <div className="travel-chips">
              <button
                type="button"
                className={mode === 'free_tip' ? 'travel-chip is-on' : 'travel-chip'}
                onClick={() => setMode('free_tip')}
              >
                A · 免费+打赏
              </button>
              <button
                type="button"
                className={mode === 'paid' ? 'travel-chip is-on' : 'travel-chip'}
                onClick={() => setMode('paid')}
              >
                B · 付费 ¥1–99
              </button>
            </div>
          </div>
          {mode === 'paid' && (
            <div className="field">
              <label className="field-label" htmlFor="ugc-price">
                定价（元）
              </label>
              <input
                id="ugc-price"
                type="number"
                min={1}
                max={99}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
          )}
          <div className="field">
            <label className="field-label" htmlFor="ugc-title">
              标题
            </label>
            <input id="ugc-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ugc-dest">
              目的地
            </label>
            <input id="ugc-dest" value={dest} onChange={(e) => setDest(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ugc-body">
              正文（Word/游记摘要）
            </label>
            <textarea
              id="ugc-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary travel-btn-block" onClick={submit}>
            发布（自动加水印策略）
          </button>
        </section>
      )}

      {tab === 'mine' && (
        <section className="travel-card">
          <h2 className="travel-h2">已购 / 已生成</h2>
          <p className="travel-meta">购买记录 ID：{purchasedIds().join(', ') || '暂无'}</p>
          <Link className="btn btn-ghost travel-btn-block" to="/travel/custom">
            我生成的 Word 行程
          </Link>
        </section>
      )}

      <section className="travel-card">
        <PlatformDisclaimer variant="full" />
        <p className="travel-meta">归属作者 · 平台拥有展示使用权 · 禁止无资质接单</p>
      </section>
    </main>
  )
}
