import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const colorMap: Record<string, { gradient: string; bg: string; iconBg: string }> = {
  blue: {
    gradient: 'from-primary to-primary-light',
    bg: 'bg-primary-bg',
    iconBg: 'bg-primary-bg',
  },
  green: {
    gradient: 'from-success to-success-light',
    bg: 'bg-success-bg',
    iconBg: 'bg-success-bg',
  },
  purple: {
    gradient: 'from-primary-dark to-primary',
    bg: 'bg-primary-bg',
    iconBg: 'bg-primary-bg',
  },
  orange: {
    gradient: 'from-secondary to-secondary-light',
    bg: 'bg-secondary-bg',
    iconBg: 'bg-secondary-bg',
  },
  red: {
    gradient: 'from-secondary to-secondary-light',
    bg: 'bg-secondary-bg',
    iconBg: 'bg-secondary-bg',
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'purple',
}: StatCardProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-secondary',
    neutral: 'text-ink-muted',
  }

  const scheme = colorMap[color] || colorMap.purple

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group p-5 rounded-3xl border border-border/60 bg-white shadow-card hover:shadow-card-hover transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            {title}
          </p>
          <p className="text-3xl font-black text-ink tracking-tighter">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs font-semibold text-ink-muted">{subtitle}</p>
          )}
          {trend && trendValue && (
            <p className={`text-xs font-bold ${trendColors[trend]}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
            </p>
          )}
        </div>
        <div className={`flex items-center justify-center w-11 h-11 rounded-2xl ${scheme.iconBg} transition-all`}>
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${scheme.gradient} flex items-center justify-center shadow-sm`}>
            <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
