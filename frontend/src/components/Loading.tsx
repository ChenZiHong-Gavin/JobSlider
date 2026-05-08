import { motion } from 'framer-motion'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Loading({ message = '加载中...', size = 'md' }: LoadingProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
  const colors = ['bg-primary', 'bg-secondary', 'bg-gold']

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-5">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSize} rounded-full ${colors[i]}`}
            animate={{
              y: [0, -12, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      {message && (
        <p className="text-sm font-bold text-ink-muted">{message}</p>
      )}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-3xl border border-border/60 bg-white shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-3 bg-primary-bg rounded-full w-1/3 animate-pulse" />
          <div className="h-7 bg-primary-bg rounded-full w-2/3 animate-pulse" />
          <div className="h-3 bg-primary-bg rounded-full w-1/2 animate-pulse" />
        </div>
        <div className="w-11 h-11 bg-primary-bg rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonFlashcard() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <div className="h-7 w-20 bg-primary-bg rounded-full animate-pulse" />
          <div className="h-7 w-14 bg-primary-bg rounded-full animate-pulse" />
        </div>
        <div className="h-5 w-14 bg-primary-bg rounded-full animate-pulse" />
      </div>
      <div className="h-[460px] bg-white rounded-4xl border-2 border-border/60 shadow-card animate-pulse" />
    </div>
  )
}
