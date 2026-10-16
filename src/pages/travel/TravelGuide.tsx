import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { downloadGuideDocx } from '../../lib/buildGuideDocx'
import {
  buildGenericGuide,
  getGuideCatalogEntry,
  guidesForDestination,
  loadGuideDocument,
} from '../../lib/travelGuideCatalog'
import {
  buildGuideSections,
  classifyGuideLine,
} from '../../lib/travelGuideFormat'
import { parseWordFieldLine } from '../../lib/guideWordMode'
import { buildCustomTripGuide } from '../../lib/customTripGuide'
import {
  CUSTOM_BRIEF_STORAGE_KEY,
  type CustomTripBrief,
} from '../../lib/customTripTypes'
import { quotePrice } from '../../lib/guideTemplateCatalog'
import {
  hasPaidUnlock,
  markPaidUnlock,
  unlockPriceLabel,
} from '../../lib/guidePaywall'
import { getDestinationById } from '../../lib/travelMatch'
import type { TravelGuideDoc } from '../../lib/travelGuideTypes'

function parseBrief(raw: string | null): CustomTripBrief | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<CustomTripBrief>
    return {
      startDate: parsed.startDate ?? '',
      endDate: parsed.endDate ?? '',
      destinationIds: parsed.destinationIds ?? [],
      customPlaces: parsed.customPlaces ?? [],
      budget: parsed.budget ?? 'any',
      notes: parsed.notes ?? '',
      clientLabel: parsed.clientLabel ?? '',
      packageId: parsed.packageId ?? 'standard',
      customModules: parsed.customModules ?? [],
    }
  } catch {
    return null
  }
}

