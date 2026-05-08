import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flashcard, ProgressBar, SkeletonFlashcard } from '@/components'
import { useStudyStore } from '@/stores/studyStore'
import { studyApi } from '@/lib/api'
import type { Card, QuizQuestion } from '@/types'
import { Trophy, RotateCcw, Flame, Star, PartyPopper, Filter } from 'lucide-react'

export function Study() {
  const [card, setCard] = useState<Card | null>(null)
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionStats, setSessionStats] = useState({ studied: 0, correct: 0 })
  const [studyTime, setStudyTime] = useState(0)
  const [sessionStartTime] = useState(Date.now())
  const [showStreak, setShowStreak] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { setCurrentCard, addToHistory } = useStudyStore()

  // 加载分类列表
  useEffect(() => {
    studyApi.getCategories().then((cats) => {
      setCategories(cats.map((c) => c.name))
    }).catch(() => {})
  }, [])

  const loadNextCard = useCallback(async () => {
    setLoading(true)
    setQuiz(null)
    setError(null)
    try {
      const nextCard = await studyApi.getNextCard(selectedCategory ?? undefined)
      setCard(nextCard)
      if (nextCard) {
        setCurrentCard(nextCard)
        try {
          const quizData = await studyApi.getQuiz(nextCard.id)
          setQuiz(quizData)
        } catch (err) {
          console.error('Failed to load quiz:', err)
        }
      }
    } catch (error) {
      console.error('Failed to load card:', error)
      setError('加载卡片失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }, [setCurrentCard, selectedCategory])

  useEffect(() => {
    loadNextCard()
  }, [loadNextCard])

  useEffect(() => {
    const interval = setInterval(() => {
      setStudyTime(Math.floor((Date.now() - sessionStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStartTime])

  const handleAnswer = useCallback(
    async (isCorrect: boolean) => {
      if (!card) return
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)
      const rating = isCorrect ? 3 : 1  // 选对=Good, 选错=Again

      try {
        await studyApi.submitAnswer(card.id, { rating, timeSpent })
        addToHistory({ cardId: card.id, rating: rating as 1 | 3, timestamp: new Date().toISOString() })

        const newStudied = sessionStats.studied + 1
        const newCorrect = isCorrect ? sessionStats.correct + 1 : sessionStats.correct
        setSessionStats({ studied: newStudied, correct: newCorrect })

        // 每5题里程碑
        if (newStudied % 5 === 0) {
          setShowStreak(true)
          setTimeout(() => setShowStreak(false), 2000)
        }

        await loadNextCard()
      } catch (error) {
        console.error('Failed to submit answer:', error)
        setError('提交答案失败，请重试')
      }
    },
    [card, sessionStartTime, addToHistory, loadNextCard, sessionStats]
  )

  const accuracy = sessionStats.studied > 0
    ? Math.round((sessionStats.correct / sessionStats.studied) * 100)
    : 0

  // Completion state
  if (!loading && !card) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold via-gold-light to-gold shadow-glow-gold flex items-center justify-center">
            <Trophy className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <motion.div
            className="absolute -top-3 -right-3"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Star className="w-6 h-6 text-gold fill-gold" />
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -left-3"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <PartyPopper className="w-5 h-5 text-secondary" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-black text-ink tracking-tight mb-3"
        >
          今日学习完成！🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-ink-secondary mb-8 text-center max-w-sm font-semibold"
        >
          所有到期的卡片已复习完毕。明天会有新的复习安排，继续保持！
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-3xl bg-white border-2 border-border/60 shadow-card">
            <span className="text-2xl font-black text-ink">{sessionStats.studied}</span>
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">已学习</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-3xl bg-primary-bg border-2 border-primary/20 shadow-card">
            <span className="text-2xl font-black text-primary">{accuracy}%</span>
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">正确率</span>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => window.location.reload()}
          className="group flex items-center gap-2 px-6 py-3 text-sm font-bold text-primary border-2 border-primary/30 rounded-2xl hover:bg-primary-bg transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          重新开始
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm font-semibold shadow-float cursor-pointer"
            onClick={() => setError(null)}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top bar */}
      <div className="mb-10 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
            📖 今日学习
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-bg border-2 border-secondary/20">
              <Flame className="w-4 h-4 text-secondary fill-secondary" />
              <span className="text-xs font-black text-secondary">{sessionStats.studied}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-bg border-2 border-primary/20">
              <span className="text-xs font-black text-primary">{accuracy}% 正确</span>
            </div>
          </div>
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <button
              onClick={() => { setSelectedCategory(null); setSessionStats({ studied: 0, correct: 0 }) }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === null
                  ? 'bg-primary text-white shadow-button'
                  : 'bg-white border-2 border-border/60 text-ink-muted hover:border-primary/30 hover:text-primary'
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setSessionStats({ studied: 0, correct: 0 }) }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-button'
                    : 'bg-white border-2 border-border/60 text-ink-muted hover:border-primary/30 hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <ProgressBar current={sessionStats.studied} total={20} label="今日目标" />
      </div>

      {/* Streak milestone */}
      <AnimatePresence>
        {showStreak && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-gold to-gold-light shadow-float text-white font-black text-sm"
          >
            <Flame className="w-5 h-5" />
            连续 {sessionStats.studied} 张！继续加油！🔥
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SkeletonFlashcard />
          </motion.div>
        ) : card ? (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 60, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -60, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Flashcard card={card} quiz={quiz} onAnswer={handleAnswer} studyTime={studyTime} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
