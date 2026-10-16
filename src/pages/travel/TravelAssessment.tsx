import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getDestinationById } from '../../lib/travelMatch'
import { PlatformDisclaimer } from '../../components/travel/PlatformDisclaimer'
import { DESTINATIONS } from '../../data/destinations'
import {
  assessmentPreviewLines,
  buildAssessmentReport,
  type AssessmentInput,
} from '../../lib/buildAssessmentReport'
import {
  assessmentPriceLabel,
  hasAssessmentUnlock,
  markAssessmentUnlock,
} from '../../lib/assessmentPaywall'
import { refundPolicyLines } from '../../platform/refundRules'
import { BUDGET_LABELS, type BudgetLevel } from '../../lib/travelTypes'

const BUDGETS = Object.keys(BUDGET_LABELS) as BudgetLevel[]

export function TravelAssessment() {
  const [search] = useSearchParams()
  const [destinationIds, setDestinationIds] = useState<string[]>(['singapore'])

  useEffect(() => {
    const d = search.get('dest')
    if (d && getDestinationById(d)) setDestinationIds([d])
  }, [search])
  const [travelers, setTravelers] = useState(2)
  const [budget, setBudget] = useState<AssessmentInput['budget']>('mid')
  const [pace, setPace] = useState<AssessmentInput['pace']>('balanced')
  const [notes, setNotes] = useState('')
  const [unlocked, setUnlocked] = useState(false)

  const input: AssessmentInput = useMemo(
    () => ({ destinationIds, travelers, budget, pace, notes }),
    [destinationIds, travelers, budget, pace, notes],
  )

  const report = useMemo(() => buildAssessmentReport(input), [input])
  const paid = unlocked || hasAssessmentUnlock(input)
  const lines = paid ? report.lines : assessmentPreviewLines(report)

  const sortedDests = useMemo(
    () => [...DESTINATIONS].sort((a, b) => a.name.localeCompare(b.name, 'zh')),
    [],
  )

  function toggleDest(id: string) {
    setDestinationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function simulatePay() {
    markAssessmentUnlock(input)
    setUnlocked(true)
  }

  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">目的地适配测评</h1>
        <p className="travel-lead">
          V1 付费项 · {assessmentPriceLabel()}：适配分、是否适合、风险与出行建议（中国护照视角）。
          下方先<strong>免费预览摘要</strong>，完整报告付费解锁。
        </p>
        <Link className="travel-foot-link" to="/travel/pricing">
          查看全部定价
        </Link>
      </section>

      <section className="travel-card travel-form">
        <h2 className="travel-h2">你的计划</h2>
        <div className="field">
          <span className="field-label">目的地（可多选）</span>
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
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="assess-n">
            人数
          </label>
          <input
            id="assess-n"
            type="number"
            min={1}
            max={20}
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value) || 1)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="assess-budget">
            预算
          </label>
          <select
            id="assess-budget"
            value={budget}
            onChange={(e) =>
              setBudget(e.target.value as AssessmentInput['budget'])
            }
          >
            <option value="any">不限</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {BUDGET_LABELS[b]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="field-label">节奏</span>
          <div className="travel-chips">
            {(
              [
                ['relaxed', '慢'],
                ['balanced', '均衡'],
                ['packed', '紧凑'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={pace === id ? 'travel-chip is-on' : 'travel-chip'}
                onClick={() => setPace(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="assess-notes">
            特殊要求
          </label>
          <textarea
            id="assess-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="如：带老人、怕热、不去购物店…"
          />
        </div>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">报告预览</h2>
        {!paid && (
          <p className="travel-warn">
            免费可见前几段；完整分项与建议需 {assessmentPriceLabel()} 解锁。
          </p>
        )}
        <article className="travel-assessment-body">
          {lines.map((line, i) => (
            <p key={`${i}-${line.slice(0, 12)}`} className="travel-guide-line">
              {line}
            </p>
          ))}
          {!paid && (
            <p className="travel-paywall-fade">… 完整报告已隐藏</p>
          )}
        </article>
        {!paid ? (
          <button
            type="button"
            className="btn btn-primary travel-btn-block"
            onClick={simulatePay}
          >
            模拟支付 {assessmentPriceLabel()} 解锁全文
          </button>
        ) : (
          <p className="travel-meta">已解锁 · 可截图或后续接 Word/PDF 导出</p>
        )}
        <ul className="travel-bullets travel-meta">
          {refundPolicyLines().map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <PlatformDisclaimer variant="full" />
      </section>
    </main>
  )
}
