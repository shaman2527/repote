import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as db from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { useRepairs } from '@/hooks/useRepairs'
import { usePhoneImages } from '@/hooks/usePhoneImages'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  Save,
  Trash2,
  Smartphone,
  DollarSign,
  Calendar,
  Fingerprint,
  TestTube,
  Cpu,
  FileText,
  Image,
  Wrench,
} from 'lucide-react'
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
  { value: 'SPD', label: 'SPD' },
  { value: 'BROM', label: 'BROM' },
  { value: 'Testpoint', label: 'Testpoint' },
  { value: 'UMT', label: 'UMT' },
  { value: 'Octoplus', label: 'Octoplus' },
  { value: 'Bypass', label: 'Bypass' },
  { value: 'EDL', label: 'EDL' },
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

  const { getImage } = usePhoneImages()
  const modelImage = getImage(repair?.brand || '', repair?.modelName || '')

  if (loading) return <div className="p-8 text-center">Cargando...</div>
  if (!repair) return <div className="p-8 text-center">Equipo no encontrado</div>

  const handleSave = async () => {
    await update(repair)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('Eliminar este equipo permanentemente?')) {
      await remove(repair.id)
      navigate('/list')
    }
  }

  const handleStatusAdvance = async () => {
    const flow: RepairStatus[] = ['pendiente', 'en_proceso', 'completado', 'entregado']
    const idx = flow.indexOf(repair.status)
    if (idx < flow.length - 1) {
      const updated = { ...repair, status: flow[idx + 1] }
      if (flow[idx + 1] === 'entregado') updated.dateOut = new Date().toISOString().slice(0, 10)
      await update(updated)
      setRepair(updated)
    }
  }

  const updateField = <K extends keyof Repair>(key: K, value: Repair[K]) => {
    setRepair({ ...repair, [key]: value })
  }

  return (
    <div className="min-h-screen pb-28 md:pb-0 md:ml-64">
      <div className="container-app p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/list')} className="size-9 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{repair.brand} {repair.modelName}</h1>
              <StatusBadge status={repair.status} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button onClick={handleStatusAdvance} className="flex-1 gap-2 rounded-xl h-11">
            {repair.status === 'entregado' ? (
              <><CheckCircle2 className="size-4" /> Entregado</>
            ) : (
              <><ArrowRight className="size-4" /> Avanzar a {{
                pendiente: 'En Proceso',
                en_proceso: 'Completado',
                completado: 'Entregado',
              }[repair.status]}</>
            )}
          </Button>
          <Button variant="outline" onClick={() => setEditing(!editing)} className="gap-2 rounded-xl">
            <Edit3 className="size-4" />
          </Button>
        </div>

        {/* Photo */}
        {(repair.photo || modelImage) && (
          <Card className="border-0 glass overflow-hidden">
            <div className="relative">
              {repair.photo
                ? <img src={repair.photo} alt="Foto del equipo" className="w-full max-h-64 object-cover" />
                : modelImage
                  ? <img src={modelImage} alt={repair.modelName} className="w-full max-h-64 object-contain bg-secondary/30 p-4" />
                  : null
              }
              <div className="absolute top-2 right-2 size-7 rounded-lg bg-black/40 backdrop-blur flex items-center justify-center">
                <Image className="size-3.5 text-white" />
              </div>
            </div>
          </Card>
        )}

        {/* Details */}
        <Card className="border-0 glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="size-4 text-primary" />
              Detalles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { icon: Smartphone, label: 'Marca', value: repair.brand },
                { icon: Smartphone, label: 'Modelo', value: repair.modelName },
                { icon: Wrench, label: 'Servicio', value: repair.serviceType },
                { icon: DollarSign, label: 'Precio', value: `$${repair.totalPrice.toFixed(2)}` },
                { icon: Calendar, label: 'Entrada', value: repair.dateIn },
                ...(repair.dateOut ? [{ icon: Calendar, label: 'Entrega', value: repair.dateOut }] : []),
                ...(repair.imei ? [{ icon: Smartphone, label: 'IMEI', value: repair.imei }] : []),
                ...(repair.frpMethodUsed ? [{ icon: Fingerprint, label: 'Método FRP', value: repair.frpMethodUsed }] : []),
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/30">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <item.icon className="size-3" />
                    {item.label}
                  </div>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${repair.hasTestpointFRP ? 'bg-success/10 text-success' : 'bg-secondary/50 text-muted-foreground'}`}>
                <TestTube className="size-3" />
                Testpoint: {repair.hasTestpointFRP ? 'Sí' : 'No'}
              </span>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${repair.isSoftware ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-muted-foreground'}`}>
                <Cpu className="size-3" />
                Software: {repair.isSoftware ? 'Sí' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {repair.notes && (
          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{repair.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Mode */}
        {editing && (
          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Edit3 className="size-4 text-primary" />
                Editar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Estado</Label>
                <Select value={repair.status} onValueChange={(v) => updateField('status', v as RepairStatus)}>
                  <SelectTrigger className="w-full bg-secondary/30 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectGroup>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Servicio</Label>
                <Select value={repair.serviceType} onValueChange={(v) => updateField('serviceType', v as ServiceType)}>
                  <SelectTrigger className="w-full bg-secondary/30 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectGroup>
                      {SERVICE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Método FRP</Label>
                <Select value={repair.frpMethodUsed || ''} onValueChange={(v) => updateField('frpMethodUsed', v as FrpMethod)}>
                  <SelectTrigger className="w-full bg-secondary/30 border-0">
                    <SelectValue placeholder="N/A" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectGroup>
                      {FRP_METHODS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                <Button onClick={handleSave} className="flex-1 gap-2 rounded-xl">
                  <Save className="size-4" />
                  Guardar
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="gap-2 rounded-xl">
                  <Trash2 className="size-4" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
