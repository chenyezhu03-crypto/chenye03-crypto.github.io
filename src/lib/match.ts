import { educationRank } from './jdParser'
import type { Job, MatchDimension, MatchResult, UserProfile } from './types'

function majorHit(profileMajor: string, required: string[]): boolean {
  if (!required.length) return true
  const p = profileMajor.toLowerCase()
  return required.some((m) => p.includes(m.toLowerCase()) || m.toLowerCase().includes(p))
}

export function matchJob(profile: UserProfile, job: Job): MatchResult {
  const s = job.structured
  const dimensions: MatchDimension[] = []
  const blockers: string[] = []

  // 学历
  if (s.educationMin) {
    const ok = educationRank(profile.education) >= educationRank(s.educationMin)
    dimensions.push({
      key: 'education',
      label: '学历',
      status: ok ? '通过' : '缺口',
      weight: 28,
      detail: ok
        ? `你的${profile.education}满足「${s.educationMin}及以上」`
        : `岗位要求${s.educationMin}及以上，你当前为${profile.education}`,
    })
    if (!ok) blockers.push(`学历未达 ${s.educationMin}`)
  } else {
    dimensions.push({
      key: 'education',
      label: '学历',
      status: '无关',
      weight: 0,
      detail: '岗位未写明硬性学历门槛',
    })
  }

  if (s.educationPrefer) {
    const ok = educationRank(profile.education) >= educationRank(s.educationPrefer)
    dimensions.push({
      key: 'eduPrefer',
      label: '学历偏好',
      status: ok ? '通过' : '接近',
      weight: 8,
      detail: ok
        ? `已达到偏好学历 ${s.educationPrefer}`
        : `岗位偏好 ${s.educationPrefer}，可作为加分项补齐`,
    })
  }

  // 专业
  if (s.majors.length) {
    const hit = majorHit(profile.major, s.majors)
    if (hit) {
      dimensions.push({
        key: 'major',
        label: '专业',
        status: '通过',
        weight: 22,
        detail: `专业「${profile.major}」与要求吻合`,
      })
    } else if (s.majorFlexible) {
      dimensions.push({
        key: 'major',
        label: '专业',
        status: '接近',
        weight: 14,
        detail: `要求偏 ${s.majors.join('/')}，但原文为优先项，可用项目/技能补齐`,
      })
    } else {
      dimensions.push({
        key: 'major',
        label: '专业',
        status: '缺口',
        weight: 22,
        detail: `要求 ${s.majors.join('/')}，你的专业是 ${profile.major || '未填'}`,
      })
      blockers.push('专业匹配不足')
    }
  } else {
    dimensions.push({
      key: 'major',
      label: '专业',
      status: '通过',
      weight: 10,
      detail: s.majorFlexible ? '专业不限' : '未抽取到明确专业要求',
    })
  }

  if (s.degreeRequired) {
    const ok = profile.hasDegree
    dimensions.push({
      key: 'degree',
      label: '学位',
      status: ok ? '通过' : '缺口',
      weight: 14,
      detail: ok
        ? '已取得与学历相应的学位'
        : '岗位明确要求取得相应学位，需在报名前确认证书情况',
    })
    if (!ok) blockers.push('未取得相应学位')
  }

  if (s.political === '党员') {
    const ok = profile.isPartyMember
    dimensions.push({
      key: 'political',
      label: '政治面貌',
      status: ok ? '通过' : '缺口',
      weight: 16,
      detail: ok ? '符合中共党员要求' : '岗位要求中共党员（含预备党员）',
    })
    if (!ok) blockers.push('政治面貌不符')
  } else if (s.political === '中共党员或共青团员') {
    dimensions.push({
      key: 'political',
      label: '政治面貌',
      status: profile.isPartyMember ? '通过' : '接近',
      weight: 10,
      detail: profile.isPartyMember
        ? '符合党员要求'
        : '原文为党员或团员，请在画像中确认团员身份（演示版仅采集党员）',
    })
  }

  if (s.grassrootsYearsMin != null && s.grassrootsYearsMin > 0) {
    const ok = profile.grassrootsYears >= s.grassrootsYearsMin
    const near = !ok && profile.grassrootsYears >= s.grassrootsYearsMin - 1
    dimensions.push({
      key: 'grassroots',
      label: '基层经历',
      status: ok ? '通过' : near ? '接近' : '缺口',
      weight: 20,
      detail: ok
        ? `基层 ${profile.grassrootsYears} 年满足 ${s.grassrootsYearsMin}+ 年`
        : `要求基层 ${s.grassrootsYearsMin}+ 年，你自述 ${profile.grassrootsYears} 年`,
    })
    if (!ok && !near) blockers.push(`基层经历未达 ${s.grassrootsYearsMin} 年`)
  }

  // 经验 / 在校
  if (s.studentOnly) {
    const ok = profile.isStudent || profile.years <= 1
    dimensions.push({
      key: 'stage',
      label: '求职阶段',
      status: ok ? '通过' : '缺口',
      weight: 16,
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
      weight: 18,
      detail: ok
        ? `${profile.years} 年经验满足 ${s.yearsMin}+ 年`
        : `要求 ${s.yearsMin}+ 年，你当前 ${profile.years} 年`,
    })
    if (!ok && !near) blockers.push(`经验未达 ${s.yearsMin} 年`)
  }

  // 性别（仅作原文标注提示，不作为默认硬拦截）
  if (s.genderPref !== '不限') {
    const aligned =
      profile.gender !== '不愿透露' && profile.gender === s.genderPref
    dimensions.push({
      key: 'gender',
      label: '性别标注',
      status: aligned ? '通过' : '接近',
      weight: 6,
      detail: aligned
        ? `与岗位原文标注「${s.genderPref}」一致`
        : `岗位原文标注「${s.genderPref}」，属于公示信息，是否投递请自行判断`,
    })
  } else {
    dimensions.push({
      key: 'gender',
      label: '性别标注',
      status: '通过',
      weight: 4,
      detail: '岗位写明男女不限 / 未作限制',
    })
  }

  // 技能/方向软匹配
  const skillPool = [...profile.skills, ...profile.targetRoles].map((x) =>
    x.toLowerCase(),
  )
  const jobTokens = [...job.tags, job.title, ...job.requirements]
    .join(' ')
    .toLowerCase()
  const skillHits = skillPool.filter((s) => s && jobTokens.includes(s))
  dimensions.push({
    key: 'skills',
    label: '技能方向',
    status: skillHits.length >= 2 ? '通过' : skillHits.length === 1 ? '接近' : '缺口',
    weight: 16,
    detail: skillHits.length
      ? `命中：${skillHits.slice(0, 4).join('、')}`
      : '画像技能与 JD 关键词重合较少，投递信需主动对齐',
  })

  const active = dimensions.filter((d) => d.weight > 0)
  const earned = active.reduce((sum, d) => {
    if (d.status === '通过') return sum + d.weight
    if (d.status === '接近') return sum + d.weight * 0.55
    if (d.status === '无关') return sum
    return sum
  }, 0)
  const total = active.reduce((sum, d) => sum + d.weight, 0) || 1
  const score = Math.round((earned / total) * 100)

  // 硬门槛：学历缺口、明确专业硬缺口、阶段硬缺口
  const hardPass = !dimensions.some(
    (d) =>
      d.status === '缺口' &&
      (d.key === 'education' ||
        d.key === 'major' ||
        d.key === 'stage' ||
        d.key === 'years' ||
        d.key === 'degree' ||
        d.key === 'political' ||
        d.key === 'grassroots'),
  )

  const summary = hardPass
    ? score >= 80
      ? '硬性条件通过，整体契合度高，建议优先投递。'
      : '硬性条件大致通过，建议用自适应投递包补齐软性短板。'
    : '存在硬性缺口，仍可投递，但需在自荐信中主动解释迁移能力。'

  return { score, hardPass, blockers, dimensions, summary }
}
