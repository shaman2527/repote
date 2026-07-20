import { useState, useEffect, useRef } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import * as db from '@/lib/db'
import { Smartphone, Check, ChevronDown, Search } from 'lucide-react'
import type { PhoneModel } from '@/types'

const BRANDS = [
  'Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Google', 'Nokia',
  'Tecno', 'Infinix', 'Motorola', 'LG', 'Alcatel', 'ZTE', 'BLU',
  'Vivo', 'TCL', 'Blackview', 'Umidigi', 'POCO',
]

interface ModelSelectProps {
  onSelect: (brand: string, model: string) => void
  defaultBrand?: string
  defaultModel?: string
}

export function ModelSelect({ onSelect, defaultBrand, defaultModel }: ModelSelectProps) {
  const [brand, setBrand] = useState(defaultBrand || '')
  const [models, setModels] = useState<PhoneModel[]>([])
  const [search, setSearch] = useState(defaultModel || '')
  const [selectedModel, setSelectedModel] = useState(defaultModel || '')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (brand) {
      db.getModelsByBrand(brand).then(setModels)
    } else {
      setModels([])
    }
  }, [brand])

  // Close results when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredModels = models.filter(m =>
    m.model.toLowerCase().includes(search.toLowerCase())
  )

  const handleBrandChange = (value: string) => {
    setBrand(value)
    setSearch('')
    setSelectedModel('')
    onSelect(value, '')
    setShowResults(true)
  }

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName)
    setSearch(modelName)
    setShowResults(false)
    onSelect(brand, modelName)
  }

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
            <div className="mt-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
              {filteredModels.slice(0, 60).map((m) => (
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
                  {m.frpMethod && (
                    <span className="text-xs text-muted-foreground shrink-0">({m.frpMethod})</span>
                  )}
                  {m.year && (
                    <span className="text-xs text-muted-foreground shrink-0">{m.year}</span>
                  )}
                  {selectedModel === m.model && (
                    <Check className="size-4 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected display */}
      {selectedModel && !showResults && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-sm text-foreground">
          <Smartphone className="size-4 text-muted-foreground" />
          <span className="font-medium">{brand} {selectedModel}</span>
        </div>
      )}
    </div>
  )
}
