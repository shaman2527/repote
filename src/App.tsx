import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from '@/components/NavBar'
import { AIAssistant } from '@/components/AIAssistant'
import { generateModels } from '@/lib/seed-models'
import * as db from '@/lib/db'
import Dashboard from '@/pages/Dashboard'
import AddRepair from '@/pages/AddRepair'
import ListRepairs from '@/pages/ListRepairs'
import DetailRepair from '@/pages/DetailRepair'
import Report from '@/pages/Report'
import ScreenCatalog from '@/pages/ScreenCatalog'
import ModelCatalog from '@/pages/ModelCatalog'

function InitData() {
  useEffect(() => {
    const init = async () => {
      const models = generateModels()
      await db.seedModels(models)
      try {
        const { default: screenData } = await import('@/data/screen_catalog.json')
        if (Array.isArray(screenData)) {
          await db.seedScreens(screenData)
        }
      } catch {}
    }
    init()
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <InitData />
      <NavBar />
      <AIAssistant />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddRepair />} />
          <Route path="/list" element={<ListRepairs />} />
          <Route path="/detail/:id" element={<DetailRepair />} />
          <Route path="/report" element={<Report />} />
          <Route path="/screens" element={<ScreenCatalog />} />
          <Route path="/models" element={<ModelCatalog />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
