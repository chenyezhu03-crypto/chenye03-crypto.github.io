import { Link } from 'react-router-dom'
import { DESTINATIONS } from '../../data/destinations'
import { filterDestinations } from '../../lib/travelMatch'
import { loadTravelPrefs } from '../../lib/travelStorage'

export function TravelHome() {
  const prefs = loadTravelPrefs()
  const pool = filterDestinations(prefs)

  return (
    <main className="travel-page">
      <section className="travel-card travel-hero-card">
        <h1>选不出来，就转出来</h1>
        <p className="travel-lead">
          先按 <strong>国内/国外 → 大洲/大区 → 子区域 → 国家</strong>{' '}
          缩小范围，再一次<strong>抽 3 个</strong>城市备选；每层也可以交给转盘。
        </p>
        <ol className="travel-steps">
          <li>在「地区」里分级选到国家（或每层转盘）</li>
          <li>补充预算、月份、玩法（可选）</li>
          <li>抽 3 个目的地，或再转一次定一个</li>
        </ol>
        <div className="travel-actions">
          <Link className="btn btn-primary travel-btn-block" to="/travel/region">
            开始选地区
          </Link>
          <Link className="btn btn-ghost travel-btn-block" to="/travel/prefs">
            设置出行偏好
          </Link>
        </div>
      </section>

      <div className="travel-stats">
        <div className="travel-stat">
          <strong>{DESTINATIONS.length}</strong>
          <span>精选目的地</span>
        </div>
        <div className="travel-stat">
          <strong>{pool.length}</strong>
          <span>当前匹配</span>
        </div>
        <div className="travel-stat">
          <strong>2</strong>
          <span>种决定方式</span>
        </div>
      </div>

      <section className="travel-card">
        <h2 className="travel-h2">和攻略站不一样</h2>
        <ul className="travel-bullets">
          <li>不是信息流，而是帮你「做决定」</li>
          <li>转盘只从你符合条件的候选里出结果</li>
          <li>数据在本地浏览器，无需登录</li>
        </ul>
        <p className="travel-note">
          演示库覆盖国内热门与部分出境短目的地；真实出行请以签证、航司与当地政策为准。
        </p>
      </section>
    </main>
  )
}
