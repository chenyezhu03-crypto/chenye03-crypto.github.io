import { GUOKAO2027_GUIDE } from '../../data/guokao2027Guide'

export function PickGuide() {
  const g = GUOKAO2027_GUIDE

  return (
    <main className="pick-page">
      <section className="pick-card">
        <h1>选岗与备考要点</h1>
        <p className="pick-lead">{g.sourceNote}</p>
      </section>

      <section className="pick-card">
        <h2>常用网址</h2>
        <ul className="pick-links">
          {g.links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noreferrer">
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="pick-card">
        <h2>不得报考（摘要）</h2>
        <ul className="pick-bullets">
          {g.cannotApply.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="pick-card">
        <h2>回避原则（摘要）</h2>
        <p className="pick-text">{g.avoidance}</p>
      </section>

      <section className="pick-card">
        <h2>专业对照提醒</h2>
        <ul className="pick-bullets">
          {g.majorTips.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="pick-card">
        <h2>基层经历（摘要）</h2>
        <ul className="pick-bullets">
          {g.grassrootsTips.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
