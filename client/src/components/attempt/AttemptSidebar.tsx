import React, { useState } from 'react'
import { FileText, Database, History, CheckCircle2, AlertCircle, XCircle, ArrowUpRight } from 'lucide-react'
import SchemaViewer from '@/components/assignment/SchemaViewer'
import type { Assignment } from '@/types/assignment.types'

export type LeftTab = 'question' | 'schema' | 'history'

export interface AttemptItem {
  _id: string
  correct?: boolean
  status?: string
  executedAt: string
  query: string
  rowCount: number
}

interface AttemptSidebarProps {
  assignment: Assignment
  schema: any
  schemaLoading: boolean
  attempts?: AttemptItem[]
  onInsertSnippet: (snippet: string) => void
  onRestoreQuery: (query: string) => void
}

export const AttemptSidebar: React.FC<AttemptSidebarProps> = ({
  assignment,
  schema,
  schemaLoading,
  attempts,
  onInsertSnippet,
  onRestoreQuery,
}) => {
  const [leftTab, setLeftTab] = useState<LeftTab>('question')

  const tabs = [
    { id: 'question' as const, label: 'Brief', icon: FileText },
    { id: 'schema' as const, label: 'Schema', icon: Database },
    {
      id: 'history' as const,
      label: `History${attempts && attempts.length > 0 ? ` (${attempts.length})` : ''}`,
      icon: History,
    },
  ]

  return (
    <div
      style={{
        width: 350,
        flexShrink: 0,
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg-card)',
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-default)',
          flexShrink: 0,
          background: 'var(--bg-subtle)',
        }}
      >
        {tabs.map((tab) => {
          const active = leftTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLeftTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 0',
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--bg-card)' : 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid var(--brand-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {leftTab === 'question' && (
          <div style={{ padding: '20px 18px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 10,
              }}
            >
              Requirement
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                fontFamily: 'var(--font-sans)',
                marginBottom: 24,
              }}
            >
              {assignment.description}
            </p>

            {assignment.tags && assignment.tags.length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                    marginBottom: 10,
                    textTransform: 'uppercase',
                  }}
                >
                  SQL Concepts
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {assignment.tags.map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--brand-primary)',
                        background: 'var(--brand-light)',
                        border: '1px solid var(--brand-border)',
                        padding: '3px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {leftTab === 'schema' && (
          <SchemaViewer
            schema={schema}
            isLoading={schemaLoading}
            onInsertText={onInsertSnippet}
          />
        )}

        {leftTab === 'history' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!attempts || attempts.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 16px',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                <History size={24} style={{ opacity: 0.4, marginBottom: 8 }} />
                <span>No submissions recorded yet</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Execute your first query to track your history.
                </span>
              </div>
            ) : (
              attempts.map((att) => {
                const isCorrect = att.correct === true
                const isError = att.status === 'error'
                const statusColor = isCorrect
                  ? 'var(--status-online)'
                  : isError
                  ? 'var(--status-danger)'
                  : 'var(--status-warning)'
                const statusBg = isCorrect
                  ? 'var(--status-online-bg)'
                  : isError
                  ? 'var(--status-danger-bg)'
                  : 'var(--status-warning-bg)'
                const statusLabel = isCorrect
                  ? 'Accepted'
                  : isError
                  ? 'Syntax Error'
                  : 'Mismatch'

                return (
                  <div
                    key={att._id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 6,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isCorrect ? (
                          <CheckCircle2 size={13} color="var(--status-online)" />
                        ) : isError ? (
                          <AlertCircle size={13} color="var(--status-danger)" />
                        ) : (
                          <XCircle size={13} color="var(--status-warning)" />
                        )}
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: 700,
                            color: statusColor,
                            background: statusBg,
                            padding: '1px 6px',
                            borderRadius: 3,
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                        {new Date(att.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-canvas)',
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: '1px solid var(--border-subtle)',
                        maxHeight: 64,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.4,
                      }}
                    >
                      {att.query}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                        {att.rowCount} {att.rowCount === 1 ? 'row' : 'rows'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onRestoreQuery(att.query)}
                        title="Load this query into the SQL editor"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'transparent',
                          border: '1px solid var(--border-default)',
                          color: 'var(--brand-primary)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>Restore</span>
                        <ArrowUpRight size={11} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AttemptSidebar
