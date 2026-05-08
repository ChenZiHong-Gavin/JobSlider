import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Layers, Repeat, TrendingUp, Cpu, Flame, Zap, Star } from 'lucide-react'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
}

const features = [
  {
    icon: Layers,
    title: '知识卡片',
    desc: '从你的 Markdown 知识库自动提取，结构化呈现',
    color: 'from-primary to-primary-light',
    bgColor: 'bg-primary-bg',
  },
  {
    icon: Repeat,
    title: '间隔重复',
    desc: 'SM-2 算法驱动，在遗忘曲线的临界点精准复习',
    color: 'from-secondary to-secondary-light',
    bgColor: 'bg-secondary-bg',
  },
  {
    icon: TrendingUp,
    title: '进度追踪',
    desc: '可视化掌握度、复习频率和知识盲区',
    color: 'from-success to-success-light',
    bgColor: 'bg-success-bg',
  },
  {
    icon: Cpu,
    title: 'AI 评估',
    desc: '可选的智能评分，识别回答中的遗漏和偏差',
    color: 'from-gold to-gold-light',
    bgColor: 'bg-gold-bg',
  },
]

export function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          {/* Mascot / decorative icon */}
          <motion.div
            variants={popIn}
            className="mb-8"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary-light to-secondary shadow-float flex items-center justify-center animate-float">
                <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              {/* Floating sparkles */}
              <motion.div
                className="absolute -top-2 -right-2 text-gold"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Star className="w-5 h-5 fill-gold" />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-3 text-secondary"
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <Flame className="w-4 h-4 fill-secondary" />
              </motion.div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary-bg text-xs font-bold text-primary mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
              基于间隔重复算法
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-ink mb-6"
          >
            系统掌握
            <br />
            <span className="text-gradient-primary">LLM</span> 技术面试
          </motion.h1>

          {/* Subline */}
          <motion.p
            variants={fadeUp}
            className="text-base lg:text-lg text-ink-secondary max-w-[48ch] leading-relaxed mb-10"
          >
            不只是刷题。JobSlider 用科学的间隔重复算法追踪你的记忆曲线，在最佳时机推送复习卡片，把短期记忆转化为长期掌握。
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 mb-12">
            <button
              onClick={() => navigate('/study')}
              className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm rounded-2xl shadow-button hover:shadow-glow-primary hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
              开始学习
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="px-7 py-3.5 text-sm font-bold text-ink-secondary border-2 border-border rounded-2xl hover:border-primary/30 hover:text-primary hover:bg-primary-bg transition-all active:scale-[0.98]"
            >
              查看进度
            </button>
          </motion.div>

          {/* Quick stats — playful pills */}
          <motion.div
            variants={stagger}
            className="flex items-center gap-3"
          >
            {[
              { value: '58', label: '知识卡片', emoji: '📚' },
              { value: '8', label: '知识分类', emoji: '🏷️' },
              { value: 'SM-2', label: '算法引擎', emoji: '🧠' },
            ].map(({ value, label, emoji }) => (
              <motion.div
                key={label}
                variants={popIn}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-border/60 shadow-card"
              >
                <span className="text-base">{emoji}</span>
                <span className="text-lg font-black text-ink tracking-tight">{value}</span>
                <span className="text-xs font-semibold text-ink-muted">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {features.map(({ icon: Icon, title, desc, color, bgColor }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group p-6 rounded-3xl bg-white border border-border/60 shadow-card hover:shadow-card-hover transition-all cursor-default"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${bgColor} mb-4`}>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-base font-extrabold text-ink mb-1.5">{title}</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  )
}
