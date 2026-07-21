import { useState, useEffect } from 'react'
import * as db from '@/lib/db'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search, BookOpen, Cpu, ChevronDown, Filter, X, Smartphone,
  CalendarCog, Microchip, Layers,
} from 'lucide-react'
import { usePhoneImages } from '@/hooks/usePhoneImages'
import { detectSeries } from '@/lib/screen-compatibility'
import type { PhoneModel } from '@/types'

const ALL_BRANDS = [
  'Samsung', 'Xiaomi', 'POCO', 'Apple', 'Huawei', 'Oppo', 'Vivo',
  'Realme', 'OnePlus', 'Motorola', 'Tecno', 'Infinix', 'LG', 'Google',
  'Nokia', 'Blackview', 'ZTE', 'TCL', 'Alcatel', 'BLU', 'Umidigi', 'Krip',
] as const

const BRAND_OPTIONS = [
  { value: '', label: 'Todas las marcas' },
  ...ALL_BRANDS.map(b => ({ value: b, label: b })),
]

const FRP_VARIANTS: Record<string, 'default' | 'warning' | 'success' | 'destructive' | 'outline'> = {
  SPD: 'destructive',
  BROM: 'warning',
  Testpoint: 'default',
  Bypass: 'success',
  Octoplus: 'outline',
  EDL: 'default',
}

const SERIES_COLORS: Record<string, string> = {
  'S Series': 'from-blue-500 to-purple-600',
  'A Series': 'from-emerald-400 to-teal-500',
  'J Series': 'from-orange-400 to-red-500',
  'M Series': 'from-cyan-400 to-blue-500',
  'Note Series': 'from-violet-500 to-purple-700',
  'Z Series': 'from-pink-500 to-rose-600',
  'F Series': 'from-amber-400 to-orange-500',
  'Redmi Note': 'from-red-500 to-orange-500',
  'Redmi': 'from-orange-400 to-red-500',
  'P Series': 'from-yellow-400 to-amber-500',
  'Mate Series': 'from-gray-600 to-gray-800',
  'Y Series': 'from-green-400 to-emerald-500',
  'V Series': 'from-indigo-400 to-blue-500',
  'K Series': 'from-rose-400 to-pink-500',
  'C Series': 'from-teal-400 to-cyan-500',
}

function getSeriesGradient(name: string): string {
  return SERIES_COLORS[name] || 'from-gray-500 to-gray-600'
}

function formatModelName(brand: string, model: string): string {
  const known = model.startsWith(brand)
  return known ? model : `${brand} ${model}`
}

export default function ModelCatalog() {
  const [models, setModels] = useState<PhoneModel[]>([])
  const { getImageOrPlaceholder } = usePhoneImages()
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [seriesFilter, setSeriesFilter] = useState('')

  useEffect(() => { db.getAllModels().then(setModels) }, [])

  const filtered = models.filter(m => {
    if (brandFilter && m.brand !== brandFilter) return false
    if (seriesFilter) {
      const s = detectSeries(m.brand, m.model)
      if (!s || s.name !== seriesFilter) return false
    }
    if (search) {
      const q = search.toLowerCase()
      return m.model.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q) || m.chipset?.toLowerCase().includes(q)
    }
    return true
  })

  const availableSeries = ['', ...new Set(filtered.map(m => detectSeries(m.brand, m.model)?.name).filter(Boolean))] as string[]

  const hasFilters = brandFilter || seriesFilter || search

  const clearFilters = () => {
    setBrandFilter('')
    setSeriesFilter('')
    setSearch('')
  }

  return (
    <div className="min-h-screen pb-28 md:pb-0 md:ml-64">
      <div className="container-app p-4 md:p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Modelos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} de {models.length} modelos
            </p>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-primary flex items-center gap-1 hover:underline">
              <X className="size-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por modelo, marca o chipset..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary/30 border-0 rounded-xl h-11 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Select value={brandFilter} onValueChange={(v) => { setBrandFilter(v); setSeriesFilter('') }}>
              <SelectTrigger className="w-36 bg-secondary/30 border-0 rounded-xl h-11">
                <Filter className="size-3.5 mr-1 shrink-0" />
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectGroup>
                  {BRAND_OPTIONS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={seriesFilter} onValueChange={setSeriesFilter}>
              <SelectTrigger className="w-32 bg-secondary/30 border-0 rounded-xl h-11">
                <Layers className="size-3.5 mr-1 shrink-0" />
                <SelectValue placeholder="Serie" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectGroup>
                  <SelectItem value="">Todas</SelectItem>
                  {availableSeries.filter(Boolean).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {models.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
              <BookOpen className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Cargando modelos...</p>
          </div>
        )}

        {models.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
              <Cpu className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Sin resultados</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Intenta con otra búsqueda</p>
            <button onClick={clearFilters} className="mt-4 text-sm text-primary hover:underline">
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((m) => {
              const s = detectSeries(m.brand, m.model)
              const displayName = formatModelName(m.brand, m.model)
              return (
                <div
                  key={m.id}
                  className="group relative rounded-2xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-secondary/80 to-secondary/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent z-10" />
                    <img
                      src={getImageOrPlaceholder(m.brand, m.model)}
                      alt={displayName}
                      className="size-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    {/* Series badge */}
                    {s && (
                      <div className={`absolute top-2 left-2 z-20 bg-gradient-to-r ${getSeriesGradient(s.name)} text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg`}>
                        {s.name}
                      </div>
                    )}
                    {/* FRP badge */}
                    {m.frpMethod && (
                      <div className="absolute top-2 right-2 z-20">
                        <Badge variant={FRP_VARIANTS[m.frpMethod] || 'default'} className="text-[9px] px-2 py-0.5 shadow-lg border-0">
                          {m.frpMethod}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{m.brand}</p>
                      <p className="text-sm font-bold leading-tight mt-0.5 line-clamp-2">{m.model}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {m.chipset && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                          <Microchip className="size-2.5" />
                          {m.chipset.length > 20 ? m.chipset.slice(0, 20) + '…' : m.chipset}
                        </span>
                      )}
                      {m.year && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                          <CalendarCog className="size-2.5" />
                          {m.year}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover info overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end p-3">
                    <div className="text-white text-xs space-y-0.5">
                      <p className="font-semibold">{m.brand} {m.model}</p>
                      {m.chipset && <p className="text-white/80">{m.chipset}</p>}
                      {m.year && <p className="text-white/60">{m.year}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
