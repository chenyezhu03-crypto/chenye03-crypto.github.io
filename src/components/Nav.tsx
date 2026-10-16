import { NavLink } from 'react-router-dom'

const links = [
  { to: '/jobs', label: '岗位雷达' },
  { to: '/gwy/guide', label: '国考指南' },
  { to: '/pick', label: '选岗助手' },
  { to: '/profile', label: '求职画像' },
  { to: '/apply', label: '智能投递' },
  { to: '/applications', label: '我的投递' },
]

export function Nav() {
  return (
    <header className="site-nav">
      <NavLink to="/toujian" className="brand" end>
        投简
      </NavLink>
      <nav className="nav-links" aria-label="主导航">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? 'nav-link is-active' : 'nav-link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
