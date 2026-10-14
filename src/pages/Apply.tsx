import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getJobById, jobs } from '../data/jobs'
import { saveApplication } from '../lib/storage'

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

const empty: FormState = {
  jobId: '',
  name: '',
  email: '',
  phone: '',
  education: '',
  years: '',
  resumeName: '',
  coverLetter: '',
}

export function Apply() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const initialJob = params.get('job') ?? jobs[0]?.id ?? ''

  const [form, setForm] = useState<FormState>({ ...empty, jobId: initialJob })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const selected = useMemo(() => getJobById(form.jobId), [form.jobId])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.jobId || !selected) {
      setError('请选择要投递的岗位。')
      return
    }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('请填写姓名、邮箱与手机号。')
      return
    }
    if (!form.resumeName.trim()) {
      setError('请选择简历文件（演示环境仅记录文件名）。')
      return
    }

    saveApplication({
      jobId: selected.id,
      jobTitle: selected.title,
      company: selected.company,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      education: form.education.trim() || '未填写',
      years: form.years.trim() || '未填写',
      resumeName: form.resumeName.trim(),
      coverLetter: form.coverLetter.trim(),
    })

    setDone(true)
  }

  if (done && selected) {
    return (
      <main className="page narrow">
        <div className="success-panel animate-rise">
          <p className="success-mark" aria-hidden>
            ✓
          </p>
          <h1>投递成功</h1>
          <p className="section-lead">
            已向 {selected.company} 的「{selected.title}」提交申请。可在「我的投递」查看进度。
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/applications')}
            >
              查看我的投递
            </button>
            <Link className="btn btn-ghost" to="/jobs">
              继续浏览
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page narrow">
      <header className="page-header">
        <h1>投递简历</h1>
        <p className="section-lead">填写要点即可，演示数据保存在本机浏览器。</p>
      </header>

      <form className="apply-form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>目标岗位</span>
          <select
            value={form.jobId}
            onChange={(e) => update('jobId', e.target.value)}
            required
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.company} · {job.title}
              </option>
            ))}
          </select>
        </label>

        {selected ? (
          <aside className="job-snippet">
            <p>
              {selected.location} · {selected.type} · {selected.salary}
            </p>
            <p>{selected.description}</p>
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
            <span>学历</span>
            <input
              value={form.education}
              onChange={(e) => update('education', e.target.value)}
              placeholder="如：本科 · 计算机"
            />
          </label>
          <label className="field">
            <span>工作年限</span>
            <input
              value={form.years}
              onChange={(e) => update('years', e.target.value)}
              placeholder="如：3 年"
            />
          </label>
          <label className="field full">
            <span>简历文件</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                update('resumeName', e.target.files?.[0]?.name ?? '')
              }
            />
            {form.resumeName ? (
              <em className="file-name">已选择：{form.resumeName}</em>
            ) : null}
          </label>
          <label className="field full">
            <span>自荐信（可选）</span>
            <textarea
              rows={5}
              value={form.coverLetter}
              onChange={(e) => update('coverLetter', e.target.value)}
              placeholder="用几句话说明你为什么适合这个岗位。"
            />
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn btn-primary btn-wide">
          确认投递
        </button>
      </form>
    </main>
  )
}
