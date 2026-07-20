import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from '@/components/NavBar'
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
