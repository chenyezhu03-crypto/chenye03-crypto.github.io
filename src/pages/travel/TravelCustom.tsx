import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getDestinationById } from '../../lib/travelMatch'
import { saveTravelPlanMode } from '../../lib/travelPlanMode'
import { DESTINATIONS } from '../../data/destinations'
import { buildCustomTripGuide } from '../../lib/customTripGuide'
import {
  formatGuidePrice,
  GUIDE_PACKAGES,
  GUIDE_PRICE_ASSESSMENT_CNY,
  GUIDE_PRICE_WORD_CNY,
  quotePrice,
  TEMPLATE_MODULES,
  type GuidePackageId,
  type TemplateModuleId,
} from '../../lib/guideTemplateCatalog'
import {
  hasPaidUnlock,
  markPaidUnlock,
  unlockPriceLabel,
} from '../../lib/guidePaywall'
import {
  CUSTOM_BRIEF_STORAGE_KEY,
  formatDateRange,
  tripNightsAndDays,
  type CustomTripBrief,
} from '../../lib/customTripTypes'
import { BUDGET_LABELS, type BudgetLevel } from '../../lib/travelTypes'
import { downloadGuideDocx } from '../../lib/buildGuideDocx'

const BUDGETS = Object.keys(BUDGET_LABELS) as BudgetLevel[]

function defaultEnd(start: string): string {
  const d = new Date(`${start}T12:00:00`)
  d.setDate(d.getDate() + 5)
  return d.toISOString().slice(0, 10)
}

