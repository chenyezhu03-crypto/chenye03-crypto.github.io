import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { buildAdaptivePack } from '../lib/adaptiveApply'
import { ensureJobsLoaded, getJobById, loadJobs } from '../lib/crawl'
import { matchJob } from '../lib/match'
import { loadProfile } from '../lib/profile'
import {
  explainResumePick,
  loadResumes,
  pickResumeForJob,
  type ResumeVersion,
} from '../lib/resumes'
import { saveApplication } from '../lib/storage'
import type { Job } from '../lib/types'

type FormState = {
  jobId: string
  name: string
  email: string
  phone: string
  education: string
  years: string
  resumeName: string
  coverLetter: string
}

export function Apply() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs())
  const profile = useMemo(() => loadProfile(), [])
  const resumes = useMemo(() => loadResumes(), [])
  const jobFromUrl = params.get('job')
  const initialJob =
    (jobFromUrl && getJobById(jobFromUrl)?.id) || jobs[0]?.id || ''

  const [form, setForm] = useState<FormState>({
    jobId: initialJob,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    education: '',
    years: '',
    resumeName: '',
    coverLetter: '',
  })
  const [resumeId, setResumeId] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)

  useEffect(() => {
    void ensureJobsLoaded().then((list) => {
      setJobs(list)
      if (!form.jobId && list[0]) {
        setForm((prev) => ({ ...prev, jobId: list[0].id }))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = useMemo(
    () => jobs.find((j) => j.id === form.jobId) ?? getJobById(form.jobId),
    [form.jobId, jobs],
  )

  const match = useMemo(
    () => (selected ? matchJob(profile, selected) : null),
    [profile, selected],
  )

  const autoResume = useMemo(
    () => (selected ? pickResumeForJob(selected, resumes) : null),
    [selected, resumes],
  )

  const activeResume: ResumeVersion | null = useMemo(() => {
    if (!resumes.length) return null
    return resumes.find((r) => r.id === resumeId) ?? autoResume ?? resumes[0]
  }, [resumes, resumeId, autoResume])

  const pack = useMemo(
    () =>
      selected && match && activeResume
        ? buildAdaptivePack(profile, selected, match, activeResume)
        : null,
    [profile, selected, match, activeResume],
  )

  useEffect(() => {
    if (!jobFromUrl) return
    const matched = getJobById(jobFromUrl)
    if (matched) {
      setForm((prev) =>
        prev.jobId === matched.id ? prev : { ...prev, jobId: matched.id },
      )
      setAutoFilled(false)
      setResumeId('')
    }
  }, [jobFromUrl])

  useEffect(() => {
    if (!selected || !autoResume) return
    if (!resumeId) setResumeId(autoResume.id)
  }, [selected, autoResume, resumeId])

  useEffect(() => {
    if (!pack || !activeResume || autoFilled) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || profile.name,
      email: prev.email || profile.email,
      phone: prev.phone || profile.phone,
      education: pack.suggestedEducationLine,
      years: pack.suggestedYearsLine,
      resumeName: activeResume.fileName,
      coverLetter: pack.coverLetter,
    }))
    setAutoFilled(true)
  }, [pack, activeResume, autoFilled, profile])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function regenerate() {
    if (!pack || !activeResume) return
    setForm((prev) => ({
      ...prev,
      education: pack.suggestedEducationLine,
      years: pack.suggestedYearsLine,
      resumeName: activeResume.fileName,
      coverLetter: pack.coverLetter,
    }))
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.jobId || !selected || !match || !pack || !activeResume) {
      setError('请选择要投递的岗位。')
      return
    }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('请填写姓名、邮箱与手机号。')
      return
    }
    if (!form.resumeName.trim()) {
      setError('请确认简历版本或上传文件。')
      return
    }

    saveApplication({
      jobId: selected.id,
      jobTitle: selected.title,
      company: selected.company,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      education: form.education.trim() || pack.suggestedEducationLine,
      years: form.years.trim() || pack.suggestedYearsLine,
      resumeName: form.resumeName.trim(),
      coverLetter: form.coverLetter.trim(),
      matchScore: match.score,
      hardPass: match.hardPass,
      applyAngle: pack.angle,
      sourceName: selected.sourceName,
      resumeVersionId: activeResume.id,
      resumeVersionName: activeResume.name,
      batch: false,
    })

    setDone(true)
  }

  if (done && selected && match && activeResume) {
    return (
      <main className="page narrow">
        <div className="success-panel">
          <p className="success-mark" aria-hidden>
            ✓
          </p>
          <h1>投递成功</h1>
          <p className="section-lead">
            已向 {selected.company} 的「{selected.title}」提交（匹配 {match.score}
            ，简历版本「{activeResume.name}」）。
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/applications')}
            >
              查看我的投递
            </button>
            <Link className="btn btn-ghost" to="/batch">
              去批量队列
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page narrow">
      <header className="page-header">
        <h1>智能投递</h1>
        <p className="section-lead">
          自动切换简历版本并改写自荐角度。你仍可逐字编辑后再提交。
        </p>
      </header>

      <form className="apply-form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>目标岗位</span>
          <select
            value={form.jobId}
            onChange={(e) => {
              update('jobId', e.target.value)
              setAutoFilled(false)
              setResumeId('')
            }}
            required
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.company} · {job.title}
              </option>
            ))}
          </select>
        </label>

        {selected && match && pack && activeResume ? (
          <aside className="intel-panel">
            <div className="intel-top">
              <span
                className={`badge score ${match.hardPass ? 'ok' : 'warn'}`}
              >
                匹配 {match.score}
              </span>
              <span className="badge">{selected.sourceName}</span>
              <span className="badge">简历·{activeResume.name}</span>
            </div>
            <p className="job-meta">
              {selected.location} · {selected.type} · {selected.salary}
            </p>
            <p>
              <strong>投递角度：</strong>
              {pack.angle}
            </p>
            <p className="match-summary">
              {explainResumePick(selected, activeResume)}
            </p>
            <ul className="tag-list">
              {selected.structured.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <ul className="match-dims compact">
              {match.dimensions
                .filter((d) => d.weight > 0)
                .map((d) => (
                  <li key={d.key} className={`dim-${d.status}`}>
                    <strong>
                      {d.label}·{d.status}
                    </strong>
                    <span>{d.detail}</span>
                  </li>
                ))}
            </ul>
            {pack.warnings.map((w) => (
              <p key={w} className="warn-line">
                {w}
              </p>
            ))}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={regenerate}
            >
              按当前岗位重写投递包
            </button>
          </aside>
        ) : null}

        <div className="form-grid">
          <label className="field">
            <span>姓名</span>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label className="field">
            <span>手机</span>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              autoComplete="tel"
              required
            />
          </label>
          <label className="field full">
            <span>邮箱</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>学历展示（自适应）</span>
            <input
              value={form.education}
              onChange={(e) => update('education', e.target.value)}
            />
          </label>
          <label className="field">
            <span>年限展示（自适应）</span>
            <input
              value={form.years}
              onChange={(e) => update('years', e.target.value)}
            />
          </label>
          <label className="field full">
            <span>简历版本（自动匹配，可改）</span>
            <select
              value={activeResume?.id ?? ''}
              onChange={(e) => {
                setResumeId(e.target.value)
                setAutoFilled(false)
              }}
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                  {r.isDefault ? '（默认）' : ''} · {r.fileName}
                </option>
              ))}
            </select>
            <em className="file-name">
              当前文件名：{form.resumeName || activeResume?.fileName}
              {' · '}
              <Link to="/resumes">管理多版简历</Link>
            </em>
          </label>
          <label className="field full">
            <span>或本地上传覆盖文件名</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                update('resumeName', e.target.files?.[0]?.name ?? form.resumeName)
              }
            />
          </label>
          <label className="field full">
            <span>自适应自荐信</span>
            <textarea
              rows={10}
              value={form.coverLetter}
              onChange={(e) => update('coverLetter', e.target.value)}
            />
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn btn-primary btn-wide">
          确认投递
        </button>
        <p className="fine-print">
          还没填画像？先去 <Link to="/profile">求职画像</Link>。硬门槛批量可走{' '}
          <Link to="/batch">批量队列</Link>。
        </p>
      </form>
    </main>
  )
}
