import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  defaultProfile,
  loadProfile,
  profileCompleteness,
  saveProfile,
} from '../../lib/profile'
import type { EducationLevel, Gender, UserProfile } from '../../lib/types'

const eduOptions: EducationLevel[] = ['大专', '本科', '硕士', '博士']
const genderOptions: Gender[] = ['男', '女', '不愿透露']

export function PickProfile() {
  const [form, setForm] = useState<UserProfile>(() => loadProfile())
  const [saved, setSaved] = useState(false)

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    saveProfile(form)
    setSaved(true)
  }

  const completeness = profileCompleteness(form)

  return (
    <main className="pick-page">
      <section className="pick-card">
        <h1>我的报考条件</h1>
        <p className="pick-lead">完整度 {completeness}% · 数据保存在本机浏览器</p>
        <form className="pick-form" onSubmit={onSubmit}>
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
            <span>专业（与毕业证一致）</span>
            <input
              value={form.major}
              onChange={(e) => update('major', e.target.value)}
              placeholder="如：法学、计算机、财政学"
            />
          </label>
          <label className="field">
            <span>性别</span>
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
            <span>社会工龄（年）</span>
            <input
              type="number"
              min={0}
              max={40}
              value={form.years}
              onChange={(e) => update('years', Number(e.target.value) || 0)}
            />
          </label>
          <label className="field">
            <span>基层工作年限（年）</span>
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
          <label className="pick-check">
            <input
              type="checkbox"
              checked={form.isStudent}
              onChange={(e) => update('isStudent', e.target.checked)}
            />
            我是在校生 / 应届
          </label>
          <label className="pick-check">
            <input
              type="checkbox"
              checked={form.hasDegree}
              onChange={(e) => update('hasDegree', e.target.checked)}
            />
            已取得与最高学历相应学位
          </label>
          <label className="pick-check">
            <input
              type="checkbox"
              checked={form.isPartyMember}
              onChange={(e) => update('isPartyMember', e.target.checked)}
            />
            中共党员（含预备党员）
          </label>
          <div className="pick-actions">
            <button type="submit" className="btn btn-primary pick-btn-block">
              保存条件
            </button>
            <Link className="btn btn-ghost pick-btn-block" to="/pick/results">
              去选岗
            </Link>
            <button
              type="button"
              className="btn btn-ghost pick-btn-block"
              onClick={() => {
                const d = defaultProfile()
                setForm(d)
                setSaved(false)
              }}
            >
              重置示例
            </button>
          </div>
          {saved ? <p className="form-ok">已保存</p> : null}
        </form>
      </section>
    </main>
  )
}
