import { cn } from '@/lib/utils'

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export function ChartContainer({ title, description, className, children, ...props }: ChartContainerProps) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {(title || description) && (
        <div className="mb-4">
          {title && <p className="text-sm font-medium">{title}</p>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export const chartColors = {
  blue: 'hsl(217, 91%, 60%)',
  green: 'hsl(142, 71%, 45%)',
  red: 'hsl(0, 84%, 60%)',
  orange: 'hsl(32, 95%, 55%)',
  purple: 'hsl(271, 81%, 56%)',
  teal: 'hsl(173, 80%, 40%)',
  gray: 'hsl(215, 16%, 47%)',
}
