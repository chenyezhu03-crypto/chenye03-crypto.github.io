import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainShell } from './components/MainShell'
import { PickApp } from './pages/pick/PickApp'
import { TravelApp } from './pages/travel/TravelApp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/travel" replace />} />
        <Route path="/travel/*" element={<TravelApp />} />
        <Route path="/pick/*" element={<PickApp />} />
        <Route path="/*" element={<MainShell />} />
      </Routes>
    </BrowserRouter>
  )
}
