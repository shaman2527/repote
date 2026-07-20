import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import * as db from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Separator } from '@/components/ui/separator'
import { useRepairs } from '@/hooks/useRepairs'
import type { Repair, ServiceType, FrpMethod, RepairStatus } from '@/types'

const SERVICE_OPTIONS = [
  { value: 'FRP', label: 'FRP' },
  { value: 'Software', label: 'Software' },
  { value: 'Cambio pantalla', label: 'Cambio Pantalla' },
  { value: 'Batería', label: 'Batería' },
  { value: 'Pinout', label: 'Pinout' },
  { value: 'Otro', label: 'Otro' },
]

const FRP_METHODS = [
  { value: '', label: 'N/A' },
  { value: 'SPD', label: 'SPD (Spreadtrum/Unisoc)' },
  { value: 'BROM', label: 'BROM (MediaTek)' },
  { value: 'Testpoint', label: 'Testpoint (Qualcomm)' },
  { value: 'UMT', label: 'UMT' },
  { value: 'Octoplus', label: 'Octoplus' },
  { value: 'Bypass', label: 'Bypass Software' },
  { value: 'EDL', label: 'EDL (Qualcomm)' },
]

const STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completado', label: 'Completado' },
  { value: 'entregado', label: 'Entregado' },
]

export default function DetailRepair() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { update, remove } = useRepairs()

  const [repair, setRepair] = useState<Repair | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (id) {
      db.getRepair(id).then((r) => {
        setRepair(r || null)
        setLoading(false)
      })
    }
  }, [id])

  if (loading) return <div className="p-8 text-center">Cargando...</div>
  if (!repair) return <div className="p-8 text-center">Equipo no encontrado</div>

  const handleSave = async () => {
    await update(repair)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('¿Eliminar este equipo definitivamente?')) {
      await remove(repair.id)
      navigate('/list')
    }
  }

  const handleStatusAdvance = async () => {
    const flow: RepairStatus[] = ['pendiente', 'en_proceso', 'completado', 'entregado']
    const idx = flow.indexOf(repair.status)
    if (idx < flow.length - 1) {
      const updated = { ...repair, status: flow[idx + 1] }
      if (flow[idx + 1] === 'entregado') {
        updated.dateOut = new Date().toISOString().slice(0, 10)
      }
      await update(updated)
      setRepair(updated)
    }
  }

  const updateField = <K extends keyof Repair>(key: K, value: Repair[K]) => {
    setRepair({ ...repair, [key]: value })
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:ml-64">
      <div className="container-center p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/list')}>← Volver</Button>
          <div className="flex gap-2">
            <StatusBadge status={repair.status} />
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button onClick={handleStatusAdvance} className="flex-1">
            {repair.status === 'entregado' ? '✓ Entregado' : `Avanzar a → ${{
              pendiente: 'En Proceso',
              en_proceso: 'Completado',
              completado: 'Entregado',
            }[repair.status]}`}
          </Button>
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {/* Photo */}
        {repair.photo && (
          <Card>
            <CardContent className="p-2">
              <img src={repair.photo} alt="Foto del equipo" className="w-full rounded-lg" />
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Detalles del Equipo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Marca</p>
                <p className="font-medium">{repair.brand}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Modelo</p>
                <p className="font-medium">{repair.modelName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Servicio</p>
                <p className="font-medium">{repair.serviceType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Precio</p>
                <p className="font-medium text-success">${repair.totalPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha Entrada</p>
                <p className="font-medium">{repair.dateIn}</p>
              </div>
              {repair.dateOut && (
                <div>
                  <p className="text-muted-foreground">Fecha Entrega</p>
                  <p className="font-medium">{repair.dateOut}</p>
                </div>
              )}
              {repair.imei && (
                <div>
                  <p className="text-muted-foreground">IMEI</p>
                  <p className="font-mono text-xs">{repair.imei}</p>
                </div>
              )}
              {repair.frpMethodUsed && (
                <div>
                  <p className="text-muted-foreground">Método FRP</p>
                  <p className="font-medium">{repair.frpMethodUsed}</p>
                </div>
              )}
            </div>
            <div className="flex gap-4 text-xs">
              <span>Testpoint: {repair.hasTestpointFRP ? '✓ Sí' : '✗ No'}</span>
              <span>Software: {repair.isSoftware ? '✓ Sí' : '✗ No'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {repair.notes && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Notas</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{repair.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Mode */}
        {editing && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Editar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Estado</Label>
                <Select options={STATUS_OPTIONS} value={repair.status} onChange={e => updateField('status', e.target.value as RepairStatus)} />
              </div>
              <div>
                <Label>Tipo de Servicio</Label>
                <Select options={SERVICE_OPTIONS} value={repair.serviceType} onChange={e => updateField('serviceType', e.target.value as ServiceType)} />
              </div>
              <div>
                <Label>Método FRP</Label>
                <Select options={FRP_METHODS} value={repair.frpMethodUsed || ''} onChange={e => updateField('frpMethodUsed', e.target.value as FrpMethod)} />
              </div>
              <div>
                <Label>Precio ($)</Label>
                <Input type="number" value={repair.price} onChange={e => updateField('price', parseFloat(e.target.value) || 0)} min="0" step="0.5" />
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea value={repair.notes || ''} onChange={e => updateField('notes', e.target.value)} rows={3} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">Guardar Cambios</Button>
                <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
