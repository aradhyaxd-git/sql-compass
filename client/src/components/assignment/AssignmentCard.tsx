import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import Badge from '@/components/ui/Badge'
import type { Assignment, Difficulty } from '@/types/assignment.types'

const difficultyVariant: Record<Difficulty, 'success' | 'warning' | 'error'> = {
  easy: 'success', medium: 'warning', hard: 'error',
}

function CompletedMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10d98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}

function ArrowMark() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

interface AssignmentCardProps {
  assignment: Assignment
  completed?: boolean
}

export default function AssignmentCard({ assignment, completed }: AssignmentCardProps) {
  return (
    <Link
      to={`/attempt/${assignment._id}`}
      className={cn(
        'block p-5 rounded-xl no-underline',
        'border border-border hover:border-brand/30',
        'bg-surface hover:bg-brand/5',
        'transition-all duration-200 group'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge label={assignment.difficulty} variant={difficultyVariant[assignment.difficulty]} />
        {completed && <CompletedMark />}
      </div>
      <h3 className="font-display font-bold text-base text-text-primary mb-2 tracking-tight">
        {assignment.title}
      </h3>
      <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-2">
        {assignment.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {assignment.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-2xs font-mono text-text-muted bg-overlay px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-text-muted group-hover:text-brand transition-colors shrink-0">
          <ArrowMark />
        </span>
      </div>
    </Link>
  )
}