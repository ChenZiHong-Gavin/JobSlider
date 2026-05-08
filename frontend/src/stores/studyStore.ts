import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card } from '@/types'

interface StudyHistory {
  cardId: string
  rating: 1 | 2 | 3 | 4
  timestamp: string
}

interface StudyState {
  currentCard: Card | null
  isFlipped: boolean
  sessionStats: {
    studied: number
    correct: number
    startTime: number
  }
  history: StudyHistory[]
  dailyGoal: number
  setCurrentCard: (card: Card | null) => void
  flipCard: () => void
  rateCard: (rating: 1 | 2 | 3 | 4) => void
  addToHistory: (entry: StudyHistory) => void
  resetSession: () => void
  setDailyGoal: (goal: number) => void
  getTodayStudied: () => number
  getTodayAccuracy: () => number
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      currentCard: null,
      isFlipped: false,
      sessionStats: { studied: 0, correct: 0, startTime: Date.now() },
      history: [],
      dailyGoal: 20,

      setCurrentCard: (card) => set({ currentCard: card, isFlipped: false }),

      flipCard: () => set((state) => ({ isFlipped: !state.isFlipped })),

      rateCard: (rating) => {
        const { sessionStats } = get()
        set({
          sessionStats: {
            studied: sessionStats.studied + 1,
            correct: rating >= 3 ? sessionStats.correct + 1 : sessionStats.correct,
            startTime: sessionStats.startTime,
          },
          isFlipped: false,
        })
      },

      addToHistory: (entry) =>
        set((state) => {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
          const filtered = state.history.filter(
            (h) => new Date(h.timestamp).getTime() > thirtyDaysAgo
          )
          return { history: [...filtered, entry] }
        }),

      resetSession: () =>
        set({
          sessionStats: { studied: 0, correct: 0, startTime: Date.now() },
          history: [],
          isFlipped: false,
        }),

      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      getTodayStudied: () => {
        const { history } = get()
        const today = new Date().toDateString()
        return history.filter((h) => new Date(h.timestamp).toDateString() === today).length
      },

      getTodayAccuracy: () => {
        const { history } = get()
        const today = new Date().toDateString()
        const todayHistory = history.filter((h) => new Date(h.timestamp).toDateString() === today)
        if (todayHistory.length === 0) return 0
        const correct = todayHistory.filter((h) => h.rating >= 3).length
        return Math.round((correct / todayHistory.length) * 100)
      },
    }),
    {
      name: 'jobslider-study',
      partialize: (state) => ({ history: state.history, dailyGoal: state.dailyGoal }),
    }
  )
)
