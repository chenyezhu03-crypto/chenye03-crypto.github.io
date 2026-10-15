import { Navigate, Route, Routes } from 'react-router-dom'
import { TravelHome } from './TravelHome'
import { TravelLayout } from './TravelLayout'
import { TravelPlace } from './TravelPlace'
import { TravelPrefs } from './TravelPrefs'
import { TravelSpin } from './TravelSpin'

export function TravelApp() {
  return (
    <Routes>
      <Route element={<TravelLayout />}>
        <Route index element={<TravelHome />} />
        <Route path="prefs" element={<TravelPrefs />} />
        <Route path="spin" element={<TravelSpin />} />
        <Route path="place/:id" element={<TravelPlace />} />
        <Route path="*" element={<Navigate to="/travel" replace />} />
      </Route>
    </Routes>
  )
}
