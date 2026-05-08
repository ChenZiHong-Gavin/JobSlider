import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, BarChart3, Settings as SettingsIcon, Sparkles, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: '首页', icon: Sparkles },
  { path: '/study', label: '学习', icon: BookOpen },
  { path: '/progress', label: '进度', icon: BarChart3 },
  { path: '/extract', label: '提取', icon: FolderOpen },
  { path: '/settings', label: '设置', icon: SettingsIcon },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-button group-hover:scale-105 transition-transform">
              <span className="text-white text-base font-black">J</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-ink">
              Job<span className="text-gradient-primary">Slider</span>
            </span>
          </Link>

          {/* Nav — pill tabs */}
          <nav className="flex items-center gap-1 p-1 rounded-2xl bg-surface-raised/60 border border-border/40">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
                    isActive
                      ? 'text-white'
                      : 'text-ink-muted hover:text-ink-secondary'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light rounded-xl shadow-button"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
