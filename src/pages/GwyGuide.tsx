import { Link } from 'react-router-dom'
import { GUOKAO2027_GUIDE } from '../data/guokao2027Guide'

export function GwyGuide() {
  const g = GUOKAO2027_GUIDE

  return (
    <main className="page narrow">
      <header className="page-header">
        <h1>{g.title}</h1>
        <p className="section-lead">{g.sourceNote}</p>
      </header>

      <section className="section" aria-labelledby="gk-timeline">
        <h2 id="gk-timeline">2027 国考网报时间（指南摘录）</h2>
        <ul className="how-list">
          {g.timeline.map((t) => (
            <li key={t.label}>
              <strong>{t.label}</strong>
              <p>{t.window}</p>
            </li>
          ))}
        </ul>
        <p className="meta-line">时间节点仅供参考，以国家公务员局专题网站当年公告为准。</p>
      </section>

      <section className="section" aria-labelledby="gk-table">
        <h2 id="gk-table">职位表数据</h2>
        <p className="section-lead">
          已导入「{g.positionTable.fileLabel}」共{' '}
          <strong>{g.positionTable.count.toLocaleString('zh-CN')}</strong>{' '}
          条职位，可在岗位雷达中选择来源「国考」进行筛选与匹配。
        </p>
        <p className="meta-line">主要字段：{g.positionTable.columns.join('、')}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/jobs">
            打开岗位雷达 · 国考
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="gk-links">
        <h2 id="gk-links">常用网址</h2>
        <ul className="tag-list">
          {g.links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="gk-block">
        <h2 id="gk-block">不得报考情形（摘要）</h2>
        <ul className="match-dims">
          {g.cannotApply.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="gk-avoid">
        <h2 id="gk-avoid">回避原则（摘要）</h2>
        <p>{g.avoidance}</p>
      </section>

      <section className="section" aria-labelledby="gk-fresh">
        <h2 id="gk-fresh">应届生认定（摘要）</h2>
        <p>{g.freshGrad}</p>
      </section>

      <section className="section" aria-labelledby="gk-major">
        <h2 id="gk-major">专业与学历</h2>
        <ul className="match-dims">
          {g.majorTips.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="gk-grass">
        <h2 id="gk-grass">基层工作经历认定（摘要）</h2>
        <ul className="match-dims">
          {g.grassrootsTips.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
