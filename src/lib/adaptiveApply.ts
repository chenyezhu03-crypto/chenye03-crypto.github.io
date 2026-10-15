import type { AdaptivePack, Job, MatchResult, UserProfile } from './types'

export function buildAdaptivePack(
  profile: UserProfile,
  job: Job,
  match: MatchResult,
): AdaptivePack {
  const warnings: string[] = []
  const emphasis: string[] = []
  const s = job.structured

  if (!match.hardPass) {
    warnings.push('存在硬性条件缺口，投递信会侧重可迁移能力与证据，而不是硬碰硬复述门槛。')
  }
  if (s.genderPref !== '不限') {
    warnings.push(
      `该岗位原文含性别标注「${s.genderPref}」。投简仅作条件透视展示，是否投递由你决定。`,
    )
  }

  const isGwy = job.sourceId === 'guokao' || job.sourceId === 'shanghai-gwy'

  // 侧重点随岗位变化
  if (isGwy) {
    emphasis.push(
      '与职位表专业目录的对应关系',
      '基层经历起止时间与证明口径',
      '政治面貌与学位材料一致性',
    )
    if (job.sourceId === 'guokao') {
      warnings.push(
        '国考需同时满足中央机关及其直属机构招考公告中的通用条件（年龄、学历学位、回避等），本页仅透视单条职位要求。',
      )
    } else {
      warnings.push(
        '上海市考还需对照本市招考简章的户籍、学历来源与基层经历认定规则，本页为演示级单职位透视。',
      )
    }
  } else if (job.tags.some((t) => /React|前端|设计系统|Figma|UI/.test(t))) {
    emphasis.push('作品/组件库/体验细节', '协作与落地节奏', '性能与可访问性意识')
  } else if (job.tags.some((t) => /Java|后端|微服务|测试|算法|SQL|Python/.test(t))) {
    emphasis.push('技术深度与问题拆解', '稳定性/质量意识', '可量化结果')
  } else if (job.tags.some((t) => /产品|增长|运营|招聘|销售/.test(t))) {
    emphasis.push('业务理解', '沟通推进', '结果导向案例')
  } else {
    emphasis.push('与岗位关键词对齐的经历', '学习速度', '稳定交付')
  }

  if (s.majors.length && !match.dimensions.find((d) => d.key === 'major' && d.status === '通过')) {
    emphasis.unshift(`用项目证明与「${s.majors[0]}」相关的能力迁移`)
  }

  const skillLine = profile.skills.slice(0, 4).join('、') || '相关技能'
  const highlightLine =
    profile.highlights.trim() ||
    `我在${profile.major || '相关'}方向积累了可验证的实践，能够快速对齐业务目标。`

  const angle = match.hardPass
    ? `按「${job.title}」条件画像对齐：先过硬门槛，再突出 ${emphasis[0]}`
    : `缺口补位策略：承认差异，用 ${emphasis[0]} 证明可迁移性`

  const coverLetter = [
    `尊敬的 ${job.company} 招聘团队：`,
    '',
    `我是${profile.name || '候选人'}，来自${profile.school || '相关院校'}·${profile.major || '相关专业'}（${profile.education}），希望申请「${job.title}」。`,
    '',
    `对照贵司要求，我重点对齐三点：${emphasis.slice(0, 3).join('；')}。${highlightLine}`,
    skillLine ? `技能侧可直接复用：${skillLine}。` : '',
    match.blockers.length
      ? `若有条件不完全重合，我更愿意用可验证项目与学习曲线说明迁移路径，而不是回避差异。`
      : `当前匹配度约 ${match.score} 分，硬性条件已通过，期待进一步沟通。`,
    '',
    '感谢阅读，期待有机会交流。',
  ]
    .filter(Boolean)
    .join('\n')

  const suggestedEducationLine = profile.school
    ? `${profile.education} · ${profile.school} · ${profile.major || '专业未填'}`
    : `${profile.education} · ${profile.major || '专业未填'}`

  const suggestedYearsLine = profile.isStudent
    ? '在校 / 应届'
    : `${profile.years} 年`

  return {
    angle,
    coverLetter,
    emphasis,
    warnings,
    suggestedEducationLine,
    suggestedYearsLine,
  }
}
