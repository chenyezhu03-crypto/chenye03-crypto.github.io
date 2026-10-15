import { Link } from 'react-router-dom'
import { GUOKAO2027_GUIDE } from '../../data/guokao2027Guide'
import { loadProfile, profileCompleteness } from '../../lib/profile'
import { loadPickFavorites } from '../../lib/pickStorage'
import { publicPage } from '../../lib/siteUrl'

export function PickHome() {
  const profile = loadProfile()
  const completeness = profileCompleteness(profile)
  const favCount = loadPickFavorites().length

  return (
    <main className="pick-page">
      <section className="pick-card pick-hero-card">
        <h1>三步完成选岗初筛</h1>
        <ol className="pick-steps">
          <li>填写学历、专业、学位与基层经历</li>
          <li>在选岗页按省份 / 关键词筛选</li>
          <li>收藏意向岗位，对照公告最终报名</li>
        </ol>
        <div className="pick-actions">
          <Link className="btn btn-primary pick-btn-block" to="/pick/profile">
            {completeness >= 70 ? '更新我的条件' : '开始填写条件'}
          </Link>
          <Link className="btn btn-ghost pick-btn-block" to="/pick/results">
            直接选岗
          </Link>
        </div>
      </section>

      <section className="pick-stats">
        <div className="pick-stat">
          <strong>{GUOKAO2027_GUIDE.positionTable.count.toLocaleString('zh-CN')}</strong>
          <span>2027 国考职位</span>
        </div>
        <div className="pick-stat">
          <strong>{completeness}%</strong>
          <span>条件完整度</span>
        </div>
        <div className="pick-stat">
          <strong>{favCount}</strong>
          <span>已收藏</span>
        </div>
      </section>

      <section className="pick-card">
        <h2>网报时间（指南摘录）</h2>
        <ul className="pick-list">
          {GUOKAO2027_GUIDE.timeline.map((t) => (
            <li key={t.label}>
              <strong>{t.label}</strong>
              <span>{t.window}</span>
            </li>
          ))}
        </ul>
        <p className="pick-note">以国家公务员局专题网站当年公告为准。</p>
      </section>

      <p className="pick-foot-link">
        在线地址（可收藏）：
        <a href={publicPage('/pick')}>{publicPage('/pick')}</a>
      </p>
      <p className="pick-foot-link">
        <Link to="/">返回投简完整版</Link>
        <span aria-hidden="true"> · </span>
        <a href={publicPage('/jobs')}>岗位雷达</a>
      </p>
    </main>
  )
}
