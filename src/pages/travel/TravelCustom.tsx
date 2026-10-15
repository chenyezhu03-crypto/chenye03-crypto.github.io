import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DESTINATIONS } from '../../data/destinations'
import { buildCustomTripGuide } from '../../lib/customTripGuide'
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
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const { nights, days } = useMemo(
    () => tripNightsAndDays(startDate, endDate),
    [startDate, endDate],
  )

  const sortedDests = useMemo(
    () => [...DESTINATIONS].sort((a, b) => a.name.localeCompare(b.name, 'zh')),
    [],
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
    }
  }

  function validate(): string | null {
    if (endDate < startDate) return '返程日期不能早于出发日期'
    if (destinationIds.length === 0 && customPlaces.length === 0)
      return '请至少选择一个目的地，或填写想去的地点'
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

  async function downloadWord() {
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setBusy(true)
    setError('')
    try {
      const doc = await buildCustomTripGuide(buildBrief())
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
        <h1 className="travel-h1">按客户信息做攻略</h1>
        <p className="travel-lead">
          填写大概出行日期、想去的地方和预算，系统会生成与「5 晚 6 天完整版」同结构的
          Word，可再打印为 PDF。若只选新加坡，会自动附上完整新加坡正文附录。
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
          <button
            type="button"
            className="btn btn-primary travel-btn-block"
            onClick={() => void downloadWord()}
            disabled={busy}
          >
            {busy ? '正在生成 Word…' : '直接下载 Word 攻略'}
          </button>
          <button
            type="button"
            className="btn btn-ghost travel-btn-block"
            onClick={() => void goPreview()}
          >
            先预览再导出
          </button>
        </div>
      </section>
    </main>
  )
}
