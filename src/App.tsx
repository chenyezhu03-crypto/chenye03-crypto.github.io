import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { Applications } from './pages/Applications'
import { Apply } from './pages/Apply'
import { Home } from './pages/Home'
import { Jobs } from './pages/Jobs'
import { Profile } from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
