import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import * as db from '@/lib/db'
import { Check, ChevronDown, Smartphone } from 'lucide-react'
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
  const [selectedModel, setSelectedModel] = useState(defaultModel || '')
  const [modelOpen, setModelOpen] = useState(false)

  useEffect(() => {
    if (brand) {
      db.getModelsByBrand(brand).then(setModels)
    } else {
      setModels([])
    }
  }, [brand])

  const handleBrandChange = (value: string) => {
    setBrand(value)
    setSelectedModel('')
    onSelect(value, '')
  }

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName)
    setSearch(modelName)
    setModelOpen(false)
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
          <SelectContent className="bg-popover border-border text-popover-foreground">
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

      {/* Model Search with Popover */}
      {brand && (
        <div>
          <label className="text-sm font-medium mb-1.5 block text-foreground">Modelo</label>
          <Popover open={modelOpen} onOpenChange={setModelOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={modelOpen}
                className="w-full justify-between bg-secondary/30 border-0 text-foreground hover:bg-secondary/50 h-10"
              >
                {selectedModel || 'Buscar modelo...'}
                <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border">
              <Command>
                <CommandInput placeholder="Buscar modelo..." className="text-foreground" />
                <CommandList>
                  <CommandEmpty className="text-muted-foreground py-6 text-center text-sm">
                    No se encontraron modelos
                  </CommandEmpty>
                  <CommandGroup>
                    {models.slice(0, 100).map((m) => (
                      <CommandItem
                        key={m.id}
                        value={`${m.brand} ${m.model} ${m.model.toLowerCase()} ${m.frpMethod || ''}`}
                        onSelect={() => handleModelSelect(m.model)}
                        className="text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground cursor-pointer"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Smartphone className="size-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{m.model}</span>
                          {m.frpMethod && (
                            <span className="text-xs text-muted-foreground ml-auto">({m.frpMethod})</span>
                          )}
                          {m.year && (
                            <span className="text-xs text-muted-foreground">{m.year}</span>
                          )}
                        </div>
                        {selectedModel === m.model && (
                          <Check className="ml-2 size-4 text-primary shrink-0" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
