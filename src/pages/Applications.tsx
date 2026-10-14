import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clearApplications, listApplications } from '../lib/storage'
import type { Application } from '../lib/storage'

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function Applications() {
  const [items, setItems] = useState<Application[]>(() => listApplications())

  function refresh() {
    setItems(listApplications())
  }

  function onClear() {
    clearApplications()
    refresh()
  }

  return (
    <main className="page">
      <header className="page-header row">
        <div>
          <h1>我的投递</h1>
          <p className="section-lead">记录保存在本机，换设备不会同步。</p>
        </div>
        {items.length > 0 ? (
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            清空记录
          </button>
        ) : null}
      </header>

      {items.length === 0 ? (
        <div className="empty-panel">
          <p>还没有投递记录。</p>
          <Link className="btn btn-primary" to="/jobs">
            去选岗位
          </Link>
        </div>
      ) : (
        <ul className="app-list">
          {items.map((item) => (
            <li key={item.id} className="app-row">
              <div>
                <div className="job-title-row">
                  <h2>{item.jobTitle}</h2>
                  <span className="badge status">{item.status}</span>
                </div>
                <p className="job-meta">
                  {item.company} · {item.name} · {item.resumeName}
                </p>
                <p className="app-time">{formatTime(item.submittedAt)}</p>
                {item.coverLetter ? (
                  <p className="app-letter">{item.coverLetter}</p>
                ) : null}
              </div>
              <Link className="btn btn-ghost" to={`/apply?job=${item.jobId}`}>
                再投一次
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
