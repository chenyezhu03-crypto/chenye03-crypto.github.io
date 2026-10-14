import { Navigate, Route, Routes } from 'react-router-dom'
import { PickGuide } from './PickGuide'
import { PickHome } from './PickHome'
import { PickLayout } from './PickLayout'
import { PickProfile } from './PickProfile'
import { PickResults } from './PickResults'

export function PickApp() {
  return (
    <Routes>
      <Route element={<PickLayout />}>
        <Route index element={<PickHome />} />
        <Route path="profile" element={<PickProfile />} />
        <Route path="results" element={<PickResults />} />
        <Route path="guide" element={<PickGuide />} />
        <Route path="*" element={<Navigate to="/pick" replace />} />
      </Route>
    </Routes>
  )
}
