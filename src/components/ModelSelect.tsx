import { useState, useEffect } from 'react'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import * as db from '@/lib/db'
import type { PhoneModel } from '@/types'

interface ModelSelectProps {
  onSelect: (brand: string, model: string) => void
  defaultBrand?: string
  defaultModel?: string
}

const BRANDS = [
  'Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Google', 'Nokia',
  'Tecno', 'Infinix', 'Motorola', 'LG', 'Alcatel', 'ZTE', 'BLU',
  'Vivo', 'TCL', 'Blackview', 'Umidigi',
]

export function ModelSelect({ onSelect, defaultBrand, defaultModel }: ModelSelectProps) {
  const [brand, setBrand] = useState(defaultBrand || '')
  const [models, setModels] = useState<PhoneModel[]>([])
  const [search, setSearch] = useState(defaultModel || '')
  const [selectedModel, setSelectedModel] = useState(defaultModel || '')

  const filteredModels = models.filter(m =>
    m.model.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (brand) {
      db.getModelsByBrand(brand).then(setModels)
    } else {
      setModels([])
    }
  }, [brand])

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
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-1 block">Marca</label>
        <Select
          options={BRANDS.map(b => ({ value: b, label: b }))}
          placeholder="Seleccionar marca..."
          value={brand}
          onChange={(e) => handleBrandChange(e.target.value)}
        />
      </div>
      {brand && (
        <div>
          <label className="text-sm font-medium mb-1 block">Modelo</label>
          <Input
            placeholder="Buscar modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {filteredModels.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
              {filteredModels.slice(0, 30).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedModel === m.model
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => handleModelSelect(m.model)}
                >
                  {m.model}
                  {m.frpMethod && (
                    <span className="ml-2 text-xs opacity-70">({m.frpMethod})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
