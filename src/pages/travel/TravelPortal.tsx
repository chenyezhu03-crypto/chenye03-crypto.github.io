import { Link } from 'react-router-dom'
import { PlatformDisclaimer } from '../../components/travel/PlatformDisclaimer'
import { HOME_ADVANTAGES, PLATFORM, V1_PRICING } from '../../platform/manifest'
import { PLATFORM_MODULES } from '../../platform/moduleRegistry'

export function TravelPortal() {
  return (
    <div className="portal-page">
      <header className="portal-header">
        <p className="portal-logo">{PLATFORM.name}</p>
        <p className="portal-tag">仅中文 · 中国大陆用户 · 中国护照出境视角</p>
        <nav className="portal-nav">
          <a href="#features">能力</a>
          <a href="#pricing">定价</a>
          <Link to="/travel/hub">进入应用</Link>
        </nav>
      </header>

      <section className="portal-hero">
        <h1>
          纠结去哪？
          <br />
          <span className="portal-hero-accent">转盘抽 · Word 攻略一键出</span>
        </h1>
        <p className="portal-lead">
          全球盲盒抽签引流，私有知识库结构化行程，社区创作与赛事生态——
          工具、内容、变现一条龙（Web 原型，本地或自建部署）。
        </p>
        <div className="portal-cta-row">
          <Link className="portal-btn portal-btn-primary" to="/travel/spin">
            立即抽签
          </Link>
          <Link className="portal-btn portal-btn-ghost" to="/travel/custom">
            直接做攻略
          </Link>
          <Link className="portal-btn portal-btn-ghost" to="/travel/hub">
            全部功能
          </Link>
        </div>
      </section>

      <section id="features" className="portal-section">
        <h2>七大优势</h2>
        <ul className="portal-list">
          {HOME_ADVANTAGES.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <section className="portal-section">
        <h2>模块一览</h2>
        <div className="portal-grid">
          {PLATFORM_MODULES.filter((m) => m.id !== 'roadmap').map((m) => (
            <Link key={m.id} className="portal-card" to={m.path}>
              <span className="portal-card-emoji">{m.emoji}</span>
              <strong>{m.title}</strong>
              <span>{m.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="pricing" className="portal-section portal-pricing">
        <h2>V1 定价</h2>
        <div className="portal-price-row">
          <article>
            <h3>免费</h3>
            <p className="portal-price">¥0</p>
            <p>盲盒 · 行程大纲预览</p>
          </article>
          <article>
            <h3>适配测评</h3>
            <p className="portal-price">¥{V1_PRICING.assessmentReportCny}</p>
            <p>分数 · 风险 · 是否适合</p>
          </article>
          <article>
            <h3>Word 攻略</h3>
            <p className="portal-price">¥{V1_PRICING.wordExportCny}</p>
            <p>逐日 · 预算 · 避坑 · 行李</p>
          </article>
          <article>
            <h3>年会员</h3>
            <p className="portal-price">¥{V1_PRICING.membershipYearCny}</p>
            <p>次数与权益（接入支付后）</p>
          </article>
        </div>
        <Link className="portal-btn portal-btn-primary" to="/travel/pricing">
          查看付费说明
        </Link>
      </section>

      <footer className="portal-footer">
        <PlatformDisclaimer variant="full" />
        <p className="portal-meta">
          <Link to="/toujian">投简 · 求职工具</Link>
          {' · '}
          <Link to="/travel/roadmap">产品框架</Link>
        </p>
      </footer>
    </div>
  )
}
