import { Badge } from '@/components/ui/badge'
import { Clock, Wrench, CheckCircle2, Package } from 'lucide-react'
import type { RepairStatus } from '@/types'

const statusConfig: Record<RepairStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'outline'; icon: typeof Clock }> = {
  pendiente: { label: 'Pendiente', variant: 'default', icon: Clock },
  en_proceso: { label: 'En Proceso', variant: 'warning', icon: Wrench },
  completado: { label: 'Completado', variant: 'success', icon: CheckCircle2 },
  entregado: { label: 'Entregado', variant: 'outline', icon: Package },
}

export function StatusBadge({ status }: { status: RepairStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <Badge variant={config.variant} className="gap-1 py-1">
      <Icon className="size-3" />
      {config.label}
    </Badge>
  )
}
