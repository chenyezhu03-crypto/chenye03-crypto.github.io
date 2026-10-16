import { Navigate, Route, Routes } from 'react-router-dom'
import { TravelCommunity } from './TravelCommunity'
import { TravelCustom } from './TravelCustom'
import { TravelGuide } from './TravelGuide'
import { TravelHome } from './TravelHome'
import { TravelLayout } from './TravelLayout'
import { TravelPlace } from './TravelPlace'
import { TravelPicks } from './TravelPicks'
import { TravelPrefs } from './TravelPrefs'
import { TravelRegion } from './TravelRegion'
import { TravelPricing } from './TravelPricing'
import { TravelSpin } from './TravelSpin'

export function TravelApp() {
  return (
    <Routes>
      <Route element={<TravelLayout />}>
        <Route index element={<TravelHome />} />
        <Route path="custom" element={<TravelCustom />} />
        <Route path="region" element={<TravelRegion />} />
        <Route path="prefs" element={<TravelPrefs />} />
        <Route path="picks" element={<TravelPicks />} />
        <Route path="spin" element={<TravelSpin />} />
        <Route path="place/:id" element={<TravelPlace />} />
        <Route path="guide/:guideId" element={<TravelGuide />} />
        <Route path="pricing" element={<TravelPricing />} />
        <Route path="community" element={<TravelCommunity />} />
        <Route path="*" element={<Navigate to="/travel" replace />} />
      </Route>
    </Routes>
  )
}
