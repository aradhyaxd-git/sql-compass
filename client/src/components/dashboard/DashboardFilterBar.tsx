import React from 'react'
import { Search } from 'lucide-react'
import type { Difficulty } from '@/types/assignment.types'

export type Filter = 'all' | Difficulty
export type StatusFilter = 'all' | 'solved' | 'unsolved'

interface DashboardFilterBarProps {
  filter: Filter
  onFilterChange: (filter: Filter) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (status: StatusFilter) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  allTopics: string[]
  selectedTopic: string
  onTopicChange: (topic: string) => void
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Challenges' },
  { key: 'easy', label: 'Foundations' },
  { key: 'medium', label: 'Intermediate' },
  { key: 'hard', label: 'Advanced' },
]

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All Status' },
  { key: 'solved', label: 'Solved' },
  { key: 'unsolved', label: 'Unsolved' },
]

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  filter,
  onFilterChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  allTopics,
  selectedTopic,
  onTopicChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {FILTERS.map(({ key, label }) => {
            const active = filter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onFilterChange(key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  border: active ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  background: active ? 'var(--brand-muted)' : 'var(--bg-subtle)',
                  color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            )
          })}

          <div
            style={{
              display: 'flex',
              gap: 3,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              padding: 3,
              borderRadius: 6,
              marginLeft: 4,
            }}
          >
            {STATUS_FILTERS.map(({ key, label }) => {
              const active = statusFilter === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onStatusFilterChange(key)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: active ? 600 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? 'var(--bg-card)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            minWidth: 260,
          }}
        >
          <Search size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Filter by title, topic, or tag..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 14px 7px 34px',
              borderRadius: 6,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--brand-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />
        </div>
      </div>

      {allTopics.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginRight: 4,
              flexShrink: 0,
            }}
          >
            Topics:
          </span>
          <button
            type="button"
            onClick={() => onTopicChange('all')}
            style={{
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: selectedTopic === 'all' ? 600 : 500,
              border: selectedTopic === 'all' ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
              background: selectedTopic === 'all' ? 'var(--brand-muted)' : 'var(--bg-subtle)',
              color: selectedTopic === 'all' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            All Topics
          </button>
          {allTopics.map((topic) => {
            const active = selectedTopic === topic
            return (
              <button
                key={topic}
                type="button"
                onClick={() => onTopicChange(active ? 'all' : topic)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: active ? 600 : 500,
                  border: active ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  background: active ? 'var(--brand-muted)' : 'var(--bg-subtle)',
                  color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {topic}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DashboardFilterBar
