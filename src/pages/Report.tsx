import { useState, useMemo } from 'react'
import { useRepairs } from '@/hooks/useRepairs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ChartContainer, chartColors } from '@/components/ui/chart'
import * as XLSX from 'xlsx'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar as CalendarIcon,
  DollarSign,
  Smartphone,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

export default function Report() {
  const { repairs, getStats } = useRepairs()
  const stats = getStats()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filtered = repairs.filter(r => {
    if (fromDate && r.dateIn < fromDate) return false
    if (toDate && r.dateIn > toDate) return false
    return true
  })

  // Service distribution for pie chart
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach(r => { counts[r.serviceType] = (counts[r.serviceType] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filtered])

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filtered])

  const PIE_COLORS = [chartColors.blue, chartColors.orange, chartColors.green, chartColors.purple, chartColors.red, chartColors.teal]
  const BAR_COLORS: Record<string, string> = {
    pendiente: chartColors.orange,
    en_proceso: chartColors.blue,
    completado: chartColors.green,
    entregado: chartColors.gray,
  }

  const exportToExcel = () => {
    const data = filtered.map(r => ({
      Fecha: r.dateIn,
      'Fecha Entrega': r.dateOut || '',
      Marca: r.brand,
      Modelo: r.modelName,
      IMEI: r.imei || '',
      Servicio: r.serviceType,
      'Método FRP': r.frpMethodUsed || '',
      Testpoint: r.hasTestpointFRP ? 'Sí' : 'No',
      Software: r.isSoftware ? 'Sí' : 'No',
      Estado: r.status,
      Precio: r.totalPrice,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reparaciones')
    const colWidths = Object.keys(data[0] || {}).map(k => ({ wch: Math.max(k.length, 15) }))
    ws['!cols'] = colWidths
    XLSX.writeFile(wb, `repote-reporte-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const exportToCSV = () => {
    const headers = ['Fecha', 'Fecha Entrega', 'Marca', 'Modelo', 'IMEI', 'Servicio', 'Método FRP', 'Testpoint', 'Software', 'Estado', 'Precio']
    const rows = filtered.map(r => [
      r.dateIn, r.dateOut || '', r.brand, r.modelName, r.imei || '',
      r.serviceType, r.frpMethodUsed || '', r.hasTestpointFRP ? 'Sí' : 'No',
      r.isSoftware ? 'Sí' : 'No', r.status, r.totalPrice,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `repote-reporte-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen pb-28 md:pb-0 md:ml-64">
      <div className="container-app p-5 space-y-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">Análisis y exportación de datos</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: repairs.length, icon: Smartphone, color: chartColors.blue },
            { label: 'Filtrados', value: filtered.length, icon: Smartphone, color: chartColors.teal },
            { label: 'Entregados', value: stats.delivered, icon: TrendingUp, color: chartColors.green },
            { label: 'Ganancias', value: `$${filtered.reduce((s, r) => s + r.totalPrice, 0).toFixed(0)}`, icon: DollarSign, color: chartColors.orange },
          ].map((item) => (
            <Card key={item.label} className="border-0 glass">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold mt-0.5">{item.value}</p>
                </div>
                <div className="size-9 rounded-xl bg-secondary/50 flex items-center justify-center">
                  <item.icon className="size-4" style={{ color: item.color }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                Por Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c24" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#8e8e93" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#8e8e93" />
                    <Tooltip contentStyle={{ background: '#14141a', border: '1px solid #1c1c24', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={BAR_COLORS[entry.name] || chartColors.blue} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-0 glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChartIcon className="size-4 text-primary" />
                Por Servicio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} innerRadius={30} dataKey="value" label={({ name }) => name}>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#14141a', border: '1px solid #1c1c24', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Date Filter */}
        <Card className="border-0 glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="size-4 text-primary" />
              Filtrar por Fecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label>Desde</Label>
                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-secondary/30 border-0 rounded-xl" />
              </div>
              <div className="flex-1">
                <Label>Hasta</Label>
                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-secondary/30 border-0 rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <div className="flex gap-3">
          <Button onClick={exportToExcel} className="flex-1 gap-2 rounded-xl h-12">
            <FileSpreadsheet className="size-4" />
            Exportar Excel
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="flex-1 gap-2 rounded-xl h-12">
            <FileText className="size-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Preview */}
        <Card className="border-0 glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{filtered.length} registros</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border/50">
                  <th className="text-left p-2.5 font-medium">Fecha</th>
                  <th className="text-left p-2.5 font-medium">Modelo</th>
                  <th className="text-left p-2.5 font-medium">Servicio</th>
                  <th className="text-left p-2.5 font-medium">Estado</th>
                  <th className="text-right p-2.5 font-medium">Precio</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map(r => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="p-2.5">{r.dateIn}</td>
                    <td className="p-2.5 font-medium">{r.brand} {r.modelName}</td>
                    <td className="p-2.5">{r.serviceType}</td>
                    <td className="p-2.5"><span className="capitalize">{r.status}</span></td>
                    <td className="p-2.5 text-right font-medium">${r.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Re-export PieChartIcon since lucide doesn't have it
function PieChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  )
}
