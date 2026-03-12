import { cn } from '@/lib/cn'

interface BadgeProps {
  label: string
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'neutral'
  className?: string
}

const variants = {
  brand: 'bg-brand/10   text-brand-light border-brand/20',
  success: 'bg-success/10 text-success     border-success/20',
  warning:'bg-warning/10 text-warning     border-warning/20',
  error:'bg-error/10   text-error       border-error/20',
  neutral: 'bg-white/5    text-text-muted  border-border',
}

export default function Badge({ label, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center',
        'px-2.5 py-0.5 rounded-full',
        'text-2xs font-semibold tracking-widest uppercase',
        'border',
        variants[variant],
        className
      )}
    >
      {label}
    </span>
  )
}