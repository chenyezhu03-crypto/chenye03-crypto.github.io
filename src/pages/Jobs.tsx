import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FAMOUS_CN_COMPANIES, matchFamousCompany } from '../data/famousCompanies'
import {
  crawlJobs,
  ensureJobsLoaded,
  lastCrawledAt,
  loadJobs,
} from '../lib/crawl'
import { matchJob } from '../lib/match'
import { loadProfile } from '../lib/profile'
import { RequirementPanel } from '../components/RequirementPanel'
import { hasApplied } from '../lib/storage'
import type { EducationLevel, GenderPref, Job, MatchResult } from '../lib/types'

type JobWithMatch = Job & { match: MatchResult }

export function Jobs() {
  const profile = useMemo(() => loadProfile(), [])
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs())
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('全部')
  const [education, setEducation] = useState<'全部' | EducationLevel>('全部')
  const [major, setMajor] = useState('全部')
  const [gender, setGender] = useState<'全部' | GenderPref | '仅不限'>('全部')
  const [onlyFit, setOnlyFit] = useState(false)
  const [page, setPage] = useState(1)
  const [crawledAt, setCrawledAt] = useState(() => lastCrawledAt())
  const [busy, setBusy] = useState(false)
  const [booting, setBooting] = useState(() => loadJobs().length < 500)
  const pageSize = 30

  useEffect(() => {
    setBooting(true)
    void ensureJobsLoaded()
      .then((list) => {
        setJobs(list)
        setCrawledAt(lastCrawledAt())
      })
      .finally(() => setBooting(false))
  }, [])

  const cities = useMemo(() => {
    const set = new Set(jobs.map((j) => j.city))
    return ['全部', ...Array.from(set)]
  }, [jobs])

  const majors = useMemo(() => {
    const set = new Set(
      jobs.flatMap((j) => [
        ...(j.structured.majorsRequired || []),
        ...(j.structured.majorsPreferred || []),
      ]),
    )
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
          major === '全部' ||
          (job.structured.majorsRequired || []).includes(major) ||
          (job.structured.majorsPreferred || []).includes(major)
        const matchGender =
          gender === '全部' ||
          (gender === '仅不限'
            ? job.structured.genderPref === '不限'
            : job.structured.genderPref === gender)
        const hay =
          `${job.title} ${job.company} ${job.tags.join(' ')} ${job.requirementText}`.toLowerCase()
        const matchQuery = !q || hay.includes(q)
        const matchFit = !onlyFit || job.match.hardPass
        return (
          matchCity &&
          matchEdu &&
          matchMajor &&
          matchGender &&
          matchQuery &&
          matchFit
        )
      })
      .sort((a, b) => b.match.score - a.match.score)
  }, [jobs, profile, query, city, education, major, gender, onlyFit])

  useEffect(() => {
    setPage(1)
  }, [query, city, education, major, gender, onlyFit, jobs.length])

  const totalPages = Math.max(1, Math.ceil(ranked.length / pageSize))
  const pageJobs = ranked.slice((page - 1) * pageSize, page * pageSize)

  async function refreshCrawl() {
    setBusy(true)
    try {
      const result = await crawlJobs({ replace: false })
      setJobs(result.jobs)
      setCrawledAt(result.crawledAt)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <header className="page-header row">
        <div>
          <h1>岗位雷达</h1>
          <p className="section-lead">
            多源汇聚后做条件透视。按学历 / 专业 / 性别标注筛选，并按与你画像的匹配度排序。
          </p>
          <p className="meta-line">
            当前 {jobs.length} 条 · 知名企业{' '}
            {
              new Set(
                jobs
                  .map((j) => matchFamousCompany(j.company))
                  .filter(Boolean),
              ).size
            }
            /{FAMOUS_CN_COMPANIES.length} 家 · 上次汇聚{' '}
            {crawledAt
              ? new Date(crawledAt).toLocaleString('zh-CN')
              : '尚未汇聚'}
            {booting ? ' · 正在拉取完整岗位包（约 2 万条，首次稍慢）…' : ''}
            {' · '}
            <Link to="/sources">管理数据源</Link>
            {' · '}
            <Link to="/batch">批量投递</Link>
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || booting}
          onClick={() => void refreshCrawl()}
        >
          {busy || booting ? '汇聚中…' : '重新汇聚岗位'}
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

      <p className="meta-line">
        筛选后 {ranked.length} 条 · 第 {page}/{totalPages} 页
      </p>

      <ul className="job-list">
        {pageJobs.map((job) => {
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
                  {job.structured.highlights.slice(0, 6).map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                  {job.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <RequirementPanel job={job} />
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
                  {applied ? '再投一次' : '智能投递'}
                </Link>
                {job.applyUrl ? (
                  <a
                    className="btn btn-ghost"
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    原文
                  </a>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {ranked.length > pageSize ? (
        <div className="hero-actions" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            上一页
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            下一页
          </button>
        </div>
      ) : null}

      {ranked.length === 0 ? (
        <p className="empty">
          没有匹配岗位。试试放宽筛选，或先去{' '}
          <Link to="/sources">数据源</Link> 汇聚。
        </p>
      ) : null}
    </main>
  )
}
