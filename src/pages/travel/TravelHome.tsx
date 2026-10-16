import { Link, useNavigate } from 'react-router-dom'
import {
  loadTravelPlanMode,
  planModeLabel,
  saveTravelPlanMode,
  clearTravelPlanMode,
} from '../../lib/travelPlanMode'
import { travelCustomPath } from '../../lib/travelCustomLink'
import { HOME_ADVANTAGES, PLATFORM } from '../../platform/manifest'
import { PLATFORM_MODULES } from '../../platform/moduleRegistry'

export function TravelHome() {
  const navigate = useNavigate()
  const current = loadTravelPlanMode()

  function chooseHasPlan() {
    saveTravelPlanMode('has_plan')
    navigate(travelCustomPath())
  }

  function chooseNeedsHelp() {
    saveTravelPlanMode('needs_help')
    navigate('/travel/region')
  }

  return (
    <main className="travel-page">
      <section className="travel-card travel-hero-card">
        <p className="travel-path-step">第一步</p>
        <h1>{PLATFORM.name}</h1>
        <p className="travel-lead">
          仅中文 · 中国护照视角。先问：顾客是否已有出行计划？{' '}
          <strong>有计划</strong> → 行程/Word/测评；{' '}
          <strong>没想好</strong> → 全球盲盒大转盘帮选。
        </p>

        {current && (
          <p className="travel-geo-crumb">
            当前选择：{planModeLabel(current)}
            <button
              type="button"
              className="travel-chip-remove travel-plan-reset"
              onClick={() => clearTravelPlanMode()}
            >
              重选
            </button>
          </p>
        )}

        <div className="travel-path-grid">
          <section className="travel-path-card travel-path-primary">
            <h2 className="travel-h2">有计划</h2>
            <p className="travel-meta">
              大概知道去哪、几号走（或客户已经说定了）→{' '}
              <strong>不需要大转盘</strong>，直接做 Word 模版攻略。
            </p>
            <button
              type="button"
              className="btn btn-primary travel-btn-block"
              onClick={chooseHasPlan}
            >
              进入第二步 · 做 Word 攻略
            </button>
          </section>

          <section className="travel-path-card">
            <h2 className="travel-h2">还没想好</h2>
            <p className="travel-meta">
              目的地不确定 → 先 <strong>地区分级</strong>，再{' '}
              <strong>大转盘 / 抽 3 个</strong>，定下来后再做 Word。
            </p>
            <button
              type="button"
              className="btn btn-ghost travel-btn-block"
              onClick={chooseNeedsHelp}
            >
              需要大转盘 · 帮选目的地
            </button>
            <Link
              className="travel-foot-link"
              to="/travel/spin"
              onClick={() => saveTravelPlanMode('needs_help')}
            >
              跳过地区，直接转（仍算「帮选」）
            </Link>
          </section>
        </div>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">流程示意</h2>
        <ol className="travel-steps">
          <li>
            <strong>第一步（本页）</strong>：有没有计划？要不要转盘？
          </li>
          <li>
            <strong>第二步</strong>：填日期、地点、套餐 → 导出 Word（两条路最后都到这里）
          </li>
        </ol>
        <p className="travel-note">
          底部 Tab：<strong>盲盒</strong>抽签 · <strong>社区</strong>状态 · <strong>全部</strong>
          打开 V1–V6 各模块 · <strong>我的</strong>订单与会员。
        </p>
        <Link className="btn btn-primary travel-btn-block" to="/travel/hub">
          进入全部功能（按你的框架 V1–V6）
        </Link>
        <Link className="btn btn-ghost travel-btn-block" to="/travel/pricing">
          V1 定价：免费 + ¥5.99 测评 + ¥19.99 Word
        </Link>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">快捷入口</h2>
        <ul className="travel-hub-grid travel-hub-grid-compact">
          {PLATFORM_MODULES.filter((m) => m.id !== 'roadmap')
            .slice(0, 8)
            .map((m) => (
              <li key={m.id}>
                <Link className="travel-hub-card" to={m.path}>
                  <span className="travel-hub-emoji">{m.emoji}</span>
                  <strong>{m.title}</strong>
                </Link>
              </li>
            ))}
        </ul>
        <Link className="travel-foot-link" to="/travel/hub">
          查看全部 {PLATFORM_MODULES.length} 个模块 →
        </Link>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">平台定位（长期）</h2>
        <ul className="travel-bullets">
          {HOME_ADVANTAGES.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
