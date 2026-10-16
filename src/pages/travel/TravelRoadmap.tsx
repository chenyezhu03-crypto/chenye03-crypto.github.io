import { Link } from 'react-router-dom'
import {
  ABSOLUTE_RULES,
  HOME_ADVANTAGES,
  PLATFORM,
  PLATFORM_FEES,
  RELEASE_PHASES,
  V1_PRICING,
} from '../../platform/manifest'
import { PlatformDisclaimer } from '../../components/travel/PlatformDisclaimer'

export function TravelRoadmap() {
  return (
    <main className="travel-page">
      <section className="travel-card">
        <h1 className="travel-h1">{PLATFORM.name}</h1>
        <p className="travel-lead">
          服务<strong>中国大陆用户</strong>（仅中文）。下面 V1–V6 来自「你和 AI
          聊想法后整理的产品框架」，是<strong>方向清单</strong>，不是承诺已全部开发。
          当前仓库<strong>只有 V1 原型能点能演示</strong>；改优先级请直接说，以你的决定为准。
        </p>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">V1 定价（已接入代码）</h2>
        <ul className="travel-bullets">
          <li>免费：盲盒抽签 + 行程大纲预览</li>
          <li>¥{V1_PRICING.assessmentReportCny}：目的地适配测评</li>
          <li>¥{V1_PRICING.wordExportCny}：完整 Word 攻略导出</li>
          <li>
            会员：¥{V1_PRICING.membershipMonthCny}/月 · ¥{V1_PRICING.membershipYearCny}/年（接入中）
          </li>
        </ul>
        <Link className="btn btn-primary travel-btn-block" to="/travel/pricing">
          去定价页
        </Link>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">开发顺序</h2>
        <ol className="travel-steps">
          {RELEASE_PHASES.map((p) => (
            <li key={p.id}>
              <strong>
                {p.id} · {p.title}
              </strong>
              {p.status === 'prototype' && (
                <span className="travel-roadmap-now"> 可点演示</span>
              )}
              {p.status === 'in_progress' && (
                <span className="travel-roadmap-now"> 进行中</span>
              )}
              <br />
              <span className="travel-meta">{p.goal}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">核心优势（首页文案）</h2>
        <ul className="travel-bullets">
          {HOME_ADVANTAGES.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <section className="travel-card">
        <h2 className="travel-h2">平台绝对规则</h2>
        <ul className="travel-bullets">
          {ABSOLUTE_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="travel-meta">
          助农费率（写死）：税后 {PLATFORM_FEES.agricultureAfterTaxRate * 100}% · UGC 打赏{' '}
          {PLATFORM_FEES.ugcTipRate * 100}% · 付费攻略 {PLATFORM_FEES.ugcPaidGuideRate * 100}%
        </p>
      </section>

      <section className="travel-card">
        <PlatformDisclaimer variant="full" />
        <Link className="travel-foot-link" to="/travel">
          回首页
        </Link>
      </section>
    </main>
  )
}
