import { useState, useEffect, useCallback } from 'react'
import type { Repair, DailyStats } from '@/types'
import * as db from '@/lib/db'

export function useRepairs() {
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await db.getAllRepairs()
    setRepairs(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const add = async (repair: Repair) => {
    await db.addRepair(repair)
    await load()
  }

  const update = async (repair: Repair) => {
    await db.updateRepair({ ...repair, updatedAt: new Date().toISOString() })
    await load()
  }

  const remove = async (id: string) => {
    await db.deleteRepair(id)
    await load()
  }

  const clearAll = async () => {
    await db.clearAllRepairs()
    await load()
  }

  const getStats = useCallback((): DailyStats => {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().slice(0, 10)
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const pending = repairs.filter(r => r.status === 'pendiente').length
    const inProgress = repairs.filter(r => r.status === 'en_proceso').length
    const completed = repairs.filter(r => r.status === 'completado').length
    const delivered = repairs.filter(r => r.status === 'entregado').length

    const todayEarnings = repairs
      .filter(r => r.status === 'entregado' && r.dateIn.slice(0, 10) === today)
      .reduce((sum, r) => sum + r.totalPrice, 0)

    const weekEarnings = repairs
      .filter(r => r.status === 'entregado' && r.dateIn >= weekStartStr)
      .reduce((sum, r) => sum + r.totalPrice, 0)

    const monthEarnings = repairs
      .filter(r => r.status === 'entregado' && r.dateIn >= monthStart)
      .reduce((sum, r) => sum + r.totalPrice, 0)

    const earnings = repairs
      .filter(r => r.status === 'entregado')
      .reduce((sum, r) => sum + r.totalPrice, 0)

    return {
      total: repairs.length,
      pending,
      inProgress,
      completed,
      delivered,
      earnings,
      todayEarnings,
      weekEarnings,
      monthEarnings,
    }
  }, [repairs])

  return { repairs, loading, add, update, remove, clearAll, getStats, refresh: load }
}
