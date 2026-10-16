import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainShell } from './components/MainShell'
import { PickApp } from './pages/pick/PickApp'
import { TravelApp } from './pages/travel/TravelApp'
import { TravelPortal } from './pages/travel/TravelPortal'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TravelPortal />} />
        <Route path="/travel/*" element={<TravelApp />} />
        <Route path="/pick/*" element={<PickApp />} />
        <Route path="/*" element={<MainShell />} />
      </Routes>
    </BrowserRouter>
  )
}
