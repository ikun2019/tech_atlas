import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <div className="border-border rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <Icon className="text-muted-foreground size-5" />
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
      {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
    </div>
  )
}
