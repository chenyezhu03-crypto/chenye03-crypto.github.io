import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { crawlJobs, lastCrawledAt, loadJobs } from '../lib/crawl'
import { matchJob } from '../lib/match'
import { loadProfile } from '../lib/profile'
import { hasApplied } from '../lib/storage'
import type { EducationLevel, GenderPref, Job, MatchResult } from '../lib/types'

type JobWithMatch = Job & { match: MatchResult }

type SourceFilter = '全部' | '企业社招' | '国考' | '上海市考'

function jobSourceBucket(job: Job): SourceFilter {
  if (job.sourceId === 'guokao') return '国考'
  if (job.sourceId === 'shanghai-gwy') return '上海市考'
  return '企业社招'
}

export function Jobs() {
  const profile = useMemo(() => loadProfile(), [])
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs())
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('全部')
  const [education, setEducation] = useState<'全部' | EducationLevel>('全部')
  const [major, setMajor] = useState('全部')
  const [gender, setGender] = useState<'全部' | GenderPref | '仅不限'>('全部')
  const [onlyFit, setOnlyFit] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('全部')
  const [crawledAt, setCrawledAt] = useState(() => lastCrawledAt())

  const cities = useMemo(() => {
    const set = new Set(jobs.map((j) => j.city))
    return ['全部', ...Array.from(set)]
  }, [jobs])

  const majors = useMemo(() => {
    const set = new Set(jobs.flatMap((j) => j.structured.majors))
    return ['全部', ...Array.from(set)]
  }, [jobs])

  const ranked: JobWithMatch[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs
      .map((job) => ({ ...job, match: matchJob(profile, job) }))
      .filter((job) => {
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
        const hay =
          `${job.title} ${job.company} ${job.tags.join(' ')} ${job.requirementText}`.toLowerCase()
        const matchQuery = !q || hay.includes(q)
        const matchFit = !onlyFit || job.match.hardPass
        const matchSource =
          sourceFilter === '全部' || jobSourceBucket(job) === sourceFilter
        return (
          matchCity &&
          matchEdu &&
          matchMajor &&
          matchGender &&
          matchQuery &&
          matchFit &&
          matchSource
        )
      })
      .sort((a, b) => b.match.score - a.match.score)
  }, [jobs, profile, query, city, education, major, gender, onlyFit, sourceFilter])

  function refreshCrawl() {
    const next = crawlJobs()
    setJobs(next)
    setCrawledAt(lastCrawledAt())
  }

  return (
    <main className="page">
      <header className="page-header row">
        <div>
          <h1>岗位雷达</h1>
          <p className="section-lead">
            多源汇聚后做条件透视。支持企业社招与国考 / 上海市考公务员职位演示样本，按学历、专业、基层经历等筛选并排序。
          </p>
          <p className="meta-line">
            当前 {jobs.length} 条 · 上次汇聚{' '}
            {crawledAt
              ? new Date(crawledAt).toLocaleString('zh-CN')
              : '尚未汇聚'}
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
            placeholder="职位、公司、技能或 JD 关键词"
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
            {cities.map((c) => (
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
                </p>
                <p className="job-salary">{job.salary}</p>
                <p className="job-desc">{job.description}</p>
                <ul className="tag-list">
                  {job.structured.highlights.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                  {job.tags.map((tag) => (
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

      {ranked.length === 0 ? (
        <p className="empty">没有匹配岗位。试试放宽筛选，或先完善求职画像。</p>
      ) : null}
    </main>
  )
}
