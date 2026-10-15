import { Link } from 'react-router-dom'
import hero from '../assets/hero.jpg'
import { publicPage } from '../lib/siteUrl'

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
            企业社招与国考 / 上海市考选岗 · 学历 / 专业 / 基层经历透视 · 按岗位自适应生成投递内容
          </p>
          <div className="hero-actions animate-rise delay-3">
            <Link className="btn btn-primary" to="/jobs">
              打开岗位雷达
            </Link>
            <Link className="btn btn-ghost" to="/profile">
              完善求职画像
            </Link>
            <Link className="btn btn-ghost" to="/pick">
              公考选岗助手（轻量版）
            </Link>
            <Link className="btn btn-ghost" to="/travel">
              去哪玩 · 旅游转盘
            </Link>
          </div>
          <p className="hero-online animate-rise delay-3">
            在线直接打开（无需本地 npm）：
            <a href={publicPage('/pick')}>选岗助手</a>
            <span aria-hidden="true"> · </span>
            <a href={publicPage('/jobs')}>岗位雷达</a>
          </p>
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
            <strong>条件透视</strong>
            <p>
              从 JD 或职位表原文抽取学历、专业、学位、基层经历、政治面貌与性别标注等字段，公考选岗也能一眼对照。
            </p>
          </li>
          <li>
            <span className="how-step">02</span>
            <strong>可解释匹配</strong>
            <p>对照你的求职画像打分，标明通过 / 接近 / 缺口，硬门槛一眼可见。</p>
          </li>
          <li>
            <span className="how-step">03</span>
            <strong>自适应投递包</strong>
            <p>同一份档案，面对不同岗位自动调整自荐角度与强调点，而不是复制粘贴。</p>
          </li>
        </ol>
      </section>
    </main>
  )
}
