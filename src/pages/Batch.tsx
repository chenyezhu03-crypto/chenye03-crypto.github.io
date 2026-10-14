import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildHardPassQueue,
  runBatchQueue,
  type BatchResult,
  type QueueItem,
} from '../lib/batch'
import { ensureJobsLoaded, loadJobs } from '../lib/crawl'
import { loadProfile, profileCompleteness } from '../lib/profile'
import type { Job } from '../lib/types'

export function Batch() {
  const [jobs, setJobs] = useState<Job[]>(() => loadJobs())
  const [selected, setSelected] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [liveItems, setLiveItems] = useState<QueueItem[]>([])
  const [result, setResult] = useState<BatchResult | null>(null)
  const profile = useMemo(() => loadProfile(), [])
  const completeness = profileCompleteness(profile)

  useEffect(() => {
    void ensureJobsLoaded().then((list) => {
      setJobs(list)
      const queue = buildHardPassQueue(list)
      setSelected(queue.map((q) => q.jobId))
      setLiveItems(queue)
    })
  }, [])

  const queue = useMemo(() => buildHardPassQueue(jobs), [jobs])

  useEffect(() => {
    if (!running && !result) {
      setLiveItems(queue)
      setSelected((prev) => {
        const allowed = new Set(queue.map((q) => q.jobId))
        const kept = prev.filter((id) => allowed.has(id))
        return kept.length ? kept : queue.map((q) => q.jobId)
      })
    }
  }, [queue, running, result])

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function selectAll() {
    setSelected(queue.map((q) => q.jobId))
  }

  function clearAll() {
    setSelected([])
  }

  async function start() {
    if (!selected.length || running) return
    setRunning(true)
    setResult(null)
    const outcome = await runBatchQueue(jobs, selected, setLiveItems)
    setResult(outcome)
    setRunning(false)
  }

  const display = running || result ? liveItems : queue

  return (
    <main className="page">
      <header className="page-header row">
        <div>
          <h1>批量投递队列</h1>
          <p className="section-lead">
            只收录硬门槛通过的岗位，自动切换简历版本并生成自适应投递包。画像完成度{' '}
            {completeness}%。
          </p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={running || selected.length === 0}
            onClick={() => void start()}
          >
            {running ? '队列执行中…' : `投递选中（${selected.length}）`}
          </button>
          <Link className="btn btn-ghost" to="/jobs">
            回岗位雷达
          </Link>
        </div>
      </header>

      {queue.length === 0 ? (
        <div className="empty-panel">
          <p>当前没有硬门槛通过的岗位。先完善画像或汇聚更多数据源。</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/profile">
              完善画像
            </Link>
            <Link className="btn btn-ghost" to="/sources">
              管理数据源
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="batch-toolbar">
            <button type="button" className="btn btn-ghost" onClick={selectAll}>
              全选通过项
            </button>
            <button type="button" className="btn btn-ghost" onClick={clearAll}>
              清空选择
            </button>
            <span className="meta-line">
              硬门槛通过 {queue.length} · 已选 {selected.length}
            </span>
          </div>

          <ul className="queue-list">
            {display.map((item) => (
              <li key={item.jobId} className="queue-row">
                <label className="check-line">
                  <input
                    type="checkbox"
                    disabled={running}
                    checked={selected.includes(item.jobId)}
                    onChange={() => toggle(item.jobId)}
                  />
                  <span>
                    <strong>
                      {item.jobTitle}
                      <em className={`queue-status st-${item.status}`}>
                        {item.status}
                      </em>
                    </strong>
                    <small>
                      {item.company} · 匹配 {item.matchScore} · 简历{' '}
                      {item.resumeName}
                    </small>
                    {item.message ? <small>{item.message}</small> : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      {result ? (
        <section className="report-box">
          <h2>本轮结果</h2>
          <p>
            共 {result.total} · 成功 {result.success} · 失败 {result.failed}
          </p>
          <p className="fine-print">
            可在 <Link to="/applications">我的投递</Link> 查看批量记录与所用简历版本。
          </p>
        </section>
      ) : null}
    </main>
  )
}
