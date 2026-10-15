import { Navigate, Route, Routes } from 'react-router-dom'
import { TravelGuide } from './TravelGuide'
import { TravelHome } from './TravelHome'
import { TravelLayout } from './TravelLayout'
import { TravelPlace } from './TravelPlace'
import { TravelPicks } from './TravelPicks'
import { TravelPrefs } from './TravelPrefs'
import { TravelRegion } from './TravelRegion'
import { TravelSpin } from './TravelSpin'

export function TravelApp() {
  return (
    <Routes>
      <Route element={<TravelLayout />}>
        <Route index element={<TravelHome />} />
        <Route path="region" element={<TravelRegion />} />
        <Route path="prefs" element={<TravelPrefs />} />
        <Route path="picks" element={<TravelPicks />} />
        <Route path="spin" element={<TravelSpin />} />
        <Route path="place/:id" element={<TravelPlace />} />
        <Route path="guide/:guideId" element={<TravelGuide />} />
        <Route path="*" element={<Navigate to="/travel" replace />} />
      </Route>
    </Routes>
  )
}
