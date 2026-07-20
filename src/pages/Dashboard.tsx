import { useRepairs } from '@/hooks/useRepairs'
import { StatsCard } from '@/components/StatsCard'
import { StatusBadge } from '@/components/StatusBadge'
import { ThreeBackground } from '@/components/ThreeBackground'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Repair } from '@/types'

function MiniList({ repairs }: { repairs: Repair[] }) {
  if (repairs.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">Sin equipos</p>
  return (
    <div className="space-y-2">
      {repairs.slice(0, 5).map((r) => (
        <div key={r.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-secondary/50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate font-medium">{r.brand} {r.modelName}</span>
            <span className="text-xs text-muted-foreground shrink-0">{r.serviceType}</span>
          </div>
          <StatusBadge status={r.status} />
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { repairs, getStats } = useRepairs()
  const stats = getStats()
  const today = new Date().toISOString().slice(0, 10)
  const todayRepairs = repairs.filter(r => r.dateIn === today)

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:ml-64">
      <ThreeBackground />

      <div className="container-center p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Control de reparaciones</p>
          </div>
          <Badge variant="outline" className="text-sm">${stats.earnings.toFixed(2)} total</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatsCard title="Pendientes" value={stats.pending} color="#f59e0b" />
          <StatsCard title="En Proceso" value={stats.inProgress} color="#3b82f6" />
          <StatsCard title="Completados" value={stats.completed} color="#22c55e" />
          <StatsCard title="Entregados" value={stats.delivered} color="#64748b" />
        </div>

        {/* Earnings */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Hoy</p>
              <p className="text-xl font-bold text-success">${stats.todayEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Semana</p>
              <p className="text-xl font-bold text-primary">${stats.weekEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Mes</p>
              <p className="text-xl font-bold text-warning">${stats.monthEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Today's Repairs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Equipos hoy ({todayRepairs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniList repairs={todayRepairs} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Últimos equipos</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniList repairs={repairs} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
