import { useState, useEffect } from 'react'
import * as db from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import type { ScreenPart } from '@/types'

const BRAND_OPTIONS = [
  { value: '', label: 'Todas las marcas' },
  { value: 'Samsung', label: 'Samsung' },
  { value: 'Xiaomi', label: 'Xiaomi' },
  { value: 'Apple', label: 'Apple' },
  { value: 'Huawei', label: 'Huawei' },
  { value: 'Tecno', label: 'Tecno' },
  { value: 'Infinix', label: 'Infinix' },
  { value: 'Motorola', label: 'Motorola' },
  { value: 'LG', label: 'LG' },
  { value: 'Google', label: 'Google' },
  { value: 'Alcatel', label: 'Alcatel' },
  { value: 'ZTE', label: 'ZTE' },
  { value: 'BLU', label: 'BLU' },
]

export default function ScreenCatalog() {
  const [screens, setScreens] = useState<ScreenPart[]>([])
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')

  useEffect(() => {
    db.getAllScreens().then(setScreens)
  }, [])

  const filtered = screens.filter(s => {
    if (brandFilter && s.brand !== brandFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return s.model.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:ml-64">
      <div className="container-center p-4 space-y-4">
        <h1 className="text-2xl font-bold">Catálogo de Pantallas</h1>
        <p className="text-sm text-muted-foreground">Precios de pantallas de repuesto</p>

        <div className="flex gap-2">
          <Input
            placeholder="Buscar pantalla..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            options={BRAND_OPTIONS}
            value={brandFilter}
            onChange={e => setBrandFilter(e.target.value)}
            className="w-36"
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {screens.length === 0
                  ? 'Cargando catálogo de pantallas...'
                  : 'No se encontraron pantallas'}
              </CardContent>
            </Card>
          )}
          {filtered.map((screen) => (
            <Card key={screen.id} className="hover:bg-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {screen.brand} {screen.model}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{screen.screenType}</Badge>
                      <Badge
                        variant={screen.stockStatus === 'disponible' ? 'success' : 'destructive'}
                        className="text-[10px]"
                      >
                        {screen.stockStatus === 'disponible' ? 'Disponible' : 'Agotado'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold">${screen.retailPrice.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Mayor: ${screen.wholesalePrice.toFixed(2)}</p>
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
