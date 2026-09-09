import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-surface border border-border rounded-2xl p-4 ${className}`}>{children}</div>
}

export function GoldButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`bg-gold text-[#161302] font-semibold rounded-xl py-3.5 px-5 active:scale-[0.98] transition disabled:opacity-40 disabled:active:scale-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function GhostButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`bg-surface-2 border border-border text-ink rounded-xl py-3.5 px-5 active:scale-[0.98] transition disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>
}

export function ScreenTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-semibold text-ink">{children}</h1>
      {subtitle && <p className="text-sm text-ink-dim mt-0.5">{subtitle}</p>}
    </div>
  )
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="text-4xl mb-3 opacity-70">{icon}</div>
      <p className="text-ink font-medium">{title}</p>
      {subtitle && <p className="text-ink-faint text-sm mt-1">{subtitle}</p>}
    </div>
  )
}
