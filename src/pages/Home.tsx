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
            先看清条件，再聪明投递
          </h1>
          <p className="hero-lead animate-rise delay-2">
            多源岗位汇聚 · 学历/专业/性别标注透视 · 按岗位自适应生成投递内容
          </p>
          <div className="hero-actions animate-rise delay-3">
            <Link className="btn btn-primary" to="/sources">
              接入数据源
            </Link>
            <Link className="btn btn-ghost" to="/batch">
              批量投递队列
            </Link>
          </div>
        </div>
      </section>

      <section className="section how" aria-labelledby="diff-title">
        <h2 id="diff-title">和海投工具不一样</h2>
        <p className="section-lead">
          市面常见路径是「自动打招呼 / 代填网申」。投简把重点放在条件可解释与投递材料自适应——投得少，但投得准、投得明白。
        </p>
        <ol className="how-list">
          <li>
            <span className="how-step">01</span>
            <strong>真实汇聚</strong>
            <p>开放 API（Remotive）+ 国内演示源 + 自有 JSON 导入，统一进岗位雷达。</p>
          </li>
          <li>
            <span className="how-step">02</span>
            <strong>多版简历</strong>
            <p>技术向 / 业务向自动切换，匹配分与投递角度跟着岗位变。</p>
          </li>
          <li>
            <span className="how-step">03</span>
            <strong>硬门槛批量</strong>
            <p>队列只收通过项，一键投递并保留版本与匹配复盘。</p>
          </li>
        </ol>
      </section>
    </main>
  )
}
