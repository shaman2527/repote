import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRepairs } from '@/hooks/useRepairs'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Smartphone,
  ArrowRight,
  Check,
} from 'lucide-react'
import type { Repair, RepairStatus } from '@/types'

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completado', label: 'Completados' },
  { value: 'entregado', label: 'Entregados' },
]

export default function ListRepairs() {
  const { repairs, update } = useRepairs()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = repairs.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        r.modelName.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.imei?.toLowerCase().includes(q) ||
        r.serviceType.toLowerCase().includes(q)
      )
    }
    return true
  })

  const advanceStatus = (repair: Repair) => {
    const flow: RepairStatus[] = ['pendiente', 'en_proceso', 'completado', 'entregado']
    const idx = flow.indexOf(repair.status)
    if (idx < flow.length - 1) {
      update({ ...repair, status: flow[idx + 1] })
    }
  }

  return (
    <div className="min-h-screen pb-28 md:pb-0 md:ml-64">
      <div className="container-app p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Equipos</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} registros</p>
          </div>
          <Link to="/add">
            <Button className="gap-2 rounded-xl">
              <Plus className="size-4" />
              Nuevo
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar modelo, marca, IMEI..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-secondary/30 border-0 rounded-xl h-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-secondary/30 border-0 rounded-xl">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectGroup>
                {STATUS_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card className="border-0 glass">
              <CardContent className="p-12 text-center">
                <Smartphone className="size-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay equipos registrados</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((repair) => (
              <Link key={repair.id} to={`/detail/${repair.id}`}>
                <Card className="border-0 glass hover:bg-secondary/30 transition-all hover:translate-x-0.5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="size-10 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                          <Smartphone className="size-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{repair.brand} {repair.modelName}</span>
                            <StatusBadge status={repair.status} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{repair.serviceType}</span>
                            {repair.frpMethodUsed && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1.5">{repair.frpMethodUsed}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">· {repair.dateIn}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-sm font-semibold">${repair.totalPrice.toFixed(2)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault()
                            advanceStatus(repair)
                          }}
                          className="size-8 rounded-lg"
                        >
                          {repair.status === 'entregado' ? <Check className="size-4 text-success" /> : <ArrowRight className="size-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