export function TravelGuide() {
  const { guideId } = useParams()
  const [search] = useSearchParams()
  const destId = search.get('dest')
  const [doc, setDoc] = useState<TravelGuideDoc | null>(null)
  const [brief, setBrief] = useState<CustomTripBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [unlockTick, setUnlockTick] = useState(0)

  const quote = useMemo(
    () =>
      brief
        ? quotePrice(brief.packageId, brief.customModules)
        : { priceCny: 0, moduleIds: [], packageId: 'standard' as const },
    [brief],
  )

  const unlocked = brief ? hasPaidUnlock(brief) : true
  const previewLocked = quote.priceCny > 0 && !unlocked

  const loadCustom = useCallback(async () => {
    const b = parseBrief(sessionStorage.getItem(CUSTOM_BRIEF_STORAGE_KEY))
    setBrief(b)
    if (!b) {
      setDoc(null)
      return
    }
    const built = await buildCustomTripGuide(b, {
      previewOnly: quotePrice(b.packageId, b.customModules).priceCny > 0 && !hasPaidUnlock(b),
    })
    setDoc(built)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      if (guideId === 'custom') {
        try {
          await loadCustom()
        } catch {
          if (!cancelled) setDoc(null)
        }
      } else if (guideId && guideId !== 'auto') {
        setBrief(null)
        const loaded = await loadGuideDocument(guideId)
        if (!cancelled) setDoc(loaded)
      } else if (destId) {
        setBrief(null)
        const dest = getDestinationById(destId)
        const catalog = dest ? guidesForDestination(dest.id)[0] : undefined
        if (catalog) {
          const loaded = await loadGuideDocument(catalog.id)
          if (!cancelled) setDoc(loaded)
        } else if (dest) {
          if (!cancelled) setDoc(buildGenericGuide(dest, 4, 5))
        }
      }
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [guideId, destId, loadCustom, unlockTick])

  const sections = useMemo(
    () => (doc ? buildGuideSections(doc) : []),
    [doc],
  )

  const catalogEntry = guideId ? getGuideCatalogEntry(guideId) : undefined

  async function exportWord() {
    if (!doc) return
    if (brief && quote.priceCny > 0 && !hasPaidUnlock(brief)) {
      return
    }
    setExporting(true)
    try {
      const full =
        brief && quote.priceCny > 0
          ? await buildCustomTripGuide(brief)
          : doc
      await downloadGuideDocx(full)
    } finally {
      setExporting(false)
    }
  }

  function simulatePayAndExport() {
    if (!brief) return
    markPaidUnlock(brief)
    setUnlockTick((t) => t + 1)
  }

  function exportPdf() {
    if (previewLocked) return
    window.print()
  }

  if (loading) {
    return (
      <main className="travel-page">
        <p className="travel-meta">正在加载攻略…</p>
      </main>
    )
  }

  if (!doc) {
    return (
      <main className="travel-page">
        <section className="travel-card travel-empty">
          <p>找不到这份攻略。</p>
          <Link className="btn btn-primary" to="/travel">
            回首页
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="travel-page travel-guide-page">
      {previewLocked && brief && (
        <section className="travel-card travel-paywall-banner no-print">
          <p className="travel-paywall-title">
            免费预览 · 完整内容需支付 {unlockPriceLabel(brief)}
          </p>
          <p className="travel-meta">
            当前仅展示行程总览等免费章节；逐日实稿与进阶附录在付费后解锁 Word / PDF。
          </p>
          <div className="travel-actions">
            <button
              type="button"
              className="btn btn-primary travel-btn-block"
              onClick={simulatePayAndExport}
            >
              模拟支付 {unlockPriceLabel(brief)} 并解锁
            </button>
            <Link className="btn btn-ghost travel-btn-block" to="/travel/pricing">
              查看全部定价
            </Link>
            <Link className="btn btn-ghost travel-btn-block" to="/travel/custom">
              更换套餐
            </Link>
          </div>
        </section>
      )}

      <section className="travel-card travel-guide-toolbar no-print">
        <h1 className="travel-h1">{doc.title}</h1>
        <p className="travel-lead">
          {doc.dateRange ? `${doc.dateRange} · ` : ''}
          {doc.subtitle ?? `${doc.nights} 晚 ${doc.days} 天`}
          {guideId === 'custom'
            ? previewLocked
              ? ' · 免费预览中'
              : ' · 已解锁完整版'
            : catalogEntry
              ? ' · 完整图文版'
              : ' · 简版（可换完整稿）'}
        </p>
        {guideId === 'custom' && (
          <Link className="travel-foot-link" to="/travel/custom">
            修改日期 / 目的地 / 套餐
          </Link>
        )}
        <div className="travel-actions">
          <button
            type="button"
            className="btn btn-primary travel-btn-block"
            onClick={() => void exportWord()}
            disabled={exporting || previewLocked}
          >
            {exporting
              ? '正在生成 Word…'
              : previewLocked
                ? `Word 需先支付 ${brief ? unlockPriceLabel(brief) : ''}`
                : '下载 Word（.docx）'}
          </button>
          <button
            type="button"
            className="btn btn-ghost travel-btn-block"
            onClick={exportPdf}
            disabled={previewLocked}
          >
            打印 / 存为 PDF
          </button>
          {doc.destinationId && (
            <Link
              className="btn btn-ghost travel-btn-block"
              to={`/travel/place/${doc.destinationId}`}
            >
              回目的地详情
            </Link>
          )}
        </div>
      </section>

      <nav className="travel-card travel-guide-toc no-print" aria-label="攻略目录">
        <h2 className="travel-h2">目录（点击跳转）</h2>
        <ol className="travel-guide-toc-list">
          {sections.slice(0, 48).map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.title}</a>
            </li>
          ))}
          {sections.length > 48 && (
            <li className="travel-meta">… 共 {sections.length} 个章节，正文内可搜索 DAY</li>
          )}
        </ol>
      </nav>

      <article className="travel-guide-article">
        {doc.lines.map((line, i) => {
          const prev = doc.lines[i - 1]
          const field = parseWordFieldLine(line)
          if (field) {
            return (
              <p
                key={`${i}-f`}
                className="travel-guide-line travel-guide-field"
              >
                <strong>{field.label}</strong> {field.value}
              </p>
            )
          }
          const kind = classifyGuideLine(line, prev)
          const sec = sections.find((x) => x.lineStart === i)
          const Tag =
            kind === 'title'
              ? 'h1'
              : kind === 'day' || kind === 'section'
                ? 'h2'
                : kind === 'subhead' || kind === 'label'
                  ? 'h3'
                  : 'p'
          return (
            <Tag
              key={`${i}-${line.slice(0, 24)}`}
              id={sec?.id}
              className={`travel-guide-line travel-guide-${kind}`}
            >
              {line}
            </Tag>
          )
        })}
        {previewLocked && (
          <p className="travel-guide-line travel-paywall-fade no-print">
            … 逐日详程与进阶附录已隐藏，支付后可查看并导出 Word。
          </p>
        )}
      </article>
    </main>
  )
}
