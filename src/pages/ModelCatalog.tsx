import { useState, useEffect } from 'react'
import * as db from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, BookOpen, Cpu, Smartphone } from 'lucide-react'
import { usePhoneImages } from '@/hooks/usePhoneImages'
import { detectSeries } from '@/lib/screen-compatibility'
import type { PhoneModel } from '@/types'

const BRAND_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'Samsung', label: 'Samsung' },
  { value: 'Apple', label: 'Apple' },
  { value: 'Xiaomi', label: 'Xiaomi' },
  { value: 'POCO', label: 'POCO' },
  { value: 'Huawei', label: 'Huawei' },
  { value: 'Tecno', label: 'Tecno' },
  { value: 'Infinix', label: 'Infinix' },
  { value: 'Motorola', label: 'Motorola' },
  { value: 'Google', label: 'Google' },
  { value: 'LG', label: 'LG' },
  { value: 'ZTE', label: 'ZTE' },
  { value: 'Nokia', label: 'Nokia' },
  { value: 'Alcatel', label: 'Alcatel' },
]

const FRP_VARIANTS: Record<string, 'default' | 'warning' | 'success' | 'destructive' | 'outline'> = {
  SPD: 'destructive',
  BROM: 'warning',
  Testpoint: 'default',
  Bypass: 'success',
  Octoplus: 'outline',
  EDL: 'default',
}

export default function ModelCatalog() {
  const [models, setModels] = useState<PhoneModel[]>([])
  const { getImage } = usePhoneImages()
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')

  useEffect(() => { db.getAllModels().then(setModels) }, [])

  const filtered = models.filter(m => {
    if (brandFilter && m.brand !== brandFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return m.model.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="min-h-screen pb-28 md:pb-0 md:ml-64">
      <div className="container-app p-5 space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Modelos</h1>
          <p className="text-sm text-muted-foreground">{models.length} modelos con método FRP</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar modelo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary/30 border-0 rounded-xl h-10"
            />
          </div>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-32 bg-secondary/30 border-0 rounded-xl">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectGroup>
                {BRAND_OPTIONS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <Card className="border-0 glass">
              <CardContent className="p-12 text-center">
                <BookOpen className="size-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Cargando modelos...</p>
              </CardContent>
            </Card>
          )}
          {filtered.map((m) => (
            <Card key={m.id} className="border-0 glass hover:bg-secondary/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-14 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0 overflow-hidden">
                      {(() => {
                        const img = getImage(m.brand, m.model)
                        return img
                          ? <img src={img} alt={m.model} className="size-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          : <Cpu className="size-6 text-muted-foreground" />
                      })()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{m.brand} {m.model}</p>
                        {(() => {
                          const s = detectSeries(m.brand, m.model)
                          return s ? <Badge className={`text-[9px] px-1.5 py-0 ${s.bgClass} ${s.textClass} border-0 shrink-0`}>{s.name}</Badge> : null
                        })()}
                      </div>
                      {m.chipset && (
                        <p className="text-xs text-muted-foreground mt-0.5">{m.chipset}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {m.year && (
                      <span className="text-xs text-muted-foreground">{m.year}</span>
                    )}
                    {m.frpMethod && (
                      <Badge variant={FRP_VARIANTS[m.frpMethod] || 'default'} className="text-[10px] py-1 px-2">
                        {m.frpMethod}
                      </Badge>
                    )}
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
