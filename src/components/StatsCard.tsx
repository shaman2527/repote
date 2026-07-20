import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  color?: string
}

export function StatsCard({ title, value, subtitle, icon: Icon, color }: StatsCardProps) {
  return (
    <Card className="border-0 glass">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="size-10 rounded-xl bg-secondary/50 flex items-center justify-center">
              <Icon className="size-5" style={{ color }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
