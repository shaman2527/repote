import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRepairs } from '@/hooks/useRepairs'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Repair, RepairStatus } from '@/types'

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completado', label: 'Completados' },
  { value: 'entregado', label: 'Entregados' },
]

export default function ListRepairs() {
  const { repairs, update, remove } = useRepairs()
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
    <div className="min-h-screen pb-24 md:pb-0 md:ml-64">
      <div className="container-center p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Equipos ({filtered.length})</h1>
          <Link to="/add">
            <Button size="sm">+ Nuevo</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Input
            placeholder="Buscar modelo, marca, IMEI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-36"
          />
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No hay equipos registrados
              </CardContent>
            </Card>
          ) : (
            filtered.map((repair) => (
              <Link key={repair.id} to={`/detail/${repair.id}`}>
                <Card className="hover:bg-secondary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{repair.brand} {repair.modelName}</span>
                          <StatusBadge status={repair.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{repair.serviceType}</span>
                          {repair.frpMethodUsed && (
                            <Badge variant="outline" className="text-[10px]">{repair.frpMethodUsed}</Badge>
                          )}
                          <span>{repair.dateIn}</span>
                          <span>${repair.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          advanceStatus(repair)
                        }}
                        className="shrink-0"
                      >
                        {repair.status === 'entregado' ? '✓' : '→'}
                      </Button>
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
