import { Link } from 'react-router-dom'
import { PLATFORM_MODULES } from '../../platform/moduleRegistry'
import { PLATFORM } from '../../platform/manifest'

export function TravelHub() {
  const byPhase = PLATFORM_MODULES.reduce<Record<string, typeof PLATFORM_MODULES>>(
    (acc, m) => {
      const p = m.phase
      if (!acc[p]) acc[p] = []
      acc[p].push(m)
      return acc
    },
    {},
  )

  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">{PLATFORM.name}</h1>
        <p className="travel-lead">
          按你提供的完整产品框架，<strong>V1–V6 模块入口都在这</strong>。
          当前为 Web 原型（本地演示数据），上线后接小程序与后端。
        </p>
      </section>

      {Object.entries(byPhase).map(([phase, mods]) => (
        <section key={phase} className="travel-card">
          <h2 className="travel-h2">{phase}</h2>
          <ul className="travel-hub-grid">
            {mods.map((m) => (
              <li key={m.id}>
                <Link className="travel-hub-card" to={m.path}>
                  <span className="travel-hub-emoji">{m.emoji}</span>
                  <strong>{m.title}</strong>
                  <span className="travel-meta">{m.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
