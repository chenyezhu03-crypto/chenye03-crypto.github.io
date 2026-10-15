import { useEffect, useMemo, useState } from 'react'
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
import { buildCustomTripGuide } from '../../lib/customTripGuide'
import {
  CUSTOM_BRIEF_STORAGE_KEY,
  type CustomTripBrief,
} from '../../lib/customTripTypes'
import { getDestinationById } from '../../lib/travelMatch'
import type { TravelGuideDoc } from '../../lib/travelGuideTypes'

export function TravelGuide() {
  const { guideId } = useParams()
  const [search] = useSearchParams()
  const destId = search.get('dest')
  const [doc, setDoc] = useState<TravelGuideDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      if (guideId === 'custom') {
        try {
          const raw = sessionStorage.getItem(CUSTOM_BRIEF_STORAGE_KEY)
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<CustomTripBrief>
            const brief: CustomTripBrief = {
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
            const built = await buildCustomTripGuide(brief)
            if (!cancelled) setDoc(built)
          } else if (!cancelled) setDoc(null)
        } catch {
          if (!cancelled) setDoc(null)
        }
      } else if (guideId && guideId !== 'auto') {
        const loaded = await loadGuideDocument(guideId)
        if (!cancelled) setDoc(loaded)
      } else if (destId) {
        const dest = getDestinationById(destId)
        const catalog = dest ? guidesForDestination(dest.id)[0] : undefined
        if (catalog) {
          const loaded = await loadGuideDocument(catalog.id)
          if (!cancelled) setDoc(loaded)
        } else if (dest) {
          if (!cancelled)
            setDoc(buildGenericGuide(dest, 4, 5))
        }
      }
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [guideId, destId])

  const sections = useMemo(
    () => (doc ? buildGuideSections(doc) : []),
    [doc],
  )

  const catalogEntry = guideId ? getGuideCatalogEntry(guideId) : undefined

  async function exportWord() {
    if (!doc) return
    setExporting(true)
    try {
      await downloadGuideDocx(doc)
    } finally {
      setExporting(false)
    }
  }

  function exportPdf() {
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
      <section className="travel-card travel-guide-toolbar no-print">
        <h1 className="travel-h1">{doc.title}</h1>
        <p className="travel-lead">
          {doc.dateRange ? `${doc.dateRange} · ` : ''}
          {doc.subtitle ?? `${doc.nights} 晚 ${doc.days} 天`}
          {guideId === 'custom'
            ? ' · 客户定制'
            : catalogEntry
              ? ' · 完整图文版'
              : ' · 简版（可换完整稿）'}
        </p>
        {guideId === 'custom' && (
          <Link className="travel-foot-link" to="/travel/custom">
            修改日期 / 目的地 / 预算
          </Link>
        )}
        <div className="travel-actions">
          <button
            type="button"
            className="btn btn-primary travel-btn-block"
            onClick={exportWord}
            disabled={exporting}
          >
            {exporting ? '正在生成 Word…' : '下载 Word（.docx）'}
          </button>
          <button
            type="button"
            className="btn btn-ghost travel-btn-block"
            onClick={exportPdf}
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
          const kind = classifyGuideLine(line)
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
      </article>
    </main>
  )
}
