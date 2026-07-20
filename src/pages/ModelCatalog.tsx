import { useState, useEffect } from 'react'
import * as db from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import type { PhoneModel } from '@/types'

const BRAND_OPTIONS = [
  { value: '', label: 'Todas las marcas' },
  { value: 'Samsung', label: 'Samsung' },
  { value: 'Apple', label: 'Apple' },
  { value: 'Xiaomi', label: 'Xiaomi' },
  { value: 'POCO', label: 'POCO' },
  { value: 'Huawei', label: 'Huawei' },
  { value: 'Tecno', label: 'Tecno' },
  { value: 'Infinix', label: 'Infinix' },
  { value: 'Motorola', label: 'Motorola' },
  { value: 'LG', label: 'LG' },
  { value: 'Google', label: 'Google' },
  { value: 'Nokia', label: 'Nokia' },
  { value: 'Alcatel', label: 'Alcatel' },
  { value: 'ZTE', label: 'ZTE' },
]

const FRP_COLORS: Record<string, 'default' | 'warning' | 'success' | 'destructive' | 'outline'> = {
  SPD: 'destructive',
  BROM: 'warning',
  Testpoint: 'default',
  Bypass: 'success',
  Octoplus: 'outline',
}

export default function ModelCatalog() {
  const [models, setModels] = useState<PhoneModel[]>([])
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')

  useEffect(() => {
    db.getAllModels().then(setModels)
  }, [])

  const filtered = models.filter(m => {
    if (brandFilter && m.brand !== brandFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return m.model.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:ml-64">
      <div className="container-center p-4 space-y-4">
        <h1 className="text-2xl font-bold">Catálogo de Modelos</h1>
        <p className="text-sm text-muted-foreground">Modelos con método FRP y chipset</p>

        <div className="flex gap-2">
          <Input
            placeholder="Buscar modelo..."
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
                Cargando modelos...
              </CardContent>
            </Card>
          )}
          {filtered.map((m) => (
            <Card key={m.id} className="hover:bg-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{m.brand} {m.model}</p>
                    {m.chipset && (
                      <p className="text-xs text-muted-foreground mt-0.5">{m.chipset}</p>
                    )}
                  </div>
                  {m.frpMethod && (
                    <Badge variant={FRP_COLORS[m.frpMethod] || 'default'}>
                      {m.frpMethod}
                    </Badge>
                  )}
                </div>
                {m.year && (
                  <p className="text-xs text-muted-foreground mt-1">{m.year}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
