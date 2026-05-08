import { motion } from 'framer-motion'

interface CategoryTagProps {
  name: string
  count?: number
  isActive?: boolean
  onClick?: () => void
  color?: string
}

export function CategoryTag({
  name,
  count,
  isActive = false,
  onClick,
}: CategoryTagProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border-2 ${
        isActive
          ? 'bg-primary text-white border-primary shadow-button'
          : 'bg-white text-ink-secondary border-border hover:border-primary/30 hover:text-primary hover:bg-primary-bg'
      }`}
    >
      <span>{name}</span>
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
          isActive ? 'bg-white/20 text-white' : 'bg-primary-bg text-primary'
        }`}>
          {count}
        </span>
      )}
    </motion.button>
  )
}

interface CategoryListProps {
  categories: { name: string; count: number; color?: string }[]
  activeCategory?: string
  onSelect: (category: string | null) => void
}

export function CategoryList({
  categories,
  activeCategory,
  onSelect,
}: CategoryListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <CategoryTag
        name="全部"
        count={categories.reduce((sum, c) => sum + c.count, 0)}
        isActive={activeCategory === null || activeCategory === undefined}
        onClick={() => onSelect(null)}
      />
      {categories.map((category) => (
        <CategoryTag
          key={category.name}
          name={category.name}
          count={category.count}
          isActive={activeCategory === category.name}
          onClick={() => onSelect(category.name)}
        />
      ))}
    </div>
  )
}
