export interface Card {
  id: string
  title: string
  category: string
  question: string
  answer: string
  questionType: 'concept' | 'comparison' | 'code' | 'scenario'
  difficulty: 'easy' | 'medium' | 'hard'
  sourceFile: string
  tags?: string[]
  distractors?: string[]
}

export interface StudyProgress {
  cardId: string
  status: 'new' | 'learning' | 'review' | 'mastered'
  easeFactor: number
  interval: number
  repetitions: number
  dueDate: string
  lastReviewed?: string
  history: ReviewHistory[]
}

export interface ReviewHistory {
  date: string
  rating: 1 | 2 | 3 | 4
  timeSpent: number
}

export interface StudySession {
  id: string
  startTime: string
  endTime?: string
  cardsStudied: number
  correctCount: number
}

export interface Category {
  name: string
  count: number
  mastered: number
  color: string
}

export type Rating = 1 | 2 | 3 | 4

export interface EvaluateResult {
  score: number
  feedback: string
  missingPoints: string[]
  suggestions: string[]
}

export interface QuizQuestion {
  cardId: string
  question: string
  options: string[]
  correctIndex: number
  category: string
  difficulty: string
  questionType: string
  title: string
}