export function TravelCustom() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [endDate, setEndDate] = useState(() =>
    defaultEnd(new Date().toISOString().slice(0, 10)),
  )
  const [destinationIds, setDestinationIds] = useState<string[]>(['singapore'])
  const [customPlaceInput, setCustomPlaceInput] = useState('')
  const [customPlaces, setCustomPlaces] = useState<string[]>([])
  const [budget, setBudget] = useState<CustomTripBrief['budget']>('mid')
  const [notes, setNotes] = useState('')
  const [clientLabel, setClientLabel] = useState('')
  const [packageId, setPackageId] = useState<GuidePackageId>('preview')
  const [customModules, setCustomModules] = useState<TemplateModuleId[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    saveTravelPlanMode('has_plan')
  }, [])

  useEffect(() => {
    const pkg = search.get('pkg') as GuidePackageId | null
    if (pkg && GUIDE_PACKAGES.some((p) => p.id === pkg)) {
      setPackageId(pkg)
    }
  }, [search])

  useEffect(() => {
    const one = search.get('dest')
    const many = search.get('dests')
    if (many) {
      const ids = many
        .split(',')
        .map((s) => s.trim())
        .filter((id) => getDestinationById(id))
      if (ids.length) setDestinationIds(ids)
      return
    }
    if (one && getDestinationById(one)) {
      setDestinationIds([one])
    }
  }, [search])

  const { nights, days } = useMemo(
    () => tripNightsAndDays(startDate, endDate),
    [startDate, endDate],
  )

  const sortedDests = useMemo(
    () => [...DESTINATIONS].sort((a, b) => a.name.localeCompare(b.name, 'zh')),
    [],
  )

  const quote = useMemo(
    () => quotePrice(packageId, customModules),
    [packageId, customModules],
  )

  function toggleDest(id: string) {
    setDestinationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function addCustomPlace() {
    const t = customPlaceInput.trim()
    if (!t) return
    setCustomPlaces((p) => (p.includes(t) ? p : [...p, t]))
    setCustomPlaceInput('')
  }

  function buildBrief(): CustomTripBrief {
    return {
      startDate,
      endDate,
      destinationIds,
      customPlaces,
      budget,
      notes,
      clientLabel,
      packageId,
      customModules,
    }
  }

  function toggleModule(id: TemplateModuleId) {
    setPackageId('custom')
    setCustomModules((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function validate(): string | null {
    if (endDate < startDate) return '返程日期不能早于出发日期'
    if (destinationIds.length === 0 && customPlaces.length === 0)
      return '请至少选择一个目的地，或填写想去的地点'
    if (packageId === 'custom' && customModules.length === 0)
      return '自定义组合请至少勾选一个模版模块'
    return null
  }

  async function goPreview() {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError('')
    const brief = buildBrief()
    sessionStorage.setItem(CUSTOM_BRIEF_STORAGE_KEY, JSON.stringify(brief))
    navigate('/travel/guide/custom')
  }

  async function downloadWord(simulatePay = false) {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    const brief = buildBrief()
    const q = quotePrice(brief.packageId, brief.customModules)
    if (q.priceCny > 0 && !hasPaidUnlock(brief)) {
      if (!simulatePay) {
        setError(
          `当前套餐 ${unlockPriceLabel(brief)}，请先预览页模拟支付，或点下方「模拟支付并下载」。`,
        )
        return
      }
      markPaidUnlock(brief)
    }
    setBusy(true)
    setError('')
    try {
      const doc = await buildCustomTripGuide(brief)
      await downloadGuideDocx(doc)
    } catch {
      setError('生成 Word 失败，请稍后重试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="travel-page">
      <section className="travel-card">
        <p className="travel-path-step">第二步 · 已有计划</p>
        <h1 className="travel-h1">做 Word 模版攻略</h1>
        <Link className="travel-foot-link" to="/travel">
          ← 回第一步：是否要用大转盘？
        </Link>
        <p className="travel-lead">
          不必使用大转盘——顾客只要说清日期、去哪、预算即可。
          <strong>免费</strong>：预览 + 出发前标准章节；
          <strong> {formatGuidePrice(GUIDE_PRICE_ASSESSMENT_CNY)}</strong>：适配测评；
          <strong> {formatGuidePrice(GUIDE_PRICE_WORD_CNY)}</strong>：完整 Word（逐日+预算+避坑+行李）。
          <Link className="travel-foot-link" to="/travel/pricing">
            查看定价说明 →
          </Link>
        </p>
        <ul className="travel-bullets travel-vs-ai">
          <li>免费 AI：每次格式不同，要自己排版、核对信息</li>
          <li>本站：同一套目录结构，新加坡可从您的 docx 原稿截取，直接下 Word 给客户</li>
        </ul>
        <p className="travel-foot-link">
          <a href="/templates/singapore-5n6d-template.docx" download>
            下载您的 Word 原版模版（参考）
          </a>
        </p>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">选套餐（按模版章节）</h2>
        <div className="travel-package-grid">
          {GUIDE_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              className={
                packageId === pkg.id
                  ? 'travel-package-card is-on'
                  : 'travel-package-card'
              }
              onClick={() => setPackageId(pkg.id)}
            >
              {pkg.badge && (
                <span className="travel-package-badge">{pkg.badge}</span>
              )}
              <strong>{pkg.label}</strong>
              <span className="travel-package-price">
                {formatGuidePrice(pkg.priceCny)}
              </span>
              <p className="travel-meta">{pkg.desc}</p>
            </button>
          ))}
          <button
            type="button"
            className={
              packageId === 'custom'
                ? 'travel-package-card is-on'
                : 'travel-package-card'
            }
            onClick={() => setPackageId('custom')}
          >
            <strong>自定义组合</strong>
            <span className="travel-package-price">按模块累加</span>
            <p className="travel-meta">自选章节，适合「只要证件+逐日」等需求</p>
          </button>
        </div>

        {(packageId === 'custom' ||
          packageId !== 'premium' && packageId !== 'full') && (
          <div className="travel-module-pick">
            <p className="field-label">
              {packageId === 'custom'
                ? '勾选需要的模版模块'
                : '本套餐已含模块（切到「自定义」可改）'}
            </p>
            <ul className="travel-module-list">
              {TEMPLATE_MODULES.map((m) => {
                const on =
                  packageId === 'custom'
                    ? customModules.includes(m.id)
                    : quote.moduleIds.includes(m.id)
                return (
                  <li key={m.id}>
                    <label className="travel-module-row">
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={packageId !== 'custom'}
                        onChange={() => toggleModule(m.id)}
                      />
                      <span>
                        <strong>{m.label}</strong>
                        <span className="travel-meta">
                          {' '}
                          · {formatGuidePrice(m.priceCny)} · {m.templateRef}
                        </span>
                        <span className="travel-module-desc">{m.desc}</span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <p className="travel-quote-line">
          当前报价：<strong>{formatGuidePrice(quote.priceCny)}</strong>
          <span className="travel-meta">
            {' '}
            · Word 完整稿 {formatGuidePrice(GUIDE_PRICE_WORD_CNY)}
          </span>
        </p>
      </section>

      <section className="travel-card travel-form">
        <div className="field">
          <label className="field-label" htmlFor="client-name">
            客户称呼（可选）
          </label>
          <input
            id="client-name"
            value={clientLabel}
            onChange={(e) => setClientLabel(e.target.value)}
            placeholder="如：王女士一行 3 人"
          />
        </div>

        <div className="field travel-date-row">
          <div>
            <label className="field-label" htmlFor="trip-start">
              出发日期
            </label>
            <input
              id="trip-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="trip-end">
              返程日期
            </label>
            <input
              id="trip-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <p className="travel-meta">
          {formatDateRange(startDate, endDate)} · {nights} 晚 {days} 天
        </p>

        <div className="field">
          <span className="field-label">想去的地方（可多选）</span>
          <div className="travel-chips travel-dest-pick">
            {sortedDests.map((d) => (
              <button
                key={d.id}
                type="button"
                className={
                  destinationIds.includes(d.id)
                    ? 'travel-chip is-on'
                    : 'travel-chip'
                }
                onClick={() => toggleDest(d.id)}
              >
                {d.name}
                <span className="travel-chip-sub">{d.region}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="custom-place">
            列表里没有的地点
          </label>
          <div className="travel-inline-add">
            <input
              id="custom-place"
              value={customPlaceInput}
              onChange={(e) => setCustomPlaceInput(e.target.value)}
              placeholder="如：普吉岛、拉萨周边"
              onKeyDown={(e) => e.key === 'Enter' && addCustomPlace()}
            />
            <button type="button" className="btn btn-ghost" onClick={addCustomPlace}>
              添加
            </button>
          </div>
          {customPlaces.length > 0 && (
            <ul className="travel-custom-place-list">
              {customPlaces.map((p) => (
                <li key={p}>
                  {p}
                  <button
                    type="button"
                    className="travel-chip-remove"
                    onClick={() =>
                      setCustomPlaces((list) => list.filter((x) => x !== p))
                    }
                  >
                    移除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="trip-budget">
            预算
          </label>
          <select
            id="trip-budget"
            value={budget}
            onChange={(e) =>
              setBudget(e.target.value as CustomTripBrief['budget'])
            }
          >
            <option value="any">不限 / 未说明</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {BUDGET_LABELS[b]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="trip-notes">
            客户的其它要求
          </label>
          <textarea
            id="trip-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="如：不想赶路、需要亲子友好、不吃海鲜、希望含环球影城…"
          />
        </div>

        {error && <p className="travel-warn">{error}</p>}

        <div className="travel-actions">
          {quote.priceCny > 0 ? (
            <>
              <button
                type="button"
                className="btn btn-primary travel-btn-block"
                onClick={() => void downloadWord(true)}
                disabled={busy}
              >
                {busy
                  ? '正在生成 Word…'
                  : `模拟支付 ${formatGuidePrice(quote.priceCny)} 并下载 Word`}
              </button>
              <button
                type="button"
                className="btn btn-ghost travel-btn-block"
                onClick={() => void goPreview()}
              >
                先免费预览（付费章节隐藏）
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary travel-btn-block"
                onClick={() => void downloadWord()}
                disabled={busy}
              >
                {busy ? '正在生成 Word…' : '免费下载 Word 攻略'}
              </button>
              <button
                type="button"
                className="btn btn-ghost travel-btn-block"
                onClick={() => void goPreview()}
              >
                先预览再导出
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
