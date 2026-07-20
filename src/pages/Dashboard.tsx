import { useMemo } from 'react'
import { useRepairs } from '@/hooks/useRepairs'
import { StatsCard } from '@/components/StatsCard'
import { StatusBadge } from '@/components/StatusBadge'
import { ThreeBackground } from '@/components/ThreeBackground'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChartContainer, chartColors } from '@/components/ui/chart'
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Package,
  DollarSign,
  ArrowUpRight,
  Smartphone,
  Wrench,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import type { Repair } from '@/types'

function MiniList({ repairs, title }: { repairs: Repair[]; title: string }) {
  if (repairs.length === 0) return <p className="text-sm text-muted-foreground py-6 text-center">Sin equipos</p>
  return (
    <div className="space-y-1">
      {repairs.slice(0, 5).map((r) => (
        <div key={r.id} className="flex items-center justify-between text-sm p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Smartphone className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{r.brand} {r.modelName}</p>
              <p className="text-xs text-muted-foreground">{r.serviceType} · {r.dateIn}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold">${r.totalPrice.toFixed(2)}</span>
            <StatusBadge status={r.status} />
          </div>
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

  // Chart data - last 7 days earnings
  const chartData = useMemo(() => {
    const days: Record<string, { date: string; earnings: number; count: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days[key] = { date: key.slice(5), earnings: 0, count: 0 }
    }
    repairs.filter(r => r.status === 'entregado').forEach(r => {
      if (days[r.dateIn]) {
        days[r.dateIn].earnings += r.totalPrice
        days[r.dateIn].count++
      }
    })
    return Object.values(days)
  }, [repairs])

  // Service distribution
  const serviceData = useMemo(() => {
    const counts: Record<string, number> = {}
    repairs.forEach(r => {
      counts[r.serviceType] = (counts[r.serviceType] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [repairs])

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:ml-64">
      <ThreeBackground />

      <div className="container-app p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Resumen de reparaciones</p>
          </div>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <DollarSign className="size-3.5" />
            ${stats.earnings.toFixed(2)}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatsCard
            title="Pendientes"
            value={stats.pending}
            icon={Clock}
            color={chartColors.orange}
          />
          <StatsCard
            title="En Proceso"
            value={stats.inProgress}
            icon={Wrench}
            color={chartColors.blue}
          />
          <StatsCard
            title="Completados"
            value={stats.completed}
            icon={CheckCircle2}
            color={chartColors.green}
          />
          <StatsCard
            title="Entregados"
            value={stats.delivered}
            icon={Package}
            color={chartColors.gray}
          />
        </div>

        {/* Earnings Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Hoy', value: stats.todayEarnings, color: chartColors.green },
            { label: 'Semana', value: stats.weekEarnings, color: chartColors.blue },
            { label: 'Mes', value: stats.monthEarnings, color: chartColors.orange },
          ].map((item) => (
            <Card key={item.label} className="border-0 bg-secondary/30">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <DollarSign className="size-4" style={{ color: item.color }} />
                  <p className="text-xl font-bold" style={{ color: item.color }}>
                    {item.value.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Earnings Chart */}
        <Card className="border-0 glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Ganancias (7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.blue} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColors.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1c24" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#8e8e93" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#8e8e93" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      background: '#14141a',
                      border: '1px solid #1c1c24',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="earnings" stroke={chartColors.blue} fill="url(#earningsGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Services Distribution */}
        <Card className="border-0 glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              Servicios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={serviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1c24" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#8e8e93" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#8e8e93" />
                  <Tooltip
                    contentStyle={{
                      background: '#14141a',
                      border: '1px solid #1c1c24',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" fill={chartColors.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Separator />

        {/* Today's and Recent */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Hoy ({todayRepairs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniList repairs={todayRepairs} title="hoy" />
            </CardContent>
          </Card>

          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Últimos equipos</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniList repairs={repairs} title="últimos" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
