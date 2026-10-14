import { NavLink } from 'react-router-dom'

const links = [
  { to: '/jobs', label: '岗位' },
  { to: '/apply', label: '投递' },
  { to: '/applications', label: '我的投递' },
]

export function Nav() {
  return (
    <header className="site-nav">
      <NavLink to="/" className="brand" end>
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
