import { useMemo, useState } from 'react'
import { allChannels, postToChannel } from '../../lib/channelStorage'

export function TravelChannels() {
  const [channelId, setChannelId] = useState('asia')
  const [body, setBody] = useState('')
  const [tick, setTick] = useState(0)

  const channels = useMemo(() => allChannels(), [tick])
  const room = channels.find((c) => c.id === channelId) ?? channels[0]

  function send() {
    if (!body.trim() || !room) return
    postToChannel(room.id, body)
    setBody('')
    setTick((t) => t + 1)
  }

  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">全球频道</h1>
        <p className="travel-lead">
          大洲主频道 + 签证/组队/创作/大赛专区 · 发帖讨论 · 无广告（原型）
        </p>
      </section>

      <section className="travel-card">
        <div className="travel-chips">
          {channels.map((c) => (
            <button
              key={c.id}
              type="button"
              className={channelId === c.id ? 'travel-chip is-on' : 'travel-chip'}
              onClick={() => setChannelId(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        {room && (
          <>
            <p className="travel-meta">{room.desc}</p>
            <ul className="travel-feed-list">
              {room.posts.length === 0 && (
                <li className="travel-meta">暂无帖子，做第一个发言的人</li>
              )}
              {room.posts.map((p) => (
                <li key={p.id} className="travel-feed-item">
                  <strong>{p.author}</strong>
                  <p className="travel-feed-body">{p.body}</p>
                </li>
              ))}
            </ul>
            <textarea
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="文字讨论（演示）"
            />
            <button type="button" className="btn btn-primary travel-btn-block" onClick={send}>
              发送
            </button>
          </>
        )}
      </section>
    </main>
  )
}
