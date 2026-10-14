import { educationRank } from './jdParser'
import type { Job, MatchDimension, MatchResult, UserProfile } from './types'

function majorHit(profileMajor: string, required: string[]): boolean {
  if (!required.length) return true
  const p = profileMajor.toLowerCase()
  return required.some(
    (m) => p.includes(m.toLowerCase()) || m.toLowerCase().includes(p),
  )
}

export function matchJob(profile: UserProfile, job: Job): MatchResult {
  const s = job.structured
  const dimensions: MatchDimension[] = []
  const blockers: string[] = []

  if (s.educationMin) {
    const ok = educationRank(profile.education) >= educationRank(s.educationMin)
    dimensions.push({
      key: 'education',
      label: '学历必须',
      status: ok ? '通过' : '缺口',
      weight: 26,
      detail: ok
        ? `你的${profile.education}满足「${s.educationMin}及以上」`
        : `岗位要求${s.educationMin}及以上，你当前为${profile.education}`,
    })
    if (!ok) blockers.push(`学历未达 ${s.educationMin}`)
  } else {
    dimensions.push({
      key: 'education',
      label: '学历必须',
      status: '无关',
      weight: 0,
      detail: '未抽到明确学历硬门槛',
    })
  }

  if (s.eliteSchoolRequired) {
    const ok = Boolean(profile.eliteSchool)
    dimensions.push({
      key: 'elite',
      label: '名校批次',
      status: ok ? '通过' : '缺口',
      weight: 14,
      detail: ok
        ? '画像标注满足 985/211/双一流等批次要求'
        : '岗位含 985/211/双一流等硬门槛，画像未勾选名校',
    })
    if (!ok) blockers.push('名校/批次硬门槛未满足')
  }

  if (s.educationPrefer) {
    const ok = educationRank(profile.education) >= educationRank(s.educationPrefer)
    dimensions.push({
      key: 'eduPrefer',
      label: '学历优先',
      status: ok ? '通过' : '接近',
      weight: 6,
      detail: ok
        ? `已达到优先学历 ${s.educationPrefer}`
        : `岗位优先 ${s.educationPrefer}，可作为加分项`,
    })
  }

  const requiredMajors = s.majorsRequired?.length
    ? s.majorsRequired
    : []
  const preferredMajors = s.majorsPreferred?.length ? s.majorsPreferred : []

  if (requiredMajors.length) {
    const hit = majorHit(profile.major, requiredMajors)
    if (hit) {
      dimensions.push({
        key: 'major',
        label: '专业必须',
        status: '通过',
        weight: 20,
        detail: `专业「${profile.major}」命中必须项`,
      })
    } else if (s.majorFlexible) {
      dimensions.push({
        key: 'major',
        label: '专业必须',
        status: '接近',
        weight: 12,
        detail: `要求偏 ${requiredMajors.join('/')}，但允许相关专业迁移`,
      })
    } else {
      dimensions.push({
        key: 'major',
        label: '专业必须',
        status: '缺口',
        weight: 20,
        detail: `必须 ${requiredMajors.join('/')}，你是 ${profile.major || '未填'}`,
      })
      blockers.push('专业必须项不匹配')
    }
  } else if (preferredMajors.length) {
    const hit = majorHit(profile.major, preferredMajors)
    dimensions.push({
      key: 'major',
      label: '专业优先',
      status: hit ? '通过' : '接近',
      weight: 10,
      detail: hit
        ? `命中优先专业 ${preferredMajors.join('/')}`
        : `优先 ${preferredMajors.join('/')}，非硬性`,
    })
  } else {
    dimensions.push({
      key: 'major',
      label: '专业',
      status: '通过',
      weight: 8,
      detail: s.majorFlexible ? '专业不限 / 较灵活' : '未抽到明确专业要求',
    })
  }

  if (s.studentOnly) {
    const ok = profile.isStudent || profile.years <= 1
    dimensions.push({
      key: 'stage',
      label: '求职阶段',
      status: ok ? '通过' : '缺口',
      weight: 14,
      detail: ok ? '符合在校/应届取向' : '岗位偏校招/实习，你的年限偏社招',
    })
    if (!ok) blockers.push('岗位面向在校/应届')
  } else if (s.yearsMin != null && s.yearsMin > 0) {
    const ok = profile.years >= s.yearsMin
    const near = !ok && profile.years >= s.yearsMin - 1
    dimensions.push({
      key: 'years',
      label: '经验',
      status: ok ? '通过' : near ? '接近' : '缺口',
      weight: 16,
      detail: ok
        ? `${profile.years} 年满足 ${s.yearsMin}+ 年`
        : `要求 ${s.yearsMin}+ 年，你当前 ${profile.years} 年`,
    })
    if (!ok && !near) blockers.push(`经验未达 ${s.yearsMin} 年`)
  } else if (s.yearsFuzzy) {
    dimensions.push({
      key: 'years',
      label: '经验',
      status: '接近',
      weight: 6,
      detail: '原文只写「有相关经验」，按软门槛处理',
    })
  }

  if (s.genderPref !== '不限') {
    const aligned =
      profile.gender !== '不愿透露' && profile.gender === s.genderPref
    dimensions.push({
      key: 'gender',
      label: '性别标注',
      status: aligned ? '通过' : '接近',
      weight: 4,
      detail: aligned
        ? `与原文标注「${s.genderPref}」一致`
        : `原文标注「${s.genderPref}」，仅公示不默认拦截`,
    })
  }

  const skillPool = [...profile.skills, ...profile.targetRoles].map((x) =>
    x.toLowerCase(),
  )
  const requiredSkills = (s.skillsRequired || []).map((x) => x.toLowerCase())
  const preferredSkills = (s.skillsPreferred || []).map((x) => x.toLowerCase())
  const reqHits = requiredSkills.filter((sk) =>
    skillPool.some((p) => p.includes(sk) || sk.includes(p)),
  )
  const prefHits = preferredSkills.filter((sk) =>
    skillPool.some((p) => p.includes(sk) || sk.includes(p)),
  )

  if (requiredSkills.length) {
    const ratio = reqHits.length / requiredSkills.length
    dimensions.push({
      key: 'skills',
      label: '必备技能',
      status: ratio >= 0.5 ? '通过' : ratio > 0 ? '接近' : '缺口',
      weight: 16,
      detail: reqHits.length
        ? `命中 ${reqHits.length}/${requiredSkills.length}：${reqHits.slice(0, 4).join('、')}`
        : `未命中必备：${requiredSkills.slice(0, 4).join('、')}`,
    })
  } else {
    dimensions.push({
      key: 'skills',
      label: '技能方向',
      status: prefHits.length || skillPool.length ? '接近' : '缺口',
      weight: 10,
      detail: prefHits.length
        ? `命中加分技能：${prefHits.slice(0, 3).join('、')}`
        : '未抽到明确必备技能，建议在自荐信对齐 JD 关键词',
    })
  }

  const active = dimensions.filter((d) => d.weight > 0)
  const earned = active.reduce((sum, d) => {
    if (d.status === '通过') return sum + d.weight
    if (d.status === '接近') return sum + d.weight * 0.55
    return sum
  }, 0)
  const total = active.reduce((sum, d) => sum + d.weight, 0) || 1
  const score = Math.round((earned / total) * 100)

  const hardPass = !dimensions.some(
    (d) =>
      d.status === '缺口' &&
      ['education', 'elite', 'major', 'stage', 'years'].includes(d.key),
  )

  const summary = hardPass
    ? score >= 80
      ? '硬性条件通过，整体契合度高，建议优先投递。'
      : '硬性条件大致通过，建议用自适应投递包补齐技能短板。'
    : '存在硬性缺口（学历/名校/专业/经验等），投递信需解释迁移能力。'

  return { score, hardPass, blockers, dimensions, summary }
}
