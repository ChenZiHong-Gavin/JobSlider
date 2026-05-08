import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useEffect } from 'react'
import { Clock, Sparkles, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { MarkdownContent } from './MarkdownContent'
import type { Card, QuizQuestion } from '@/types'

interface FlashcardProps {
  card: Card
  quiz: QuizQuestion | null
  onAnswer: (isCorrect: boolean) => void
  studyTime?: number
}

const difficultyMap: Record<string, { label: string; color: string; bg: string }> = {
  easy: { label: '简单', color: 'text-success', bg: 'bg-success-bg' },
  medium: { label: '中等', color: 'text-gold', bg: 'bg-gold-bg' },
  hard: { label: '困难', color: 'text-secondary', bg: 'bg-secondary-bg' },
}

const typeLabels: Record<string, { label: string; emoji: string }> = {
  concept: { label: '概念', emoji: '💡' },
  comparison: { label: '对比', emoji: '⚖️' },
  code: { label: '代码', emoji: '💻' },
  scenario: { label: '场景', emoji: '🎯' },
}

const optionLabels = ['A', 'B', 'C', 'D']

export function Flashcard({ card, quiz, onAnswer, studyTime = 0 }: FlashcardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  // 每张新卡重置状态
  useEffect(() => {
    setSelectedIndex(null)
    setShowResult(false)
    setShowAnswer(false)
  }, [card.id])

  const isCorrect = selectedIndex !== null && quiz !== null && selectedIndex === quiz.correctIndex

  const handleSelect = useCallback(
    (index: number) => {
      if (showResult) return // 已经选过了
      setSelectedIndex(index)
      setShowResult(true)
    },
    [showResult]
  )

  const handleNext = useCallback(() => {
    onAnswer(isCorrect)
  }, [onAnswer, isCorrect])

  // 键盘快捷键: 1-4 选选项, Enter/Space 下一题
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResult && quiz) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= quiz.options.length) {
          e.preventDefault()
          handleSelect(num - 1)
        }
      }
      if (showResult && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        if (showAnswer) {
          handleNext()
        } else {
          setShowAnswer(true)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showResult, showAnswer, quiz, handleSelect, handleNext])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const diff = difficultyMap[card.difficulty]
  const typeInfo = typeLabels[card.questionType]

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      // 未选择状态
      return 'border-border bg-white hover:border-primary/40 hover:bg-primary-bg/50 cursor-pointer'
    }
    // 已选择后
    if (index === quiz?.correctIndex) {
      return 'border-success bg-success-bg cursor-default'
    }
    if (index === selectedIndex && index !== quiz?.correctIndex) {
      return 'border-secondary bg-secondary-bg cursor-default'
    }
    return 'border-border/40 bg-white/50 opacity-50 cursor-default'
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4">
      {/* Meta bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-white border-2 border-border/60 shadow-card text-ink-secondary">
            {card.category}
          </span>
          {typeInfo && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full bg-white border-2 border-border/60 shadow-card text-ink-muted">
              <span>{typeInfo.emoji}</span>
              {typeInfo.label}
            </span>
          )}
          {diff && (
            <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full ${diff.bg} ${diff.color} border-2 border-current/10`}>
              {diff.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-ink-muted bg-white px-3 py-1.5 rounded-full border-2 border-border/60 shadow-card">
          <Clock className="w-3 h-3" />
          {formatTime(studyTime)}
        </div>
      </motion.div>

      {/* Question card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full rounded-4xl border-2 border-border bg-white shadow-card p-8 md:p-10"
      >
        {/* Question badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-primary bg-primary-bg rounded-full">
            <Sparkles className="w-3 h-3" />
            选择题
          </span>
          {!showResult && (
            <span className="text-[11px] font-bold text-ink-muted">按 1-4 选择</span>
          )}
        </div>

        {/* Question text */}
        <div className="mb-8">
          <div className="text-lg md:text-xl font-extrabold text-ink leading-relaxed">
            <MarkdownContent content={card.question} />
          </div>
        </div>

        {/* Options */}
        {quiz && (
          <div className="space-y-3">
            {quiz.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={!showResult ? { scale: 1.01, x: 4 } : {}}
                whileTap={!showResult ? { scale: 0.99 } : {}}
                onClick={() => handleSelect(index)}
                disabled={showResult}
                className={`w-full flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${getOptionStyle(index)}`}
              >
                {/* Option label */}
                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black transition-all ${
                  showResult && index === quiz.correctIndex
                    ? 'bg-success text-white'
                    : showResult && index === selectedIndex && index !== quiz.correctIndex
                    ? 'bg-secondary text-white'
                    : 'bg-primary-bg text-primary'
                }`}>
                  {showResult && index === quiz.correctIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : showResult && index === selectedIndex && index !== quiz.correctIndex ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    optionLabels[index]
                  )}
                </span>

                {/* Option text */}
                <span className={`flex-1 text-sm font-semibold leading-relaxed pt-1 ${
                  showResult && index === quiz.correctIndex
                    ? 'text-success'
                    : showResult && index === selectedIndex && index !== quiz.correctIndex
                    ? 'text-secondary line-through decoration-1'
                    : 'text-ink-secondary'
                }`}>
                  {option}
                </span>

                {/* Key hint */}
                {!showResult && (
                  <span className="flex-shrink-0 text-[10px] font-mono text-ink-muted/50 pt-1.5">
                    {index + 1}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t-2 border-border/40"
            >
              {/* Correct / Wrong banner */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`flex items-center gap-3 p-4 rounded-2xl mb-4 ${
                  isCorrect
                    ? 'bg-success-bg border-2 border-success/20'
                    : 'bg-secondary-bg border-2 border-secondary/20'
                }`}
              >
                <span className="text-2xl">{isCorrect ? '🎉' : '😢'}</span>
                <div>
                  <p className={`text-sm font-black ${isCorrect ? 'text-success' : 'text-secondary'}`}>
                    {isCorrect ? '回答正确！' : '回答错误'}
                  </p>
                  <p className="text-xs font-semibold text-ink-muted mt-0.5">
                    {isCorrect ? '继续保持这个状态！' : `正确答案是 ${optionLabels[quiz?.correctIndex ?? 0]}`}
                  </p>
                </div>
              </motion.div>

              {/* Show full answer toggle */}
              {!showAnswer ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowAnswer(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-border/60 text-sm font-bold text-ink-secondary hover:bg-primary-bg hover:border-primary/30 hover:text-primary transition-all"
                >
                  📖 查看详细解析
                  <span className="text-[10px] text-ink-muted">(Enter)</span>
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className="p-5 rounded-2xl bg-surface-raised/50 border-2 border-border/40 max-h-[300px] overflow-y-auto">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">详细解析</p>
                    <MarkdownContent content={card.answer} className="text-sm" />
                  </div>

                  {/* Next button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm shadow-button hover:shadow-glow-primary transition-all"
                  >
                    下一题
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-xs opacity-60">(Enter)</span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
