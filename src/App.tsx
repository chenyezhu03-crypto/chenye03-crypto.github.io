import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainShell } from './components/MainShell'
import { PickApp } from './pages/pick/PickApp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pick/*" element={<PickApp />} />
        <Route path="/*" element={<MainShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
