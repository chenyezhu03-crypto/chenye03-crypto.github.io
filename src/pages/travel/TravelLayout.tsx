import { NavLink, Outlet, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/travel', label: '首页', end: true },
  { to: '/travel/prefs', label: '偏好', end: false },
  { to: '/travel/spin', label: '转盘', end: false },
]

export function TravelLayout() {
  const loc = useLocation()
  const onPlace = loc.pathname.includes('/place/')

  return (
    <div className="travel-app">
      <header className="travel-header">
        <p className="travel-brand">去哪玩</p>
        <p className="travel-sub">
          {onPlace
            ? '目的地详情'
            : loc.pathname.includes('/spin')
              ? '转一下，交给运气一点'
              : '不知道去哪？先定偏好，再转大盘'}
        </p>
      </header>
      <div className="travel-body">
        <Outlet />
      </div>
      {!onPlace && (
        <nav className="travel-tabbar" aria-label="去哪玩导航">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                isActive ? 'travel-tab is-active' : 'travel-tab'
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
