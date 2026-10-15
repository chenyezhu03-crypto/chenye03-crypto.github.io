import { Link } from 'react-router-dom'
import { DESTINATIONS } from '../../data/destinations'
import { travelCustomPath } from '../../lib/travelCustomLink'
import { filterDestinations } from '../../lib/travelMatch'
import { loadTravelPrefs } from '../../lib/travelStorage'

export function TravelHome() {
  const prefs = loadTravelPrefs()
  const pool = filterDestinations(prefs)

  return (
    <main className="travel-page">
      <section className="travel-card travel-hero-card">
        <h1>去哪玩 · 决策或攻略</h1>
        <p className="travel-lead">
          顾客可以<strong>不用大转盘</strong>：已经知道去哪、几号走，直接做
          <strong> Word 模版攻略</strong>。只有「选不出来」时才用转盘和地区分级。
        </p>

        <div className="travel-path-grid">
          <section className="travel-path-card travel-path-primary">
            <p className="travel-path-step">第二步 · 主路径</p>
            <h2 className="travel-h2">直接做攻略</h2>
            <p className="travel-meta">
              填日期、目的地、预算 → 选免费简版或完整 Word 实稿，无需转盘。
            </p>
            <Link className="btn btn-primary travel-btn-block" to={travelCustomPath()}>
              开始定制 Word 攻略
            </Link>
          </section>

          <section className="travel-path-card">
            <p className="travel-path-step">第一步 · 可选</p>
            <h2 className="travel-h2">先帮顾客选去哪</h2>
            <p className="travel-meta">
              地区分级 → 大转盘 / 抽 3 个 → 满意后再进「做攻略」。
            </p>
            <Link className="btn btn-ghost travel-btn-block" to="/travel/region">
              选地区 / 转盘
            </Link>
            <Link className="btn btn-ghost travel-btn-block" to="/travel/spin">
              跳过地区，直接转
            </Link>
          </section>
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
          <span>条路径</span>
        </div>
      </div>

      <section className="travel-card">
        <h2 className="travel-h2">两条路怎么连</h2>
        <ol className="travel-steps">
          <li>
            <strong>知道去哪</strong> → 定制页（第二步）→ 下载 Word
          </li>
          <li>
            <strong>不知道去哪</strong> → 转盘定城市 → 详情里点「做 Word 攻略」→ 同样进第二步
          </li>
        </ol>
        <p className="travel-note">
          演示库覆盖国内热门与部分出境短目的地；真实出行请以签证、航司与当地政策为准。
        </p>
      </section>
    </main>
  )
}
