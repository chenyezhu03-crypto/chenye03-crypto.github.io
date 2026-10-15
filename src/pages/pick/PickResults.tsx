import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadJobs } from '../../lib/crawl'
import { fetchGuokao2027Jobs } from '../../lib/guokao2027'
import { matchJob } from '../../lib/match'
import { loadProfile } from '../../lib/profile'
import {
  isPickFavorite,
  loadPickFavorites,
  togglePickFavorite,
} from '../../lib/pickStorage'
import type { Job, MatchResult } from '../../lib/types'

type ExamFilter = '国考' | '上海市考'
type JobRow = Job & { match: MatchResult }

const CAP = 80

function haystack(job: Job): string {
  const code = job.guokaoMeta?.positionCode ?? ''
  return `${job.title} ${job.company} ${code} ${job.requirementText} ${job.city}`.toLowerCase()
}

export function PickResults() {
  const profile = useMemo(() => loadProfile(), [])
  const [socialJobs] = useState(() => loadJobs())
  const [guokaoJobs, setGuokaoJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exam, setExam] = useState<ExamFilter>('国考')
  const [query, setQuery] = useState('')
  const [province, setProvince] = useState('全部')
  const [onlyFit, setOnlyFit] = useState(true)
  const [onlyFav, setOnlyFav] = useState(false)
  const [favorites, setFavorites] = useState(() => loadPickFavorites())

  useEffect(() => {
    let cancelled = false
    fetchGuokao2027Jobs()
      .then((rows) => {
        if (!cancelled) setGuokaoJobs(rows)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '职位表加载失败')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const pool = useMemo(() => {
    const sh = socialJobs.filter((j) => j.sourceId === 'shanghai-gwy')
    return exam === '国考' ? guokaoJobs : sh
  }, [exam, guokaoJobs, socialJobs])

  const provinces = useMemo(() => {
    const set = new Set(pool.map((j) => j.city).filter(Boolean))
    return ['全部', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'zh'))]
  }, [pool])

  const { rows, total }: { rows: JobRow[]; total: number } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const favSet = new Set(favorites)
    const filtered = pool.filter((job) => {
      if (onlyFav && !favSet.has(job.id)) return false
      if (province !== '全部' && job.city !== province) return false
      if (q && !haystack(job).includes(q)) return false
      return true
    })
    const scored = filtered
      .map((job) => ({ ...job, match: matchJob(profile, job) }))
      .filter((job) => !onlyFit || job.match.hardPass)
      .sort((a, b) => b.match.score - a.match.score)
    return { rows: scored.slice(0, CAP), total: scored.length }
  }, [pool, profile, query, province, onlyFit, onlyFav, favorites])

  function onToggleFav(jobId: string) {
    setFavorites(togglePickFavorite(jobId))
  }

  return (
    <main className="pick-page">
      <section className="pick-toolbar">
        <div className="pick-segment" role="tablist" aria-label="考试类型">
          {(['国考', '上海市考'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={exam === t}
              className={exam === t ? 'is-on' : ''}
              onClick={() => {
                setExam(t)
                setProvince('全部')
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="field pick-search">
          <span className="sr-only">搜索</span>
          <input
            type="search"
            placeholder="职位、部门、职位代码、专业…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="pick-toolbar-row">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            aria-label="省份"
          >
            {provinces.slice(0, 35).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <label className="pick-check compact">
            <input
              type="checkbox"
              checked={onlyFit}
              onChange={(e) => setOnlyFit(e.target.checked)}
            />
            硬门槛通过
          </label>
          <label className="pick-check compact">
            <input
              type="checkbox"
              checked={onlyFav}
              onChange={(e) => setOnlyFav(e.target.checked)}
            />
            只看收藏
          </label>
        </div>
        <p className="pick-meta">
          {loading && exam === '国考'
            ? '正在加载 2027 国考职位表…'
            : `匹配 ${total.toLocaleString('zh-CN')} 条，展示 ${rows.length} 条`}
          {error ? ` · ${error}` : null}
        </p>
      </section>

      <ul className="pick-job-list">
        {rows.map((job) => {
          const fav = isPickFavorite(job.id) || favorites.includes(job.id)
          return (
            <li key={job.id} className="pick-job-card">
              <div className="pick-job-head">
                <h2>{job.title}</h2>
                <span
                  className={`badge score ${job.match.hardPass ? 'ok' : 'warn'}`}
                >
                  {job.match.score}
                </span>
              </div>
              <p className="pick-job-sub">
                {job.company}
                {job.guokaoMeta?.positionCode
                  ? ` · ${job.guokaoMeta.positionCode}`
                  : null}
              </p>
              <p className="pick-job-loc">
                {job.location} · {job.salary}
              </p>
              <ul className="pick-tags">
                {job.structured.highlights.slice(0, 4).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="pick-job-summary">{job.match.summary}</p>
              <div className="pick-job-actions">
                <button
                  type="button"
                  className={`btn btn-ghost pick-fav ${fav ? 'on' : ''}`}
                  onClick={() => onToggleFav(job.id)}
                >
                  {fav ? '已收藏' : '收藏'}
                </button>
                <Link
                  className="btn btn-primary"
                  to={`/apply?job=${encodeURIComponent(job.id)}`}
                >
                  备忘
                </Link>
              </div>
            </li>
          )
        })}
      </ul>

      {!loading && rows.length === 0 ? (
        <p className="empty pick-empty">
          没有符合条件的岗位。试试关闭「硬门槛通过」、换省份，或到
          <Link to="/pick/profile"> 条件 </Link>
          页补充信息。
        </p>
      ) : null}

      {total > CAP ? (
        <p className="pick-note">
          结果过多，仅展示前 {CAP} 条。请用搜索或省份缩小范围；完整筛选可前往
          <Link to="/jobs"> 岗位雷达 </Link>。
        </p>
      ) : null}
    </main>
  )
}
