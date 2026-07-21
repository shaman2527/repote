import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRepairs } from '@/hooks/useRepairs'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  Search,
  Plus,
  Smartphone,
  ArrowRight,
  Check,
  Trash2,
  AlertTriangle,
  RefreshCw,
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
  const { repairs, update, remove, clearAll } = useRepairs()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [resetConfirm, setResetConfirm] = useState(false)

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
      const updated = { ...repair, status: flow[idx + 1] }
      if (flow[idx + 1] === 'entregado') updated.dateOut = new Date().toISOString().slice(0, 10)
      update(updated)
    }
  }

  const handleDelete = async (id: string) => {
    await remove(id)
    setDeleteConfirm(null)
  }

  const handleResetAll = async () => {
    await clearAll()
    setResetConfirm(false)
  }

  return (
    <div className="min-h-screen pb-28 md:pb-0 md:ml-64">
      <div className="container-app p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Equipos</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} de {repairs.length} registros</p>
          </div>
          <div className="flex gap-2">
            {repairs.length > 0 && (
              <Button variant="ghost" size="icon" onClick={() => setResetConfirm(true)} className="size-9 rounded-xl" title="Reiniciar datos">
                <RefreshCw className="size-4" />
              </Button>
            )}
            <Link to="/add">
              <Button className="gap-2 rounded-xl">
                <Plus className="size-4" />
                Nuevo
              </Button>
            </Link>
          </div>
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
                {repairs.length === 0 && (
                  <Link to="/add">
                    <Button className="mt-4 gap-2 rounded-xl">
                      <Plus className="size-4" />
                      Registrar primer equipo
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filtered.map((repair) => (
              <div key={repair.id} className="group relative">
                <Link to={`/detail/${repair.id}`}>
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
                        <div className="flex items-center gap-1 shrink-0 ml-3">
                          <span className="text-sm font-semibold mr-1">${repair.totalPrice.toFixed(2)}</span>
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault()
                              setDeleteConfirm(repair.id)
                            }}
                            className="size-8 rounded-lg text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                Eliminar equipo
              </DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. El equipo será eliminado permanentemente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
                <Trash2 className="size-4" />
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset All Confirmation */}
        <Dialog open={resetConfirm} onOpenChange={() => setResetConfirm(false)}>
          <DialogContent className="border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                Reiniciar todos los datos
              </DialogTitle>
              <DialogDescription>
                Se eliminarán todos los equipos registrados ({repairs.length} registros). Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setResetConfirm(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleResetAll}>
                <RefreshCw className="size-4" />
                Reiniciar todo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
