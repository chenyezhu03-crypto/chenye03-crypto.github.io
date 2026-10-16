import { useState } from 'react'
import { QUARTERLY_CONTESTS } from '../../data/platformContentSeed'

export function TravelContests() {
  const [title, setTitle] = useState('')
  const [submitted, setSubmitted] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('travel-contest-submits') ?? '[]') as string[]
    } catch {
      return []
    }
  })

  function submit() {
    if (!title.trim()) return
    const next = [...submitted, `${title.trim()} · ${new Date().toLocaleString('zh-CN')}`]
    localStorage.setItem('travel-contest-submits', JSON.stringify(next))
    setSubmitted(next)
    setTitle('')
  }

  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">季度官方赛事</h1>
        <p className="travel-lead">
          Q1–Q4 固定四赛 · 投稿 · 排名 · 获奖作品上架 · 徽章与签约通道（演示）
        </p>
      </section>

      <section className="travel-card">
        <ul className="travel-member-list">
          {QUARTERLY_CONTESTS.map((c) => (
            <li key={c.quarter} className="travel-member-card">
              <div>
                <strong>
                  {c.quarter} · {c.title}
                </strong>
                <p className="travel-meta">
                  截止 {c.deadline} ·{' '}
                  {c.status === 'open' ? '投稿中' : '即将开启'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="travel-card travel-form">
        <h2 className="travel-h2">投稿（Q1 演示）</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="作品标题 / 路线摘要"
        />
        <button type="button" className="btn btn-primary travel-btn-block" onClick={submit}>
          提交作品
        </button>
        {submitted.length > 0 && (
          <ul className="travel-bullets travel-meta">
            {submitted.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
