import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, FileText, Database, RotateCcw, History, Wand2, CheckCircle2, XCircle, AlertCircle, ArrowUpRight } from 'lucide-react'
import { useAssignment, useAssignmentSchema } from '@/hooks/useAssignments'
import { useQueryExecution } from '@/hooks/useQueryExecution'
import { useHint } from '@/hooks/useHints'
import { useAssignmentAttempts } from '@/hooks/useProfile'
import { formatSql } from '@/utils/sqlFormatter'
import Navbar from '@/components/layout/Navbar'
import SQLEditor from '@/components/editor/SQLEditor'
import ResultsTable from '@/components/editor/ResultsTable'
import HintPanel from '@/components/editor/HintPanel'
import SuccessBanner from '@/components/editor/SuccessBanner'
import SchemaViewer from '@/components/assignment/SchemaViewer'
import type { Difficulty } from '@/types/assignment.types'

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string; bg: string; border: string }> = {
  easy: {
    label: 'Foundations',
    color: 'var(--status-online)',
    bg: 'var(--status-online-bg)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  medium: {
    label: 'Intermediate',
    color: 'var(--status-warning)',
    bg: 'var(--status-warning-bg)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  hard: {
    label: 'Advanced',
    color: 'var(--status-danger)',
    bg: 'var(--status-danger-bg)',
    border: 'rgba(244, 63, 94, 0.25)',
  },
}

function DiffChip({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.easy

  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 600,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      padding: '2px 8px',
      borderRadius: 4,
    }}>
      {cfg.label}
    </span>
  )
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2], scaleY: [0.6, 1, 0.6] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            style={{ width: 4, height: 24, borderRadius: 2, background: 'var(--brand-primary)', transformOrigin: 'center' }}
          />
        ))}
      </div>
    </div>
  )
}

type LeftTab = 'question' | 'schema' | 'history'

export default function Attempt() {
  const { id } = useParams<{ id: string }>()
  const { data: assignment, isLoading: assignmentLoading } = useAssignment(id!)
  const { data: schema, isLoading: schemaLoading } = useAssignmentSchema(id!)
  const { queryState, execute, cancelQuery, reset, isLoading: queryLoading } = useQueryExecution(id!)
  const { hintData, hint, isLoading: hintLoading, requestHint, clearHint } = useHint(id!)
  const { data: attempts, refetch: refetchAttempts } = useAssignmentAttempts(id!)
  const [sql, setSql] = useState('')
  const [leftTab, setLeftTab] = useState<LeftTab>('question')

  const handleSqlChange = (value: string) => {
    setSql(value)
    if (queryState.status !== 'idle') reset()
  }

  const handleFormat = () => {
    if (!sql.trim()) return
    setSql(formatSql(sql))
  }

  const handleInsertSnippet = (snippet: string) => {
    setSql((prev) => (prev ? `${prev.trim()} ${snippet}` : snippet))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault()
        handleFormat()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sql])

  if (assignmentLoading) return <LoadingScreen />

  if (!assignment) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
          Challenge Not Found
        </span>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--brand-primary)',
            background: 'var(--brand-muted)',
            border: '1px solid var(--brand-border)',
            padding: '8px 16px',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
          }}>
            Back to Challenges
          </button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        paddingTop: 54,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease',
      }}>
        {/* Workspace Action Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: 48,
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/dashboard"
              aria-label="Back to dashboard"
              style={{
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'var(--brand-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--border-default)'
              }}
            >
              <ArrowLeft size={14} />
            </Link>

            <div style={{ width: 1, height: 16, background: 'var(--border-default)' }} />

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {assignment.title}
            </h1>

            <DiffChip difficulty={assignment.difficulty} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleFormat}
              disabled={!sql.trim()}
              title="Format and prettify SQL query"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 6,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                color: sql.trim() ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                cursor: sql.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (sql.trim()) e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                if (sql.trim()) e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <Wand2 size={12} />
              <span>Format</span>
            </button>

            {sql.trim() !== '' && (
              <button
                onClick={() => setSql('')}
                title="Reset editor"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}

            <motion.button
              onClick={async () => {
                if (queryLoading) {
                  cancelQuery()
                  return
                }
                await execute(sql)
                setTimeout(() => refetchAttempts(), 700)
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 16px',
                background: queryLoading ? 'var(--status-danger-bg)' : 'var(--brand-primary)',
                border: queryLoading ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--brand-border)',
                borderRadius: 6,
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                color: queryLoading ? 'var(--status-danger)' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: queryLoading ? 'none' : 'var(--shadow-sm)',
              }}
            >
              {queryLoading ? (
                <span>Cancel</span>
              ) : (
                <>
                  <Play size={12} fill="currentColor" />
                  <span>Run Query</span>
                  <kbd style={{
                    fontSize: 10,
                    opacity: 0.8,
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '1px 5px',
                    borderRadius: 3,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    Cmd+Enter
                  </kbd>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Main Workspace Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar: Problem Briefing, Schema Details, and History */}
          <div style={{
            width: 350,
            flexShrink: 0,
            borderRight: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--bg-card)',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', flexShrink: 0, background: 'var(--bg-subtle)' }}>
              {[
                { id: 'question', label: 'Brief', icon: FileText },
                { id: 'schema', label: 'Schema', icon: Database },
                { id: 'history', label: `History${attempts && attempts.length > 0 ? ` (${attempts.length})` : ''}`, icon: History },
              ].map((tab) => {
                const active = leftTab === tab.id
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setLeftTab(tab.id as LeftTab)}
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
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 10,
                  }}>
                    Requirement
                  </h2>
                  <p style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                    fontFamily: 'var(--font-sans)',
                    marginBottom: 24,
                  }}>
                    {assignment.description}
                  </p>

                  {assignment.tags && assignment.tags.length > 0 && (
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        letterSpacing: '0.06em',
                        marginBottom: 10,
                        textTransform: 'uppercase',
                      }}>
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
                  onInsertText={handleInsertSnippet}
                />
              )}

              {leftTab === 'history' && (
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {!attempts || attempts.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px 16px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      textAlign: 'center',
                    }}>
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
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 11,
                                fontWeight: 700,
                                color: statusColor,
                                background: statusBg,
                                padding: '1px 6px',
                                borderRadius: 3,
                              }}>
                                {statusLabel}
                              </span>
                            </div>

                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                              {new Date(att.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div style={{
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
                          }}>
                            {att.query}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                              {att.rowCount} {att.rowCount === 1 ? 'row' : 'rows'}
                            </span>

                            <button
                              onClick={() => {
                                setSql(att.query)
                                reset()
                              }}
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

          {/* Right Editor & Results Console */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {queryState.status === 'success' && (
              <SuccessBanner
                rowCount={queryState.data.rowCount}
                duration={queryState.data.duration}
                verdict={queryState.data.verdict}
                xpEarned={queryState.data.xpEarned}
              />
            )}

            {/* SQL CodeMirror Editor */}
            <div style={{ flex: 1, overflow: 'hidden', borderBottom: '1px solid var(--border-default)' }}>
              <SQLEditor value={sql} onChange={handleSqlChange} onRun={() => execute(sql)} />
            </div>

            {/* Query Results Table Console */}
            <div style={{ height: 230, borderBottom: '1px solid var(--border-default)', overflow: 'hidden' }}>
              <ResultsTable queryState={queryState} />
            </div>

            {/* Adaptive Pedagogical Hint Panel */}
            <HintPanel
              hintData={hintData}
              hint={hint}
              isLoading={hintLoading}
              onRequest={() => requestHint(sql)}
              onClear={clearHint}
            />
          </div>
        </div>
      </div>
    </>
  )
}