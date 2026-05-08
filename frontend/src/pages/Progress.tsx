import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { StatCard, CircularProgress, Loading } from '@/components'
import { studyApi } from '@/lib/api'
import { BookOpen, TrendingUp, Award, Calendar, Target } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface ProgressData {
  total: number
  mastered: number
  learning: number
  dueToday: number
  studyTime?: number
  streak?: number
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export function Progress() {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [categories, setCategories] = useState<
    { name: string; count: number; mastered: number; color: string }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [progressData, categoriesData] = await Promise.all([
          studyApi.getProgress(),
          studyApi.getCategories(),
        ])
        setProgress(progressData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load progress:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Loading message="加载数据..." />
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center text-ink-muted text-sm font-bold py-20">暂无数据</div>
      </div>
    )
  }

  const masteryRate = progress.total > 0
    ? Math.round((progress.mastered / progress.total) * 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-black text-ink tracking-tight mb-8 flex items-center gap-2">
        📊 学习进度
      </h1>

      {/* Stat cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        <motion.div variants={fadeUp}>
          <StatCard title="总卡片数" value={progress.total} subtitle={`${progress.mastered} 已掌握`} icon={BookOpen} color="blue" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="今日到期" value={progress.dueToday} subtitle="待复习" icon={Calendar} color="orange" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="学习时长" value={formatDuration(progress.studyTime || 0)} subtitle="累计" icon={TrendingUp} color="purple" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="连续学习" value={`${progress.streak || 1} 天`} subtitle="保持节奏" icon={Award} color="green" />
        </motion.div>
      </motion.div>

      {/* Mastery overview — big circular progress */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10"
      >
        {/* Circular progress card */}
        <div className="p-8 rounded-3xl bg-white border-2 border-border/60 shadow-card flex flex-col items-center justify-center">
          <CircularProgress progress={masteryRate} size={140} strokeWidth={10} label="掌握率" />
          <div className="mt-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-ink-secondary">
              {progress.mastered}/{progress.total} 张已掌握
            </span>
          </div>
        </div>

        {/* Status distribution */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white border-2 border-border/60 shadow-card">
          <h3 className="text-sm font-black text-ink mb-6 uppercase tracking-wider">学习状态分布</h3>
          <div className="space-y-5">
            {[
              {
                label: '已掌握',
                value: progress.mastered,
                total: progress.total,
                color: 'from-success to-success-light',
                bg: 'bg-success-bg',
                emoji: '🎯',
              },
              {
                label: '学习中',
                value: progress.learning,
                total: progress.total,
                color: 'from-primary to-primary-light',
                bg: 'bg-primary-bg',
                emoji: '📖',
              },
              {
                label: '待学习',
                value: Math.max(0, progress.total - progress.mastered - progress.learning),
                total: progress.total,
                color: 'from-ink-muted to-border',
                bg: 'bg-surface-raised',
                emoji: '💤',
              },
            ].map(({ label, value, total, color, bg, emoji }) => {
              const pct = total > 0 ? Math.round((value / total) * 100) : 0
              return (
                <div key={label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink-secondary flex items-center gap-2">
                      <span>{emoji}</span> {label}
                    </span>
                    <span className="text-sm font-black text-ink">{value} <span className="text-ink-muted font-semibold">({pct}%)</span></span>
                  </div>
                  <div className={`w-full h-3 ${bg} rounded-full overflow-hidden`}>
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      {categories.length > 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="p-8 rounded-3xl bg-white border-2 border-border/60 shadow-card"
        >
          <h3 className="text-sm font-black text-ink mb-6 uppercase tracking-wider">分类掌握度</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const pct = cat.count > 0 ? Math.round((cat.mastered / cat.count) * 100) : 0
              return (
                <div
                  key={cat.name}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-surface-raised/50 border border-border/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-ink truncate">{cat.name}</span>
                      <span className="text-xs font-black text-primary">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-primary-bg rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-ink-muted mt-1.5">
                      {cat.mastered}/{cat.count} 已掌握
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
