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
          填几项偏好，大转盘从合适的目的地里帮你定一个；也可以直接盲抽，少纠结一点。
        </p>
        <ol className="travel-steps">
          <li>说说预算、时间、想玩什么</li>
          <li>在转盘上转一次（或盲抽）</li>
          <li>看攻略要点，不满意就再转</li>
        </ol>
        <div className="travel-actions">
          <Link className="btn btn-primary travel-btn-block" to="/travel/prefs">
            设置我的偏好
          </Link>
          <Link className="btn btn-ghost travel-btn-block" to="/travel/spin">
            已有偏好，去转盘
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
