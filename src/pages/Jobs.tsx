import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { crawlJobs, lastCrawledAt, loadJobs } from '../lib/crawl'
import {
  clearGuokao2027Cache,
  fetchGuokao2027Jobs,
  guokao2027Loaded,
} from '../lib/guokao2027'
import { matchJob } from '../lib/match'
import { loadProfile } from '../lib/profile'
import { hasApplied } from '../lib/storage'
import type { EducationLevel, GenderPref, Job, MatchResult } from '../lib/types'

type JobWithMatch = Job & { match: MatchResult }

type SourceFilter = '全部' | '企业社招' | '国考' | '上海市考'

const LIST_CAP = 120

function jobSourceBucket(job: Job): SourceFilter {
  if (job.sourceId === 'guokao') return '国考'
  if (job.sourceId === 'shanghai-gwy') return '上海市考'
  return '企业社招'
}

function jobSearchHaystack(job: Job): string {
  const code = job.guokaoMeta?.positionCode ?? ''
  return `${job.title} ${job.company} ${code} ${job.tags.join(' ')} ${job.requirementText} ${job.description}`.toLowerCase()
}

export function Jobs() {
  const profile = useMemo(() => loadProfile(), [])
  const [socialJobs, setSocialJobs] = useState<Job[]>(() => loadJobs())
  const [guokaoJobs, setGuokaoJobs] = useState<Job[]>([])
  const [guokaoLoading, setGuokaoLoading] = useState(false)
  const [guokaoError, setGuokaoError] = useState('')
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('全部')
  const [education, setEducation] = useState<'全部' | EducationLevel>('全部')
  const [major, setMajor] = useState('全部')
  const [gender, setGender] = useState<'全部' | GenderPref | '仅不限'>('全部')
  const [onlyFit, setOnlyFit] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('全部')
  const [crawledAt, setCrawledAt] = useState(() => lastCrawledAt())

  const jobs = useMemo(
    () => [...socialJobs, ...guokaoJobs],
    [socialJobs, guokaoJobs],
  )

  useEffect(() => {
    let cancelled = false
    setGuokaoLoading(true)
    setGuokaoError('')
    fetchGuokao2027Jobs(crawledAt ?? undefined)
      .then((rows) => {
        if (!cancelled) setGuokaoJobs(rows)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setGuokaoError(
            err instanceof Error ? err.message : '2027 国考职位表加载失败',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setGuokaoLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [crawledAt])

  const cities = useMemo(() => {
    const pool =
      sourceFilter === '国考'
        ? guokaoJobs
        : sourceFilter === '企业社招'
          ? socialJobs.filter((j) => jobSourceBucket(j) === '企业社招')
          : sourceFilter === '上海市考'
            ? socialJobs.filter((j) => jobSourceBucket(j) === '上海市考')
            : jobs
    const set = new Set(pool.map((j) => j.city))
    return ['全部', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'zh'))]
  }, [jobs, guokaoJobs, socialJobs, sourceFilter])

  const majors = useMemo(() => {
    const set = new Set(jobs.flatMap((j) => j.structured.majors))
    return ['全部', ...Array.from(set).sort((a, b) => a.localeCompare(b, 'zh'))]
  }, [jobs])

  const { ranked, totalMatched }: { ranked: JobWithMatch[]; totalMatched: number } =
    useMemo(() => {
      const q = query.trim().toLowerCase()
      const prefiltered = jobs.filter((job) => {
        const matchCity = city === '全部' || job.city === city
        const matchEdu =
          education === '全部' ||
          job.structured.educationMin === education ||
          job.structured.educationPrefer === education
        const matchMajor =
          major === '全部' || job.structured.majors.includes(major)
        const matchGender =
          gender === '全部' ||
          (gender === '仅不限'
            ? job.structured.genderPref === '不限'
            : job.structured.genderPref === gender)
        const matchQuery = !q || jobSearchHaystack(job).includes(q)
        const matchSource =
          sourceFilter === '全部' || jobSourceBucket(job) === sourceFilter
        return (
          matchCity && matchEdu && matchMajor && matchGender && matchQuery && matchSource
        )
      })

      const scored = prefiltered
        .map((job) => ({ ...job, match: matchJob(profile, job) }))
        .filter((job) => !onlyFit || job.match.hardPass)
        .sort((a, b) => b.match.score - a.match.score)

      return {
        ranked: scored.slice(0, LIST_CAP),
        totalMatched: scored.length,
      }
    }, [
      jobs,
      profile,
      query,
      city,
      education,
      major,
      gender,
      onlyFit,
      sourceFilter,
    ])

  function refreshCrawl() {
    const next = crawlJobs()
    setSocialJobs(next)
    const at = lastCrawledAt()
    setCrawledAt(at)
    clearGuokao2027Cache()
    setGuokaoJobs([])
    setGuokaoLoading(true)
    fetchGuokao2027Jobs(at ?? undefined)
      .then(setGuokaoJobs)
      .catch((err: unknown) => {
        setGuokaoError(
          err instanceof Error ? err.message : '2027 国考职位表加载失败',
        )
      })
      .finally(() => setGuokaoLoading(false))
  }

  return (
    <main className="page">
      <header className="page-header row">
        <div>
          <h1>岗位雷达</h1>
          <p className="section-lead">
            已接入《27国考岗位表【合并版】》共{' '}
            {guokaoJobs.length > 0
              ? guokaoJobs.length.toLocaleString('zh-CN')
              : '19,327'}{' '}
            条 2027 国考职位；企业社招与上海市考仍为演示样本。支持按职位代码、部门、专业等搜索。
          </p>
          <p className="meta-line">
            当前展示池 {jobs.length.toLocaleString('zh-CN')} 条（社招{' '}
            {socialJobs.length} + 国考 {guokaoJobs.length || '加载中…'}）·
            上次汇聚{' '}
            {crawledAt
              ? new Date(crawledAt).toLocaleString('zh-CN')
              : '尚未汇聚'}
            {guokaoLoading ? ' · 国考职位表加载中…' : null}
            {guokaoError ? ` · ${guokaoError}` : null}
          </p>
          <p className="meta-line">
            <Link to="/gwy/guide">2027 国考选岗与备考指南（摘录）</Link>
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={refreshCrawl}>
          重新汇聚岗位
        </button>
      </header>

      <div className="filters filters-dense">
        <label className="field grow">
          <span>搜索</span>
          <input
            type="search"
            placeholder="职位名称、部门、职位代码、专业关键词…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="field">
          <span>来源</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
          >
            {(['全部', '企业社招', '国考', '上海市考'] as const).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>城市</span>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {cities.slice(0, 80).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>学历门槛</span>
          <select
            value={education}
            onChange={(e) =>
              setEducation(e.target.value as '全部' | EducationLevel)
            }
          >
            {['全部', '大专', '本科', '硕士', '博士'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>专业</span>
          <select value={major} onChange={(e) => setMajor(e.target.value)}>
            {majors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>性别标注</span>
          <select
            value={gender}
            onChange={(e) =>
              setGender(e.target.value as '全部' | GenderPref | '仅不限')
            }
          >
            <option value="全部">全部</option>
            <option value="仅不限">仅看不限</option>
            <option value="男">原文限男</option>
            <option value="女">原文限女</option>
          </select>
        </label>
        <label className="field check-field">
          <span>匹配</span>
          <label className="check-line">
            <input
              type="checkbox"
              checked={onlyFit}
              onChange={(e) => setOnlyFit(e.target.checked)}
            />
            只看硬门槛通过
          </label>
        </label>
      </div>

      {totalMatched > LIST_CAP ? (
        <p className="meta-line">
          共匹配 {totalMatched.toLocaleString('zh-CN')} 条，按匹配度展示前 {LIST_CAP}{' '}
          条。请用来源 / 城市 / 搜索进一步缩小范围。
        </p>
      ) : null}

      <ul className="job-list">
        {ranked.map((job) => {
          const applied = hasApplied(job.id)
          return (
            <li key={job.id} className="job-row">
              <div className="job-main">
                <div className="job-title-row">
                  <h2>{job.title}</h2>
                  <span
                    className={`badge score ${job.match.hardPass ? 'ok' : 'warn'}`}
                  >
                    匹配 {job.match.score}
                  </span>
                  {applied ? <span className="badge">已投递</span> : null}
                </div>
                <p className="job-meta">
                  {job.company} · {job.location} · {job.type} · {job.sourceName}
                  {job.guokaoMeta?.positionCode
                    ? ` · 职位代码 ${job.guokaoMeta.positionCode}`
                    : null}
                </p>
                <p className="job-salary">{job.salary}</p>
                <p className="job-desc">{job.description}</p>
                <ul className="tag-list">
                  {job.structured.highlights.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                  {job.tags.slice(0, 6).map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <p className="match-summary">{job.match.summary}</p>
                <ul className="match-dims">
                  {job.match.dimensions
                    .filter((d) => d.weight > 0)
                    .slice(0, 4)
                    .map((d) => (
                      <li key={d.key} className={`dim-${d.status}`}>
                        <strong>
                          {d.label}·{d.status}
                        </strong>
                        <span>{d.detail}</span>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="job-actions">
                <Link className="btn btn-primary" to={`/apply?job=${job.id}`}>
                  {applied
                    ? '再投一次'
                    : jobSourceBucket(job) === '企业社招'
                      ? '智能投递'
                      : '选岗备忘'}
                </Link>
              </div>
            </li>
          )
        })}
      </ul>

      {ranked.length === 0 && !guokaoLoading ? (
        <p className="empty">
          没有匹配岗位。试试放宽筛选，或先完善求职画像。
          {sourceFilter === '国考' && !guokao2027Loaded() && guokaoError
            ? '（国考表未加载成功，可点「重新汇聚岗位」重试）'
            : null}
        </p>
      ) : null}
    </main>
  )
}
