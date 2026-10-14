import { NavLink, Outlet, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/pick', label: '首页', end: true },
  { to: '/pick/profile', label: '条件' },
  { to: '/pick/results', label: '选岗' },
  { to: '/pick/guide', label: '指南' },
]

export function PickLayout() {
  const loc = useLocation()

  return (
    <div className="pick-app">
      <header className="pick-header">
        <p className="pick-brand">公考选岗助手</p>
        <p className="pick-sub">
          {loc.pathname.includes('/results')
            ? '2027 国考全量 + 上海市考样本'
            : '先看条件，再筛岗位'}
        </p>
      </header>
      <div className="pick-body">
        <Outlet />
      </div>
      <nav className="pick-tabbar" aria-label="选岗助手导航">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              isActive ? 'pick-tab is-active' : 'pick-tab'
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
