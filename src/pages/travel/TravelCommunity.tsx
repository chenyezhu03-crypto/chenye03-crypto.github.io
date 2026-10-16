import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TRAVEL_MOMENT_STATUSES, statusById } from '../../data/travelStatusPresets'
import { DESTINATIONS } from '../../data/destinations'
import {
  addCommunityPost,
  applyStatus,
  communityFeed,
  formatStatusAgo,
  loadCommunityProfile,
  membersOnSameTrip,
  saveCommunityProfile,
  syncProfileFromCustomBrief,
} from '../../lib/travelCommunityStorage'
import type { TravelMomentStatusId } from '../../lib/travelCommunityTypes'
import { overlapDayCount } from '../../lib/travelTripOverlap'

type CommunityTab = 'status' | 'same-time' | 'feed'

export function TravelCommunity() {
  const [tab, setTab] = useState<CommunityTab>('status')
  const [profile, setProfile] = useState(() =>
    syncProfileFromCustomBrief(loadCommunityProfile()),
  )
  const [postDraft, setPostDraft] = useState('')
  const [savedHint, setSavedHint] = useState('')

  const preset = statusById(profile.statusId)
  const sameTime = useMemo(() => membersOnSameTrip(profile), [profile])
  const feed = useMemo(() => communityFeed(profile), [profile, postDraft])

  function flash(msg: string) {
    setSavedHint(msg)
    window.setTimeout(() => setSavedHint(''), 2200)
  }

  function pickStatus(id: TravelMomentStatusId) {
    const next = applyStatus(profile, id)
    setProfile(next)
    flash(`已设为「${statusById(id).label}」`)
  }

  function saveProfile(patch: Partial<typeof profile>) {
    const next = { ...profile, ...patch }
    saveCommunityProfile(next)
    setProfile(next)
    flash('资料已保存')
  }

  function submitPost() {
    const t = postDraft.trim()
    if (!t) return
    addCommunityPost(profile, t)
    setPostDraft('')
    flash('已发布到广场')
    setTab('feed')
  }

  const sortedDests = useMemo(
    () => [...DESTINATIONS].sort((a, b) => a.name.localeCompare(b.name, 'zh')),
    [],
  )

  return (
    <main className="travel-page travel-community-page">
      <section className="travel-card">
        <h1 className="travel-h1">旅友社区</h1>
        <p className="travel-lead">
          像微信状态一样告诉大家你在干嘛；填好出行日期后，<strong>同一时间段</strong>
          在外面的旅友会出现在「同期出行」。当前为演示数据，上线后接入账号与私信。
        </p>
        {savedHint && <p className="travel-community-toast">{savedHint}</p>}
      </section>

      <section className="travel-card travel-community-my-status">
        <div className="travel-status-avatar" aria-hidden>
          <span className="travel-status-emoji">{profile.avatarEmoji}</span>
          <span className="travel-status-ring">{preset.emoji}</span>
        </div>
        <div className="travel-status-meta">
          <strong>{profile.displayName}</strong>
          <p className="travel-status-line">
            {preset.emoji} {preset.label}
            {profile.statusText ? ` · ${profile.statusText}` : ''}
          </p>
          <p className="travel-meta">
            {profile.destinationLabel} · {profile.tripStart} → {profile.tripEnd} ·
            更新于 {formatStatusAgo(profile.statusUpdatedAt)}
          </p>
          <label className="travel-status-visible">
            <input
              type="checkbox"
              checked={profile.visible}
              onChange={(e) => saveProfile({ visible: e.target.checked })}
            />
            对社区可见（关闭后他人看不到你的状态与同期匹配）
          </label>
        </div>
      </section>

      <nav className="travel-community-tabs" aria-label="社区分区">
        {(
          [
            ['status', '设状态'],
            ['same-time', `同期${sameTime.length ? ` (${sameTime.length})` : ''}`],
            ['feed', '广场交流'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'travel-community-tab is-on' : 'travel-community-tab'}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'status' && (
        <>
          <section className="travel-card">
            <h2 className="travel-h2">此刻状态（点一下即更新）</h2>
            <div className="travel-status-grid">
              {TRAVEL_MOMENT_STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={
                    profile.statusId === s.id
                      ? 'travel-status-chip is-on'
                      : 'travel-status-chip'
                  }
                  onClick={() => pickStatus(s.id)}
                >
                  <span className="travel-status-chip-emoji">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            <div className="field">
              <label className="field-label" htmlFor="status-text">
                补充一句（可选）
              </label>
              <input
                id="status-text"
                value={profile.statusText}
                onChange={(e) =>
                  setProfile({ ...profile, statusText: e.target.value })
                }
                onBlur={() =>
                  saveCommunityProfile({
                    ...profile,
                    statusUpdatedAt: Date.now(),
                  })
                }
                placeholder="如：刚落地、在排队、勿扰…"
              />
            </div>
          </section>

          <section className="travel-card travel-form">
            <h2 className="travel-h2">出行信息（用于匹配同期旅友）</h2>
            <div className="field">
              <label className="field-label" htmlFor="comm-name">
                昵称
              </label>
              <input
                id="comm-name"
                value={profile.displayName}
                onChange={(e) =>
                  setProfile({ ...profile, displayName: e.target.value })
                }
                onBlur={() => saveCommunityProfile(profile)}
              />
            </div>
            <div className="field">
              <span className="field-label">头像 emoji</span>
              <div className="travel-status-grid travel-emoji-pick">
                {['🧳', '🌸', '🎒', '🧭', '📷', '🌊', '🐼', '✈️'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    className={
                      profile.avatarEmoji === em
                        ? 'travel-status-chip is-on'
                        : 'travel-status-chip'
                    }
                    onClick={() => saveProfile({ avatarEmoji: em })}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className="field travel-date-row">
              <div>
                <label className="field-label" htmlFor="comm-start">
                  出发
                </label>
                <input
                  id="comm-start"
                  type="date"
                  value={profile.tripStart}
                  onChange={(e) =>
                    saveProfile({ tripStart: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="field-label" htmlFor="comm-end">
                  返程
                </label>
                <input
                  id="comm-end"
                  type="date"
                  value={profile.tripEnd}
                  onChange={(e) => saveProfile({ tripEnd: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="comm-dest">
                目的地
              </label>
              <input
                id="comm-dest"
                list="comm-dest-list"
                value={profile.destinationLabel}
                onChange={(e) =>
                  setProfile({ ...profile, destinationLabel: e.target.value })
                }
                onBlur={() => saveCommunityProfile(profile)}
                placeholder="如：新加坡、成都"
              />
              <datalist id="comm-dest-list">
                {sortedDests.map((d) => (
                  <option key={d.id} value={d.name} />
                ))}
              </datalist>
            </div>
            <button
              type="button"
              className="btn btn-ghost travel-btn-block"
              onClick={() => {
                const next = syncProfileFromCustomBrief(profile)
                setProfile(next)
                flash('已从「做攻略」表单同步日期与目的地')
              }}
            >
              从第二步攻略表单同步
            </button>
            <Link className="travel-foot-link" to="/travel/custom">
              去填写攻略表单 →
            </Link>
          </section>
        </>
      )}

      {tab === 'same-time' && (
        <section className="travel-card">
          <h2 className="travel-h2">与你行程重叠的旅友</h2>
          <p className="travel-meta">
            你的计划：{profile.tripStart} → {profile.tripEnd} · {profile.destinationLabel}
          </p>
          {sameTime.length === 0 ? (
            <p className="travel-meta">
              暂无重叠行程。试试把日期改成演示旅友相近的范围，或稍后再来（上线后人会更多）。
            </p>
          ) : (
            <ul className="travel-member-list">
              {sameTime.map((m) => {
                const st = statusById(m.statusId)
                const overlap = overlapDayCount(
                  profile.tripStart,
                  profile.tripEnd,
                  m.tripStart,
                  m.tripEnd,
                )
                return (
                  <li key={m.userId} className="travel-member-card">
                    <span className="travel-member-avatar">{m.avatarEmoji}</span>
                    <div>
                      <strong>
                        {m.displayName}
                        {m.isDemo && (
                          <span className="travel-member-demo"> 演示</span>
                        )}
                      </strong>
                      <p className="travel-status-line">
                        {st.emoji} {st.label} · {m.statusText || st.hint}
                      </p>
                      <p className="travel-meta">
                        {m.destinationLabel} · 重叠约 {overlap} 天 ·{' '}
                        {formatStatusAgo(m.statusUpdatedAt)}
                      </p>
                      <button
                        type="button"
                        className="btn btn-ghost travel-member-action"
                        onClick={() => {
                          setPostDraft(
                            `@${m.displayName} 我也在 ${profile.destinationLabel}（${profile.tripStart}–${profile.tripEnd}），要不要约一下？`,
                          )
                          setTab('feed')
                        }}
                      >
                        发消息到广场
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {tab === 'feed' && (
        <>
          <section className="travel-card travel-form">
            <h2 className="travel-h2">发一条动态</h2>
            <p className="travel-meta">
              会带上你的状态 {preset.emoji} 与出行信息，方便同路人看见。
            </p>
            <textarea
              rows={3}
              value={postDraft}
              onChange={(e) => setPostDraft(e.target.value)}
              placeholder="分享见闻、求搭子、问避雷…"
            />
            <button
              type="button"
              className="btn btn-primary travel-btn-block"
              onClick={submitPost}
              disabled={!postDraft.trim()}
            >
              发布
            </button>
          </section>

          <section className="travel-card">
            <h2 className="travel-h2">广场</h2>
            <ul className="travel-feed-list">
              {feed.map((p) => {
                const st = p.statusId ? statusById(p.statusId) : null
                return (
                  <li key={p.id} className="travel-feed-item">
                    <div className="travel-feed-head">
                      <span>{p.authorEmoji}</span>
                      <strong>{p.authorName}</strong>
                      {st && (
                        <span className="travel-feed-status">
                          {st.emoji} {st.label}
                        </span>
                      )}
                      <span className="travel-meta travel-feed-time">
                        {formatStatusAgo(p.createdAt)}
                      </span>
                    </div>
                    <p className="travel-feed-body">{p.body}</p>
                    {p.destinationLabel && (
                      <p className="travel-meta">
                        📍 {p.destinationLabel}
                        {p.tripStart && p.tripEnd
                          ? ` · ${p.tripStart}–${p.tripEnd}`
                          : ''}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  )
}
