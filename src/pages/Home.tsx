import { Link } from 'react-router-dom'
import hero from '../assets/hero.jpg'

export function Home() {
  return (
    <main>
      <section className="hero" aria-label="首页主视觉">
        <img
          className="hero-media"
          src={hero}
          alt="明亮办公空间中的工作桌面与窗外城市光影"
        />
        <div className="hero-scrim" />
        <div className="hero-content">
          <p className="brand-mark animate-rise">投简</p>
          <h1 className="hero-title animate-rise delay-1">
            一键投递，直达心仪岗位
          </h1>
          <p className="hero-lead animate-rise delay-2">
            精选机会，简洁表单，投递进度一目了然。
          </p>
          <div className="hero-actions animate-rise delay-3">
            <Link className="btn btn-primary" to="/jobs">
              浏览岗位
            </Link>
            <Link className="btn btn-ghost" to="/apply">
              立即投递
            </Link>
          </div>
        </div>
      </section>

      <section className="section how" aria-labelledby="how-title">
        <h2 id="how-title">三步完成投递</h2>
        <p className="section-lead">不堆砌信息，只保留求职真正需要的步骤。</p>
        <ol className="how-list">
          <li>
            <span className="how-step">01</span>
            <strong>挑选岗位</strong>
            <p>按城市、方向快速筛选开放职位。</p>
          </li>
          <li>
            <span className="how-step">02</span>
            <strong>填写简历要点</strong>
            <p>姓名、经历与一封简短自荐信即可。</p>
          </li>
          <li>
            <span className="how-step">03</span>
            <strong>跟踪进度</strong>
            <p>在「我的投递」查看状态与历史记录。</p>
          </li>
        </ol>
      </section>
    </main>
  )
}
