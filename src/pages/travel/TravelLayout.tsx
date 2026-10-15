import { NavLink, Outlet, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/travel', label: '首页', end: true },
  { to: '/travel/custom', label: '做攻略', end: false },
  { to: '/travel/region', label: '地区', end: false },
  { to: '/travel/picks', label: '三选一', end: false },
]

export function TravelLayout() {
  const loc = useLocation()
  const onPlace = loc.pathname.includes('/place/')
  const onGuide = loc.pathname.includes('/guide/')
  const hideTab = onPlace || onGuide

  return (
    <div className="travel-app">
      <header className="travel-header">
        <p className="travel-brand">去哪玩</p>
        <p className="travel-sub">
          {onGuide
            ? '图文攻略 · 可导出 Word / PDF'
            : onPlace
            ? '目的地详情'
            : loc.pathname.includes('/region')
              ? '国内/国外 → 洲 → 子区域 → 国家'
              : loc.pathname.includes('/picks')
                ? '一次给你 3 个备选'
                : loc.pathname.includes('/spin')
                  ? '转一下，交给运气一点'
                  : '先选地区分级，再抽目的地'}
        </p>
      </header>
      <div className="travel-body">
        <Outlet />
      </div>
      {!hideTab && (
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
