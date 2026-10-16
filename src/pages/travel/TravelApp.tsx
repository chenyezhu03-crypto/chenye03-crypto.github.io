import { Navigate, Route, Routes } from 'react-router-dom'
import { TravelAssessment } from './TravelAssessment'
import { TravelCommunity } from './TravelCommunity'
import { TravelChannels } from './TravelChannels'
import { TravelContests } from './TravelContests'
import { TravelEco } from './TravelEco'
import { TravelGuideMarket } from './TravelGuideMarket'
import { TravelHub } from './TravelHub'
import { TravelIp } from './TravelIp'
import { TravelLive } from './TravelLive'
import { TravelMine } from './TravelMine'
import { TravelRoadmap } from './TravelRoadmap'
import { TravelUgc } from './TravelUgc'
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
        <Route path="assessment" element={<TravelAssessment />} />
        <Route path="roadmap" element={<TravelRoadmap />} />
        <Route path="hub" element={<TravelHub />} />
        <Route path="ugc" element={<TravelUgc />} />
        <Route path="channels" element={<TravelChannels />} />
        <Route path="live" element={<TravelLive />} />
        <Route path="contests" element={<TravelContests />} />
        <Route path="eco" element={<TravelEco />} />
        <Route path="guides" element={<TravelGuideMarket />} />
        <Route path="ip" element={<TravelIp />} />
        <Route path="mine" element={<TravelMine />} />
        <Route path="*" element={<Navigate to="/travel" replace />} />
      </Route>
    </Routes>
  )
}
