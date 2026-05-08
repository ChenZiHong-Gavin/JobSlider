import axios from 'axios'
import type { Card, StudyProgress, EvaluateResult, QuizQuestion } from '@/types'

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

/**
 * snake_case → camelCase 转换
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function transformKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(transformKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [snakeToCamel(k), transformKeys(v)])
    )
  }
  return obj
}

/**
 * camelCase → snake_case 转换（发送给后端）
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
}

function transformKeysToSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(transformKeysToSnake)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [camelToSnake(k), transformKeysToSnake(v)])
    )
  }
  return obj
}

// API 方法
export const cardApi = {
  getAll: (): Promise<Card[]> =>
    api.get('/api/cards').then(transformKeys),
  getById: (id: string): Promise<Card> =>
    api.get(`/api/cards/${id}`).then(transformKeys),
  getByCategory: (category: string): Promise<Card[]> =>
    api.get(`/api/cards?category=${category}`).then(transformKeys),
}

export const studyApi = {
  getNextCard: (category?: string): Promise<Card | null> =>
    api.get('/api/study/next', { params: category ? { category } : {} }).then((data) => data ? transformKeys(data) : null),
  getDueCards: (): Promise<Card[]> =>
    api.get('/api/study/due').then(transformKeys),
  getQuiz: (cardId: string): Promise<QuizQuestion> =>
    api.get(`/api/study/quiz/${cardId}`).then(transformKeys),
  submitAnswer: (
    cardId: string,
    data: { rating: number; timeSpent: number; answer?: string }
  ): Promise<StudyProgress> =>
    api.post(`/api/cards/${cardId}/answer`, transformKeysToSnake(data)).then(transformKeys),
  getProgress: (): Promise<{
    total: number
    mastered: number
    learning: number
    dueToday: number
    studyTime?: number
    streak?: number
  }> => api.get('/api/progress').then(transformKeys),
  getCategories: (): Promise<
    { name: string; count: number; mastered: number; color: string }[]
  > => api.get('/api/categories').then(transformKeys),
}

export const evaluateApi = {
  submit: (
    cardId: string,
    userAnswer: string
  ): Promise<EvaluateResult> =>
    api.post('/api/evaluate', { card_id: cardId, user_answer: userAnswer }).then(transformKeys),
}

export const extractApi = {
  start: (
    folderPath: string,
    category: string
  ): Promise<{ taskId: string; message: string }> =>
    api.post('/api/extract', { folder_path: folderPath, category }).then(transformKeys),
  status: (
    taskId: string
  ): Promise<{
    taskId: string
    status: string
    totalFiles: number
    processedFiles: number
    totalCards: number
    currentFile: string
    error: string | null
  }> =>
    api.get(`/api/extract/status/${taskId}`).then(transformKeys),
}

export default api
