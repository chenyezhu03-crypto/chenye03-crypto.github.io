import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  deleteResume,
  loadResumes,
  upsertResume,
  type ResumeVersion,
} from '../lib/resumes'

function splitCsv(value: string): string[] {
  return value
    .split(/[,，、\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
}

const blank = (): ResumeVersion => ({
  id: `rv-${Date.now()}`,
  name: '',
  fileName: '',
  targetRoles: [],
  skills: [],
  summary: '',
  isDefault: false,
  updatedAt: new Date().toISOString(),
})

export function Resumes() {
  const [list, setList] = useState<ResumeVersion[]>(() => loadResumes())
  const [draft, setDraft] = useState<ResumeVersion | null>(null)
  const [rolesText, setRolesText] = useState('')
  const [skillsText, setSkillsText] = useState('')

  function startCreate() {
    const next = blank()
    setDraft(next)
    setRolesText('')
    setSkillsText('')
  }

  function startEdit(item: ResumeVersion) {
    setDraft({ ...item })
    setRolesText(item.targetRoles.join('、'))
    setSkillsText(item.skills.join('、'))
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!draft) return
    if (!draft.name.trim() || !draft.fileName.trim()) return
    const next = upsertResume({
      ...draft,
      name: draft.name.trim(),
      fileName: draft.fileName.trim(),
      targetRoles: splitCsv(rolesText),
      skills: splitCsv(skillsText),
      summary: draft.summary.trim(),
      updatedAt: new Date().toISOString(),
    })
    setList(next)
    setDraft(null)
  }

  function onDelete(id: string) {
    setList(deleteResume(id))
    if (draft?.id === id) setDraft(null)
  }

  return (
    <main className="page">
      <header className="page-header row">
        <div>
          <h1>多版简历</h1>
          <p className="section-lead">
            为技术岗 / 业务岗准备不同版本。智能投递与批量队列会按岗位关键词自动切换。
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          新建版本
        </button>
      </header>

      <ul className="resume-list">
        {list.map((item) => (
          <li key={item.id} className="resume-row">
            <div>
              <div className="job-title-row">
                <h2>{item.name}</h2>
                {item.isDefault ? <span className="badge">默认</span> : null}
              </div>
              <p className="job-meta">{item.fileName}</p>
              <p className="job-desc">{item.summary || '暂无摘要'}</p>
              <ul className="tag-list">
                {item.targetRoles.map((t) => (
                  <li key={`r-${t}`}>岗·{t}</li>
                ))}
                {item.skills.map((t) => (
                  <li key={`s-${t}`}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="job-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => startEdit(item)}
              >
                编辑
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => onDelete(item.id)}
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>

      {draft ? (
        <form className="apply-form draft-panel" onSubmit={onSubmit}>
          <h2>{list.some((r) => r.id === draft.id) ? '编辑版本' : '新建版本'}</h2>
          <div className="form-grid">
            <label className="field">
              <span>版本名</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="如：技术向"
                required
              />
            </label>
            <label className="field">
              <span>文件名</span>
              <input
                value={draft.fileName}
                onChange={(e) =>
                  setDraft({ ...draft, fileName: e.target.value })
                }
                placeholder="resume-tech.pdf"
                required
              />
            </label>
            <label className="field full">
              <span>目标岗位关键词</span>
              <input
                value={rolesText}
                onChange={(e) => setRolesText(e.target.value)}
                placeholder="前端、后端、算法"
              />
            </label>
            <label className="field full">
              <span>技能关键词</span>
              <input
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="React、TypeScript"
              />
            </label>
            <label className="field full">
              <span>版本摘要</span>
              <textarea
                rows={3}
                value={draft.summary}
                onChange={(e) =>
                  setDraft({ ...draft, summary: e.target.value })
                }
              />
            </label>
            <label className="field check-field full">
              <span>默认</span>
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={draft.isDefault}
                  onChange={(e) =>
                    setDraft({ ...draft, isDefault: e.target.checked })
                  }
                />
                设为默认版本
              </label>
            </label>
          </div>
          <div className="hero-actions">
            <button type="submit" className="btn btn-primary">
              保存版本
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDraft(null)}
            >
              取消
            </button>
          </div>
        </form>
      ) : null}

      <p className="fine-print">
        保存后可在 <Link to="/apply">智能投递</Link> 或{' '}
        <Link to="/batch">批量队列</Link> 中自动选用。
      </p>
    </main>
  )
}
