export function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    critical: 'bg-error-container/20 text-error border border-error/30',
    warning: 'bg-tertiary/15 text-tertiary border border-tertiary/30',
    ok: 'bg-primary/15 text-primary border border-primary/30',
    acknowledged: 'bg-tertiary/15 text-tertiary border border-tertiary/30',
    resolved: 'bg-primary/15 text-primary border border-primary/30',
    offline: 'bg-[#1e2022]/30 text-on-surface-variant border border-[#1e2022]/50',
    default: 'bg-surface-container-high text-on-surface-variant border border-[#1e2022]/50',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}
