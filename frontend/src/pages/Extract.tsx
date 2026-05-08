import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { extractApi } from '@/lib/api'

type TaskStatus = {
  taskId: string
  status: string
  totalFiles: number
  processedFiles: number
  totalCards: number
  currentFile: string
  error: string | null
}

export function Extract() {
  const [folderPath, setFolderPath] = useState('')
  const [category, setCategory] = useState('通用')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!folderPath.trim()) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await extractApi.start(folderPath.trim(), category.trim() || '通用')
      setTaskId(res.taskId)
      setTaskStatus(null)
    } catch (err: any) {
      setError(err?.response?.data?.detail || '启动提取失败')
    } finally {
      setSubmitting(false)
    }
  }, [folderPath, category])

  useEffect(() => {
    if (!taskId) return
    let cancelled = false

    const poll = async () => {
      try {
        const status = await extractApi.status(taskId)
        if (!cancelled) {
          setTaskStatus(status)
          if (status.status !== 'completed' && status.status !== 'failed') {
            setTimeout(poll, 1500)
          }
        }
      } catch {
        if (!cancelled) setTimeout(poll, 3000)
      }
    }

    poll()
    return () => { cancelled = true }
  }, [taskId])

  const isRunning = taskStatus?.status === 'running'
  const isDone = taskStatus?.status === 'completed'
  const isFailed = taskStatus?.status === 'failed'

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            知识提取
          </h1>
          <p className="text-sm text-ink-secondary mt-2">
            指定一个文件夹，自动从 .md 和 .txt 文件中提取知识卡片
          </p>
        </div>

        {/* Input form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
              文件夹路径
            </label>
            <div className="relative">
              <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="D:\Project\MyNotes"
                disabled={isRunning}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-border/60 bg-white text-sm font-semibold text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
              分类名称
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="通用"
              disabled={isRunning}
              className="w-full px-4 py-3 rounded-2xl border-2 border-border/60 bg-white text-sm font-semibold text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!folderPath.trim() || isRunning || submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-button hover:shadow-button-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {submitting ? '启动中...' : '开始提取'}
          </motion.button>
        </div>

        {/* Error */}
        {(error || isFailed) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error || taskStatus?.error || '提取失败'}
          </motion.div>
        )}

        {/* Progress */}
        {taskStatus && !isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white border-2 border-border/60 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink">
                {isDone ? '提取完成' : '正在提取...'}
              </span>
              {isDone ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
            </div>

            {/* Progress bar */}
            {taskStatus.totalFiles > 0 && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-ink-muted mb-1.5">
                  <span>{taskStatus.processedFiles} / {taskStatus.totalFiles} 文件</span>
                  <span>{Math.round((taskStatus.processedFiles / taskStatus.totalFiles) * 100)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-raised overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(taskStatus.processedFiles / taskStatus.totalFiles) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-xs text-ink-muted font-semibold">已生成卡片</span>
              <span className="text-lg font-black text-primary">{taskStatus.totalCards}</span>
            </div>

            {isRunning && taskStatus.currentFile && (
              <p className="text-xs text-ink-muted truncate">
                {taskStatus.currentFile}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
