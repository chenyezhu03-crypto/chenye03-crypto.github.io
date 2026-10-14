import type { Job } from '../lib/types'

export function RequirementPanel({ job }: { job: Job }) {
  const s = job.structured
  const rows: Array<[string, string]> = [
    [
      '学历必须',
      s.educationMin
        ? `${s.educationMin}及以上${s.eliteSchoolRequired ? ' · 名校批次' : ''}`
        : s.eliteSchoolRequired
          ? '名校批次硬门槛'
          : '未写明',
    ],
    [
      '学历优先',
      s.educationPrefer ? s.educationPrefer : '无',
    ],
    [
      '专业必须',
      s.majorsRequired?.length ? s.majorsRequired.join(' / ') : '不限/未写明',
    ],
    [
      '专业优先',
      s.majorsPreferred?.length ? s.majorsPreferred.join(' / ') : '无',
    ],
    [
      '经验',
      s.yearsMin != null
        ? s.yearsMax
          ? `${s.yearsMin}-${s.yearsMax} 年`
          : `${s.yearsMin}+ 年`
        : s.yearsFuzzy
          ? '有相关经验即可'
          : s.studentOnly
            ? '应届/实习'
            : '未写明',
    ],
    ['性别标注', s.genderPref === '不限' ? '不限/未限制' : `原文：${s.genderPref}`],
    [
      '必备技能',
      s.skillsRequired?.length ? s.skillsRequired.join(' / ') : '未抽到',
    ],
    [
      '加分技能',
      s.skillsPreferred?.length ? s.skillsPreferred.join(' / ') : '无',
    ],
    ['语言', s.languages?.length ? s.languages.join(' / ') : '未写明'],
    ['办公方式', s.workMode || '不限'],
  ]

  return (
    <div className="req-panel">
      <p className="req-title">条件透视（从 JD 详情抽取）</p>
      <dl className="req-grid">
        {rows.map(([k, v]) => (
          <div key={k} className="req-item">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {s.rawSignals?.length ? (
        <p className="req-signals">
          原文信号：{s.rawSignals.slice(0, 6).join(' · ')}
        </p>
      ) : null}
    </div>
  )
}
