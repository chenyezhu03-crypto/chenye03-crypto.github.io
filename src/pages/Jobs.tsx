import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobs } from '../data/jobs'
import { hasApplied } from '../lib/storage'

export function Jobs() {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('全部')

  const cities = useMemo(() => {
    const set = new Set(jobs.map((j) => j.location.split(' · ')[0] ?? j.location))
    return ['全部', ...Array.from(set)]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter((job) => {
      const matchCity =
        city === '全部' || job.location.startsWith(city) || job.location.includes('远程')
      const hay = `${job.title} ${job.company} ${job.tags.join(' ')}`.toLowerCase()
      const matchQuery = !q || hay.includes(q)
      return matchCity && matchQuery
    })
  }, [query, city])

  return (
    <main className="page">
      <header className="page-header">
        <h1>开放岗位</h1>
        <p className="section-lead">选出你想投的那一个，剩下的交给表单。</p>
      </header>

      <div className="filters">
        <label className="field grow">
          <span>搜索</span>
          <input
            type="search"
            placeholder="职位、公司或技能"
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
      </div>

      <ul className="job-list">
        {filtered.map((job) => {
          const applied = hasApplied(job.id)
          return (
            <li key={job.id} className="job-row">
              <div className="job-main">
                <div className="job-title-row">
                  <h2>{job.title}</h2>
                  {applied ? <span className="badge">已投递</span> : null}
                </div>
                <p className="job-meta">
                  {job.company} · {job.location} · {job.type}
                </p>
                <p className="job-salary">{job.salary}</p>
                <p className="job-desc">{job.description}</p>
                <ul className="tag-list">
                  {job.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <Link className="btn btn-primary" to={`/apply?job=${job.id}`}>
                {applied ? '再次投递' : '投递'}
              </Link>
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 ? (
        <p className="empty">没有匹配的岗位，试试换个关键词。</p>
      ) : null}
    </main>
  )
}
