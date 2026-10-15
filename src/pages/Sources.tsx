import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  crawlJobs,
  hydrateJobs,
  lastCrawledAt,
  lastCrawlReports,
  lastJobCount,
} from '../lib/crawl'
import {
  SOURCE_CATALOG,
  loadEnabledSources,
  saveEnabledSources,
  type SourceId,
} from '../lib/sources'

const SAMPLE_JSON = `{
  "jobs": [
    {
      "title": "前端开发（自有抓取）",
      "company": "示例公司",
      "city": "上海",
      "type": "全职",
      "salary": "20-35K",
      "tags": ["React", "TypeScript"],
      "requirementText": "本科及以上，计算机相关专业；3 年以上前端经验；男女不限。",
      "description": "负责业务前端迭代。",
      "applyUrl": "https://example.com/job/1"
    }
  ]
}`

export function Sources() {
  const [enabled, setEnabled] = useState<SourceId[]>(() => loadEnabledSources())
  const [jsonText, setJsonText] = useState(SAMPLE_JSON)
  const [busy, setBusy] = useState(false)
  const [reports, setReports] = useState<string[]>(() => lastCrawlReports())
  const [crawledAt, setCrawledAt] = useState(() => lastCrawledAt())
  const [count, setCount] = useState(() => lastJobCount())
  const [error, setError] = useState('')

  useEffect(() => {
    void hydrateJobs().then((jobs) => {
      setCount(jobs.length)
      setCrawledAt(lastCrawledAt())
      setReports(lastCrawlReports())
    })
  }, [])

  const labels = useMemo(
    () => Object.fromEntries(SOURCE_CATALOG.map((s) => [s.id, s.name])),
    [],
  )

  function toggle(id: SourceId) {
    setEnabled((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
      saveEnabledSources(next)
      return next
    })
  }

  async function runCrawl(replace: boolean, override?: SourceId[]) {
    setBusy(true)
    setError('')
    try {
      const nextEnabled = override ?? enabled
      if (override) {
        setEnabled(override)
        saveEnabledSources(override)
      } else {
        saveEnabledSources(enabled)
      }
      const result = await crawlJobs({
        enabled: nextEnabled,
        importedJson: nextEnabled.includes('json-import')
          ? jsonText
          : undefined,
        replace,
      })
      setReports(result.reports)
      setCrawledAt(result.crawledAt)
      setCount(result.jobs.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : '汇聚失败')
    } finally {
      setBusy(false)
    }
  }

  async function oneClickCrawl() {
    await runCrawl(true, ['crawled-bundle', 'local-demo'])
  }

  return (
    <main className="page">
      <header className="page-header row">
        <div>
          <h1>数据源</h1>
          <p className="section-lead">
            只汇聚中国岗位：腾讯/字节/阿里/蚂蚁/百度/美团/网易/滴滴/米哈游/顺丰/讯飞/携程/OPPO/vivo/B站/爱奇艺，以及小米、蔚来、理想、小鹏等飞书官招。也可导入你自己的国内爬虫 JSON。
          </p>
          <p className="meta-line">
            库存 {count} 条 · 上次汇聚{' '}
            {crawledAt
              ? new Date(crawledAt).toLocaleString('zh-CN')
              : '尚未汇聚'}
          </p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => void oneClickCrawl()}
          >
            {busy ? '正在爬取…' : '一键爬取并导入'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy || enabled.length === 0}
            onClick={() => void runCrawl(false)}
          >
            按勾选增量
          </button>
        </div>
      </header>

      <ul className="source-list">
        {SOURCE_CATALOG.map((source) => (
          <li key={source.id} className="source-row">
            <label className="check-line">
              <input
                type="checkbox"
                checked={enabled.includes(source.id)}
                onChange={() => toggle(source.id)}
              />
              <span>
                <strong>
                  {source.name}
                  <em className="source-kind">{source.kind}</em>
                </strong>
                <small>{source.description}</small>
              </span>
            </label>
          </li>
        ))}
      </ul>

      {enabled.includes('json-import') ? (
        <label className="field full json-box">
          <span>导入 JSON（可替换为你的爬虫输出）</span>
          <textarea
            rows={12}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
        </label>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      {reports.length ? (
        <section className="report-box">
          <h2>汇聚报告</h2>
          <ul>
            {reports.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="fine-print">
            已启用：{enabled.map((id) => labels[id]).join('、') || '无'}。去{' '}
            <Link to="/jobs">岗位雷达</Link> 查看，或打开{' '}
            <Link to="/batch">批量投递</Link>。
          </p>
        </section>
      ) : null}
    </main>
  )
}
