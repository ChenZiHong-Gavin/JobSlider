import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showPercentage?: boolean
}

export function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-bold">
        {label && <span className="text-ink-muted">{label}</span>}
        <span className="text-ink-secondary">
          {current}/{total}
          {showPercentage && (
            <span className="text-ink-muted ml-1">({percentage}%)</span>
          )}
        </span>
      </div>
      <div className="w-full h-3 bg-primary-bg rounded-full overflow-hidden shadow-inner-soft">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

interface XpBarProps {
  current: number
  total: number
  level?: number
}

export function XpBar({ current, total, level = 1 }: XpBarProps) {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-gold to-gold-light shadow-glow-gold text-xs font-black text-white">
        {level}
      </div>
      <div className="flex-1">
        <div className="w-full h-2.5 bg-gold-bg rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
      <span className="text-xs font-bold text-gold">{current} XP</span>
    </div>
  )
}

interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  label?: string
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#8b5cf6',
  bgColor = '#f5f0ff',
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-ink tracking-tighter">
          {Math.round(progress)}%
        </span>
        {label && <span className="text-[10px] font-bold text-ink-muted mt-0.5">{label}</span>}
      </div>
    </div>
  )
}
