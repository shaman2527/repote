import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ModelSelect } from '@/components/ModelSelect'
import { CameraCapture } from '@/components/CameraCapture'
import { useRepairs } from '@/hooks/useRepairs'
import {
  Smartphone,
  Wrench,
  DollarSign,
  Camera,
  FileText,
  ArrowLeft,
  Save,
  X,
  Cpu,
  TestTube,
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

export default function AddRepair() {
  const navigate = useNavigate()
  const { add } = useRepairs()

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [imei, setImei] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('FRP')
  const [frpMethod, setFrpMethod] = useState<FrpMethod>('')
  const [hasTestpointFRP, setHasTestpointFRP] = useState(false)
  const [isSoftware, setIsSoftware] = useState(false)
  const [status, setStatus] = useState<RepairStatus>('pendiente')
  const [price, setPrice] = useState('10')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleModelSelect = (b: string, m: string) => {
    setBrand(b)
    setModel(m)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand || !model) {
      alert('Selecciona una marca y modelo')
      return
    }
    setSaving(true)

    const now = new Date().toISOString()
    const total = parseFloat(price) || 0

    const repair: Repair = {
      id: uuid(),
      dateIn: now.slice(0, 10),
      brand,
      modelName: model,
      imei: imei || undefined,
      serviceType,
      frpMethodUsed: frpMethod || undefined,
      hasTestpointFRP,
      isSoftware,
      screenReplaced: false,
      price: total,
      totalPrice: total,
      status,
      photo: photo || undefined,
      notes: notes || undefined,
      createdAt: now,
      updatedAt: now,
    }

    await add(repair)
    navigate('/list')
  }

  return (
    <div className="min-h-screen pb-28 md:pb-0 md:ml-64">
      <div className="container-app p-5 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="size-9 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Registrar Equipo</h1>
            <p className="text-sm text-muted-foreground">Nuevo ingreso al taller</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Model Selection */}
          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ModelSelect onSelect={handleModelSelect} />
              <div>
                <Label>IMEI (opcional)</Label>
                <Input value={imei} onChange={e => setImei(e.target.value)} placeholder="000000000000000" maxLength={15} className="font-mono" />
              </div>
            </CardContent>
          </Card>

          {/* Service */}
          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wrench className="size-4 text-primary" />
                Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipo de Servicio</Label>
                <Select options={SERVICE_OPTIONS} value={serviceType} onChange={e => setServiceType(e.target.value as ServiceType)} />
              </div>
              <div>
                <Label>Método FRP</Label>
                <Select options={FRP_METHODS} value={frpMethod} onChange={e => setFrpMethod(e.target.value as FrpMethod)} />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={hasTestpointFRP} onChange={e => setHasTestpointFRP(e.target.checked)} className="rounded" />
                  <TestTube className="size-3.5 text-muted-foreground" />
                  Testpoint FRP
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={isSoftware} onChange={e => setIsSoftware(e.target.checked)} className="rounded" />
                  <Cpu className="size-3.5 text-muted-foreground" />
                  Es Software
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Status & Price */}
          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="size-4 text-primary" />
                Estado y Precio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Estado</Label>
                <Select options={STATUS_OPTIONS} value={status} onChange={e => setStatus(e.target.value as RepairStatus)} />
              </div>
              <div>
                <Label>Precio ($)</Label>
                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.5" />
              </div>
            </CardContent>
          </Card>

          {/* Photo */}
          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Camera className="size-4 text-primary" />
                Foto del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CameraCapture onCapture={setPhoto} />
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label className="flex items-center gap-2 mb-1.5">
              <FileText className="size-3.5 text-muted-foreground" />
              Notas
            </Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones, daños, accesorios..." rows={3} />
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="flex-1 gap-2">
              <Save className="size-4" />
              {saving ? 'Guardando...' : 'Registrar Equipo'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/')} className="gap-2">
              <X className="size-4" />
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
