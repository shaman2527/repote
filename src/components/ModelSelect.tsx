import { useState, useEffect, useRef } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import * as db from '@/lib/db'
import { getCompatibleScreens, detectSeries } from '@/lib/screen-compatibility'
import { Smartphone, Check, Search, MonitorSmartphone, DollarSign, Package } from 'lucide-react'
import type { PhoneModel, ScreenPart } from '@/types'

const BRANDS = [
  'Samsung', 'Xiaomi', 'Tecno', 'Infinix', 'Apple', 'Huawei',
  'Motorola', 'LG', 'Google', 'Nokia', 'POCO', 'Alcatel', 'ZTE',
  'Vivo', 'BLU', 'TCL', 'Blackview', 'Umidigi',
]

interface ModelSelectProps {
  onSelect: (brand: string, model: string) => void
  defaultBrand?: string
  defaultModel?: string
  showScreens?: boolean
}

export function ModelSelect({ onSelect, defaultBrand, defaultModel, showScreens = true }: ModelSelectProps) {
  const [brand, setBrand] = useState(defaultBrand || '')
  const [models, setModels] = useState<PhoneModel[]>([])
  const [search, setSearch] = useState(defaultModel || '')
  const [selectedModel, setSelectedModel] = useState(defaultModel || '')
  const [showResults, setShowResults] = useState(false)
  const [compatibleScreens, setCompatibleScreens] = useState<ScreenPart[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (brand) {
      db.getModelsByBrand(brand).then(setModels)
    } else {
      setModels([])
    }
  }, [brand])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Cargar pantallas compatibles al seleccionar modelo
  useEffect(() => {
    if (brand && selectedModel) {
      const screens = getCompatibleScreens(brand, selectedModel)
      setCompatibleScreens(screens)
    } else {
      setCompatibleScreens([])
    }
  }, [brand, selectedModel])

  const filteredModels = models.filter(m =>
    m.model.toLowerCase().includes(search.toLowerCase())
  )

  const handleBrandChange = (value: string) => {
    setBrand(value)
    setSearch('')
    setSelectedModel('')
    setCompatibleScreens([])
    onSelect(value, '')
  }

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName)
    setSearch(modelName)
    setShowResults(false)
    onSelect(brand, modelName)
  }

  const series = selectedModel ? detectSeries(brand, selectedModel) : null

  return (
    <div className="space-y-4">
      {/* Brand Select */}
      <div>
        <label className="text-sm font-medium mb-1.5 block text-foreground">Marca</label>
        <Select value={brand} onValueChange={handleBrandChange}>
          <SelectTrigger className="w-full bg-secondary/30 border-0">
            <SelectValue placeholder="Seleccionar marca..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectGroup>
              {BRANDS.map((b) => (
                <SelectItem key={b} value={b} className="cursor-pointer">
                  {b}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Model Search */}
      {brand && (
        <div className="relative" ref={searchRef}>
          <label className="text-sm font-medium mb-1.5 block text-foreground">Modelo</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar modelo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              className="pl-9 bg-secondary/30 border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Results dropdown */}
          {showResults && search && filteredModels.length === 0 && (
            <div className="mt-1 rounded-xl border border-border bg-card p-4 text-center shadow-lg">
              <p className="text-sm text-muted-foreground">Sin resultados para "{search}"</p>
            </div>
          )}

          {showResults && filteredModels.length > 0 && (
            <div className="mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-lg divide-y divide-border/50">
              {filteredModels.slice(0, 60).map((m) => {
                const s = detectSeries(m.brand, m.model)
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left ${
                      selectedModel === m.model
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary text-foreground'
                    }`}
                    onClick={() => handleModelSelect(m.model)}
                  >
                    <Smartphone className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium flex-1">{m.model}</span>
                    {s && (
                      <Badge className={`text-[9px] px-1.5 py-0 ${s.bgClass} ${s.textClass} border-0`}>
                        {s.name}
                      </Badge>
                    )}
                    {m.frpMethod && (
                      <span className="text-xs text-muted-foreground shrink-0">{m.frpMethod}</span>
                    )}
                    {selectedModel === m.model && (
                      <Check className="size-4 text-primary shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected model info */}
      {selectedModel && !showResults && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary/50 text-sm text-foreground">
            <Smartphone className="size-4 text-muted-foreground" />
            <span className="font-medium">{brand} {selectedModel}</span>
            {series && (
              <Badge className={`ml-auto text-[10px] px-2 py-0.5 ${series.bgClass} ${series.textClass} border-0`}>
                {series.name}
              </Badge>
            )}
          </div>

          {/* Compatible Screens */}
          {showScreens && compatibleScreens.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card/50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <MonitorSmartphone className="size-3" />
                Pantallas compatibles ({compatibleScreens.length})
              </div>
              <div className="space-y-1.5">
                {compatibleScreens.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-secondary/30">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                        {s.screenType}
                      </span>
                      <span className="truncate text-muted-foreground">{s.model}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-semibold text-foreground">${s.retailPrice.toFixed(2)}</span>
                      <Package className={`size-3 ${s.stockStatus === 'disponible' ? 'text-success' : 'text-destructive'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
