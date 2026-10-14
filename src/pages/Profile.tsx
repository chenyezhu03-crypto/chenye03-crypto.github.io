import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  defaultProfile,
  loadProfile,
  profileCompleteness,
  saveProfile,
} from '../lib/profile'
import type { EducationLevel, Gender, UserProfile } from '../lib/types'

const eduOptions: EducationLevel[] = ['大专', '本科', '硕士', '博士']
const genderOptions: Gender[] = ['男', '女', '不愿透露']

function splitCsv(value: string): string[] {
  return value
    .split(/[,，、\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
}

export function Profile() {
  const [form, setForm] = useState<UserProfile>(() => loadProfile())
  const [skillsText, setSkillsText] = useState(form.skills.join('、'))
  const [rolesText, setRolesText] = useState(form.targetRoles.join('、'))
  const [citiesText, setCitiesText] = useState(form.targetCities.join('、'))
  const [saved, setSaved] = useState(false)

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: UserProfile = {
      ...form,
      skills: splitCsv(skillsText),
      targetRoles: splitCsv(rolesText),
      targetCities: splitCsv(citiesText),
    }
    saveProfile(next)
    setForm(next)
    setSaved(true)
  }

  const completeness = profileCompleteness({
    ...form,
    skills: splitCsv(skillsText),
    targetRoles: splitCsv(rolesText),
    targetCities: splitCsv(citiesText),
  })

  return (
    <main className="page narrow">
      <header className="page-header row">
        <div>
          <h1>求职画像</h1>
          <p className="section-lead">
            画像越完整，岗位雷达与自适应投递越准。完成度 {completeness}%
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            const d = defaultProfile()
            setForm(d)
            setSkillsText(d.skills.join('、'))
            setRolesText(d.targetRoles.join('、'))
            setCitiesText(d.targetCities.join('、'))
            setSaved(false)
          }}
        >
          重置示例
        </button>
      </header>

      <form className="apply-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>姓名</span>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              autoComplete="name"
            />
          </label>
          <label className="field">
            <span>性别（仅用于匹配岗位原文标注）</span>
            <select
              value={form.gender}
              onChange={(e) => update('gender', e.target.value as Gender)}
            >
              {genderOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>手机</span>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              autoComplete="tel"
            />
          </label>
          <label className="field">
            <span>邮箱</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>学历</span>
            <select
              value={form.education}
              onChange={(e) =>
                update('education', e.target.value as EducationLevel)
              }
            >
              {eduOptions.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>专业</span>
            <input
              value={form.major}
              onChange={(e) => update('major', e.target.value)}
              placeholder="如：计算机 / 视觉传达"
            />
          </label>
          <label className="field full">
            <span>学校</span>
            <input
              value={form.school}
              onChange={(e) => update('school', e.target.value)}
            />
          </label>
          <label className="field">
            <span>工作年限</span>
            <input
              type="number"
              min={0}
              max={40}
              value={form.years}
              onChange={(e) => update('years', Number(e.target.value) || 0)}
            />
          </label>
          <label className="field check-field">
            <span>身份</span>
            <label className="check-line">
              <input
                type="checkbox"
                checked={form.isStudent}
                onChange={(e) => update('isStudent', e.target.checked)}
              />
              我是在校生 / 应届
            </label>
          </label>
          <label className="field">
            <span>基层工作年限（公考）</span>
            <input
              type="number"
              min={0}
              max={30}
              value={form.grassrootsYears}
              onChange={(e) =>
                update('grassrootsYears', Number(e.target.value) || 0)
              }
            />
          </label>
          <label className="field check-field">
            <span>公考条件</span>
            <label className="check-line">
              <input
                type="checkbox"
                checked={form.hasDegree}
                onChange={(e) => update('hasDegree', e.target.checked)}
              />
              已取得与最高学历相应学位
            </label>
          </label>
          <label className="field check-field full">
            <span>&nbsp;</span>
            <label className="check-line">
              <input
                type="checkbox"
                checked={form.isPartyMember}
                onChange={(e) => update('isPartyMember', e.target.checked)}
              />
              中共党员（含预备党员）
            </label>
          </label>
          <label className="field full">
            <span>技能关键词</span>
            <input
              value={skillsText}
              onChange={(e) => {
                setSkillsText(e.target.value)
                setSaved(false)
              }}
              placeholder="用顿号或逗号分隔，如 React、SQL"
            />
          </label>
          <label className="field">
            <span>目标岗位</span>
            <input
              value={rolesText}
              onChange={(e) => {
                setRolesText(e.target.value)
                setSaved(false)
              }}
              placeholder="前端、产品…"
            />
          </label>
          <label className="field">
            <span>目标城市</span>
            <input
              value={citiesText}
              onChange={(e) => {
                setCitiesText(e.target.value)
                setSaved(false)
              }}
              placeholder="上海、杭州…"
            />
          </label>
          <label className="field full">
            <span>个人亮点（1-3 句）</span>
            <textarea
              rows={4}
              value={form.highlights}
              onChange={(e) => update('highlights', e.target.value)}
              placeholder="用事实说明你能交付什么。"
            />
          </label>
        </div>

        <div className="hero-actions">
          <button type="submit" className="btn btn-primary">
            保存画像
          </button>
          <Link className="btn btn-ghost" to="/jobs">
            去岗位雷达
          </Link>
        </div>
        {saved ? <p className="form-ok">画像已保存到本机。</p> : null}
      </form>
    </main>
  )
}
