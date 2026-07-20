import { Badge } from '@/components/ui/badge'
import type { RepairStatus } from '@/types'

const statusConfig: Record<RepairStatus, { label: string; variant: 'default' | 'warning' | 'success' | 'outline' }> = {
  pendiente: { label: 'Pendiente', variant: 'default' },
  en_proceso: { label: 'En Proceso', variant: 'warning' },
  completado: { label: 'Completado', variant: 'success' },
  entregado: { label: 'Entregado', variant: 'outline' },
}

export function StatusBadge({ status }: { status: RepairStatus }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
