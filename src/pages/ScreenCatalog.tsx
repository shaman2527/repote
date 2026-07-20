import { useState, useEffect } from 'react'
import * as db from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Search, Smartphone, DollarSign, Package } from 'lucide-react'
import type { ScreenPart } from '@/types'

const BRAND_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'Samsung', label: 'Samsung' },
  { value: 'Xiaomi', label: 'Xiaomi' },
  { value: 'Apple', label: 'Apple' },
  { value: 'Huawei', label: 'Huawei' },
  { value: 'Motorola', label: 'Motorola' },
  { value: 'Tecno', label: 'Tecno' },
  { value: 'Infinix', label: 'Infinix' },
  { value: 'LG', label: 'LG' },
  { value: 'ZTE', label: 'ZTE' },
  { value: 'Google', label: 'Google' },
  { value: 'BLU', label: 'BLU' },
]

export default function ScreenCatalog() {
  const [screens, setScreens] = useState<ScreenPart[]>([])
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')

  useEffect(() => { db.getAllScreens().then(setScreens) }, [])

  const filtered = screens.filter(s => {
    if (brandFilter && s.brand !== brandFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return s.model.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="min-h-screen pb-28 md:pb-0 md:ml-64">
      <div className="container-app p-5 space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Pantallas</h1>
          <p className="text-sm text-muted-foreground">{screens.length} pantallas en catálogo</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pantalla..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary/30 border-0 rounded-xl h-10"
            />
          </div>
          <Select
            options={BRAND_OPTIONS}
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="w-32 bg-secondary/30 border-0 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <Card className="border-0 glass">
              <CardContent className="p-12 text-center">
                <Smartphone className="size-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  {screens.length === 0 ? 'Cargando...' : 'Sin resultados'}
                </p>
              </CardContent>
            </Card>
          )}
          {filtered.map((screen) => (
            <Card key={screen.id} className="border-0 glass hover:bg-secondary/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-10 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                      <Smartphone className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{screen.brand} {screen.model}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5">{screen.screenType}</Badge>
                        <Badge
                          variant={screen.stockStatus === 'disponible' ? 'success' : 'destructive'}
                          className="text-[9px] py-0 px-1.5"
                        >
                          <Package className="size-2.5 mr-1" />
                          {screen.stockStatus === 'disponible' ? 'Disponible' : 'Agotado'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold">${screen.retailPrice.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">Mayor: ${screen.wholesalePrice.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
