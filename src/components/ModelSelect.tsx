import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import * as db from '@/lib/db'
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

  useEffect(() => {
    if (brand) {
      db.getModelsByBrand(brand).then(setModels)
    } else {
      setModels([])
    }
  }, [brand])

  const filteredModels = models.filter(m =>
    m.model.toLowerCase().includes(search.toLowerCase())
  )

  const handleBrandChange = (value: string) => {
    setBrand(value)
    setSearch('')
    setSelectedModel('')
    onSelect(value, '')
  }

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName)
    setSearch(modelName)
    onSelect(brand, modelName)
  }

  return (
    <div className="space-y-4">
      {/* Brand Select - shadcn proper */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Marca</label>
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

      {/* Model search with results */}
      {brand && (
        <div>
          <label className="text-sm font-medium mb-1.5 block">Modelo</label>
          <Input
            placeholder="Buscar modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary/30 border-0"
          />
          {filteredModels.length > 0 && (
            <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-border bg-card p-1.5 space-y-0.5 shadow-lg">
              {filteredModels.slice(0, 40).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedModel === m.model
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                  }`}
                  onClick={() => handleModelSelect(m.model)}
                >
                  <span className="font-medium">{m.model}</span>
                  {m.frpMethod && (
                    <span className="ml-2 text-xs opacity-70">({m.frpMethod})</span>
                  )}
                  {m.year && (
                    <span className="ml-2 text-xs text-muted-foreground">{m.year}</span>
                  )}
                </button>
              ))}
            </div>
          )}
          {search && filteredModels.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">Sin resultados para "{search}"</p>
          )}
        </div>
      )}
    </div>
  )
}
