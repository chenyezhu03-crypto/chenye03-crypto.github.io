import { Link } from 'react-router-dom'
import { MEMBERSHIP_BLURB } from '../../data/platformContentSeed'
import { loadCommunityProfile } from '../../lib/travelCommunityStorage'
import { purchasedIds } from '../../lib/ugcStorage'
import { statusById } from '../../data/travelStatusPresets'

export function TravelMine() {
  const profile = loadCommunityProfile()
  const st = statusById(profile.statusId)

  return (
    <main className="travel-page">
      <section className="travel-card travel-community-my-status">
        <div className="travel-status-avatar">
          <span className="travel-status-emoji">{profile.avatarEmoji}</span>
          <span className="travel-status-ring">{st.emoji}</span>
        </div>
        <div>
          <strong>{profile.displayName}</strong>
          <p className="travel-status-line">
            {st.emoji} {profile.statusText || st.label}
          </p>
          <p className="travel-meta">
            {profile.destinationLabel} · {profile.tripStart} → {profile.tripEnd}
          </p>
        </div>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">会员</h2>
        <p className="travel-meta">
          ¥{MEMBERSHIP_BLURB.month}/月 · ¥{MEMBERSHIP_BLURB.year}/年（支付接入中）
        </p>
        <ul className="travel-bullets">
          {MEMBERSHIP_BLURB.perks.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <Link className="btn btn-ghost travel-btn-block" to="/travel/pricing">
          付费中心
        </Link>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">订单 & 库</h2>
        <Link className="travel-foot-link" to="/travel/ugc">
          已购攻略 {purchasedIds().length} 份
        </Link>
        <Link className="travel-foot-link" to="/travel/custom">
          我的 Word 行程
        </Link>
        <Link className="travel-foot-link" to="/travel/community">
          黑名单 / 收藏（规划）
        </Link>
      </section>

      <section className="travel-card">
        <Link className="btn btn-primary travel-btn-block" to="/travel/hub">
          全部功能入口
        </Link>
        <Link className="travel-foot-link" to="/toujian">
          投简 · 求职投递（同站另一产品）
        </Link>
      </section>
    </main>
  )
}
