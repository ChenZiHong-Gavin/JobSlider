import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { storage } from '@/lib/utils'
import { RefreshCw, Database, Bell, Sun, Check, Palette } from 'lucide-react'

interface SettingsData {
  dailyGoal: number
  notifications: boolean
  darkMode: boolean
  autoPlayAudio: boolean
  apiKey: string
}

export function Settings() {
  const [settings, setSettings] = useState<SettingsData>(() =>
    storage.get('jobslider-settings', {
      dailyGoal: 20,
      notifications: true,
      darkMode: false,
      autoPlayAudio: false,
      apiKey: '',
    })
  )

  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = () => {
    storage.set('jobslider-settings', settings)
    setMessage('已保存 ✅')
    setTimeout(() => setMessage(''), 2500)
  }

  const handleSync = async () => {
    setSyncing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSyncing(false)
    setMessage('同步完成 🎉')
    setTimeout(() => setMessage(''), 2500)
  }

  const SettingItem = ({
    icon: Icon,
    title,
    description,
    children,
  }: {
    icon: typeof Sun
    title: string
    description: string
    children: React.ReactNode
  }) => (
    <div className="flex items-center justify-between py-5 border-b-2 border-border/40 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary-bg mt-0.5">
          <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          <p className="text-xs text-ink-muted mt-0.5 font-semibold">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-all ${
        checked ? 'bg-gradient-to-r from-primary to-primary-light shadow-button' : 'bg-border'
      }`}
    >
      <motion.div
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
        animate={{ left: checked ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-black text-ink tracking-tight mb-8 flex items-center gap-2">
        ⚙️ 设置
      </h1>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="mb-6 flex items-center gap-2 p-4 text-sm font-bold text-primary bg-primary-bg border-2 border-primary/20 rounded-2xl"
          >
            <Check className="w-4 h-4" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-3xl bg-white border-2 border-border/60 shadow-card p-6 mb-6">
        <SettingItem icon={Database} title="每日目标" description="每天计划复习的卡片数量">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSettings((s) => ({ ...s, dailyGoal: Math.max(5, s.dailyGoal - 5) }))}
              className="w-8 h-8 rounded-xl bg-primary-bg text-primary font-black text-sm flex items-center justify-center hover:bg-primary/10 transition-colors"
            >
              −
            </motion.button>
            <span className="w-10 text-center font-black text-ink text-lg">{settings.dailyGoal}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSettings((s) => ({ ...s, dailyGoal: Math.min(100, s.dailyGoal + 5) }))}
              className="w-8 h-8 rounded-xl bg-primary-bg text-primary font-black text-sm flex items-center justify-center hover:bg-primary/10 transition-colors"
            >
              +
            </motion.button>
          </div>
        </SettingItem>

        <SettingItem icon={Bell} title="通知提醒" description="每日复习时间到了提醒你">
          <Toggle
            checked={settings.notifications}
            onChange={(v) => setSettings((s) => ({ ...s, notifications: v }))}
          />
        </SettingItem>

        <SettingItem icon={Palette} title="深色模式" description="更换界面主题（开发中）">
          <Toggle
            checked={settings.darkMode}
            onChange={(v) => setSettings((s) => ({ ...s, darkMode: v }))}
          />
        </SettingItem>
      </div>

      <div className="rounded-3xl bg-white border-2 border-border/60 shadow-card p-6 mb-6">
        <h2 className="text-xs font-black text-ink-muted uppercase tracking-wider mb-4">数据管理</h2>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold rounded-2xl shadow-button hover:shadow-glow-primary transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '同步卡片数据'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-3 border-2 border-primary/30 text-primary text-sm font-bold rounded-2xl hover:bg-primary-bg transition-all"
          >
            <Check className="w-4 h-4" />
            保存设置
          </motion.button>
        </div>
      </div>
    </div>
  )
}
