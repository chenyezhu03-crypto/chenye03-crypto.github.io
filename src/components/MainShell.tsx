import { Navigate, Route, Routes } from 'react-router-dom'
import { Footer } from './Footer'
import { Nav } from './Nav'
import { Applications } from '../pages/Applications'
import { Apply } from '../pages/Apply'
import { GwyGuide } from '../pages/GwyGuide'
import { Home } from '../pages/Home'
import { Jobs } from '../pages/Jobs'
import { Profile } from '../pages/Profile'

export function MainShell() {
  return (
    <div className="app-shell">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/gwy/guide" element={<GwyGuide />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  )
}
