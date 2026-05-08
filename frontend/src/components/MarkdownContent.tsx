import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Components } from 'react-markdown'

interface MarkdownContentProps {
  content: string
  className?: string
}

const components: Components = {
  img: ({ src, alt, ...props }) => (
    <figure className="my-4">
      <img
        src={src}
        alt={alt || ''}
        loading="lazy"
        className="max-w-full h-auto rounded-2xl border-2 border-border/60 bg-surface-raised shadow-card"
        onError={(e) => {
          const el = e.currentTarget
          el.style.display = 'none'
          const fallback = document.createElement('div')
          fallback.className = 'flex items-center justify-center h-32 rounded-2xl border-2 border-border/40 bg-surface-raised text-ink-muted text-xs font-bold'
          fallback.textContent = `[图片加载失败: ${alt || src}]`
          el.parentElement?.appendChild(fallback)
        }}
        {...props}
      />
      {alt && alt !== '' && (
        <figcaption className="mt-2 text-center text-[11px] font-bold text-ink-muted">
          {alt}
        </figcaption>
      )}
    </figure>
  ),

  figure: ({ children, ...props }) => (
    <figure className="my-4" {...props}>{children}</figure>
  ),
  figcaption: ({ children, ...props }) => (
    <figcaption className="mt-2 text-center text-[11px] font-bold text-ink-muted" {...props}>
      {children}
    </figcaption>
  ),

  code: ({ className, children, ...props }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded-lg bg-primary-bg text-primary text-sm font-mono font-semibold border border-primary/10" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={`block p-4 rounded-2xl bg-ink text-sm font-mono text-white/90 overflow-x-auto ${className || ''}`} {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => (
    <pre className="my-3 rounded-2xl overflow-hidden shadow-card" {...props}>{children}</pre>
  ),

  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary font-bold hover:text-primary-dark underline underline-offset-2 decoration-primary/30 transition-colors"
      {...props}
    >
      {children}
    </a>
  ),

  ul: ({ children, ...props }) => (
    <ul className="my-2 ml-4 space-y-1.5 list-disc list-outside marker:text-primary/40" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-2 ml-4 space-y-1.5 list-decimal list-outside marker:text-primary/50 marker:font-bold" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-ink-secondary leading-relaxed pl-1 font-medium" {...props}>{children}</li>
  ),

  h1: ({ children, ...props }) => (
    <h1 className="text-xl font-black text-ink mt-6 mb-3" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-lg font-black text-ink mt-5 mb-2" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-base font-bold text-ink mt-4 mb-2" {...props}>{children}</h3>
  ),

  p: ({ children, ...props }) => (
    <p className="my-2 text-ink-secondary leading-relaxed font-medium" {...props}>{children}</p>
  ),

  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-3 pl-4 border-l-4 border-primary/30 bg-primary-bg/50 rounded-r-xl py-2 pr-3 text-ink-secondary italic font-semibold"
      {...props}
    >
      {children}
    </blockquote>
  ),

  strong: ({ children, ...props }) => (
    <strong className="font-extrabold text-ink" {...props}>{children}</strong>
  ),

  table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-2xl border-2 border-border/60 shadow-card">
      <table className="w-full text-sm" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-primary-bg" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-primary" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-3 text-ink-secondary font-medium border-t border-border/40" {...props}>
      {children}
    </td>
  ),

  hr: (props) => <hr className="my-6 border-t-2 border-border/40" {...props} />,
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose-jobslider ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
