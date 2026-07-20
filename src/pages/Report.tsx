import { useState } from 'react'
import { useRepairs } from '@/hooks/useRepairs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import * as XLSX from 'xlsx'

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

    // Auto-size columns
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
    <div className="min-h-screen pb-24 md:pb-0 md:ml-64">
      <div className="container-center p-4 space-y-4">
        <h1 className="text-2xl font-bold">Reportes</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Total Equipos</p>
              <p className="text-xl font-bold">{repairs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Filtrados</p>
              <p className="text-xl font-bold">{filtered.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Entregados</p>
              <p className="text-xl font-bold">{stats.delivered}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Ganancias</p>
              <p className="text-xl font-bold text-success">${stats.earnings.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Date Filter */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Filtrar por Fecha</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label>Desde</Label>
                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div className="flex-1">
                <Label>Hasta</Label>
                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <div className="flex gap-3">
          <Button onClick={exportToExcel} className="flex-1">
            📊 Exportar Excel
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="flex-1">
            📄 Exportar CSV
          </Button>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Vista Previa ({filtered.length} registros)</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">Modelo</th>
                  <th className="text-left p-2">Servicio</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-right p-2">Precio</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map(r => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="p-2">{r.dateIn}</td>
                    <td className="p-2">{r.brand} {r.modelName}</td>
                    <td className="p-2">{r.serviceType}</td>
                    <td className="p-2">{r.status}</td>
                    <td className="p-2 text-right">${r.totalPrice.toFixed(2)}</td>
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
