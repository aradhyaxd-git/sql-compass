import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Play, Download, ChevronDown, ChevronUp, Cpu, Info } from 'lucide-react'
import type { QueryState } from '@/types/query.types'
import { getRunShortcut } from '@/utils/platform'

interface Props {
  queryState: QueryState
}

function downloadCsv(columns: string[], rows: Record<string, unknown>[], rawTuples?: unknown[][]) {
  const header = columns.map((col) => `"${col.replace(/"/g, '""')}"`).join(',')
  const lines = rows.map((row, i) => {
    return columns.map((col, colIdx) => {
      const val = rawTuples && rawTuples[i] ? rawTuples[i][colIdx] : row[col]
      if (val === null || val === undefined) return ''
      const str = String(val)
      return `"${str.replace(/"/g, '""')}"`
    }).join(',')
  })

  const csvContent = [header, ...lines].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `query_results_${Date.now()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function IdleState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 10,
      padding: 24,
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-default)',
        color: 'var(--brand-primary)',
      }}>
        <Play size={16} style={{ marginLeft: 2 }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        letterSpacing: '0.04em',
      }}>
        Execute query ({getRunShortcut()}) to view results
      </span>
    </div>
  )
}

function ExecutingState() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 12,
      padding: 24,
      fontFamily: 'var(--font-mono)',
      color: 'var(--brand-primary)',
    }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.6, 1, 0.6] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--brand-primary)' }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, letterSpacing: '0.04em' }}>Executing in sandbox...</span>
    </div>
  )
}

export default function ResultsTable({ queryState }: Props) {
  const [showPlanDetails, setShowPlanDetails] = useState(false)

  if (queryState.status === 'idle') return <IdleState />
  if (queryState.status === 'loading') return <ExecutingState />

  if (queryState.status === 'error') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '16px 20px',
        background: 'var(--status-danger-bg)',
        borderBottom: '1px solid rgba(244, 63, 94, 0.2)',
      }}>
        <AlertCircle size={18} color="var(--status-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--status-danger)',
            letterSpacing: '0.06em',
            marginBottom: 4,
          }}>
            QUERY EXECUTION ERROR
          </div>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-primary)',
            lineHeight: 1.6,
          }}>
            {queryState.error.message}
          </p>
          {queryState.error.hint && (
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 6,
            }}>
              {queryState.error.hint}
            </p>
          )}
        </div>
      </div>
    )
  }

  const { columns, rows, rawTuples, rowCount, duration } = queryState.data

  if (rows.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 8,
        color: 'var(--text-secondary)',
      }}>
        <CheckCircle2 size={16} color="var(--status-online)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          Query executed successfully — 0 rows returned
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}
    >
      {/* Execution status metadata strip */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} color="var(--status-online)" />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--status-online)',
              letterSpacing: '0.04em',
            }}>
              {rowCount} {rowCount === 1 ? 'ROW' : 'ROWS'} RETURNED
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            · {duration}ms
          </span>

          {queryState.data.executionPlan && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-secondary)',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                padding: '1px 6px',
                borderRadius: 3,
              }}>
                Cost: {queryState.data.executionPlan.totalCost.toFixed(1)}
              </span>
              {queryState.data.executionPlan.hasIndexScan && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--brand-primary)',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  padding: '1px 6px',
                  borderRadius: 3,
                }}>
                  Index Scan
                </span>
              )}
              {queryState.data.executionPlan.hasSeqScan && !queryState.data.executionPlan.hasIndexScan && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1px 6px',
                  borderRadius: 3,
                }}>
                  Seq Scan
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowPlanDetails((prev) => !prev)}
                title="Toggle detailed execution plan"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '1px 6px',
                  borderRadius: 3,
                  background: showPlanDetails ? 'var(--brand-primary)' : 'var(--bg-canvas)',
                  border: '1px solid',
                  borderColor: showPlanDetails ? 'var(--brand-primary)' : 'var(--border-default)',
                  color: showPlanDetails ? '#fff' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Plan</span>
                {showPlanDetails ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => downloadCsv(columns, rows, rawTuples)}
            title="Download results as CSV"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'transparent',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              cursor: 'pointer',
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
            <Download size={11} />
            <span>Export CSV</span>
          </button>

          {queryState.data.xpEarned !== undefined && queryState.data.xpEarned > 0 && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--status-xp)',
              background: 'var(--status-xp-bg)',
              padding: '2px 8px',
              borderRadius: 4,
            }}>
              +{queryState.data.xpEarned} XP EARNED
            </span>
          )}
        </div>
      </div>

      {/* Interactive Execution Plan (EXPLAIN) Drawer */}
      <AnimatePresence>
        {showPlanDetails && queryState.data.executionPlan && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              overflow: 'hidden',
              borderBottom: '1px solid var(--border-default)',
              background: 'var(--bg-canvas)',
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cpu size={14} color="var(--brand-primary)" />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.04em',
                }}>
                  POSTGRESQL EXECUTION PLAN (EXPLAIN)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {queryState.data.executionPlan.nodeTypes.map((nt) => (
                  <span
                    key={nt}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-secondary)',
                      padding: '1px 6px',
                      borderRadius: 3,
                    }}
                  >
                    {nt}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 8,
              marginBottom: 10,
            }}>
              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                padding: '6px 10px',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>TOTAL COST</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {queryState.data.executionPlan.totalCost.toFixed(2)}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                padding: '6px 10px',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>STARTUP COST</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {queryState.data.executionPlan.startupCost.toFixed(2)}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                padding: '6px 10px',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>ESTIMATED ROWS</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {queryState.data.executionPlan.planRows}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                padding: '6px 10px',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>PLAN WIDTH</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {queryState.data.executionPlan.planWidth} B
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 4,
              background: queryState.data.executionPlan.hasSeqScan && !queryState.data.executionPlan.hasIndexScan
                ? 'rgba(234, 179, 8, 0.08)'
                : 'rgba(56, 189, 248, 0.06)',
              border: '1px solid',
              borderColor: queryState.data.executionPlan.hasSeqScan && !queryState.data.executionPlan.hasIndexScan
                ? 'rgba(234, 179, 8, 0.25)'
                : 'rgba(56, 189, 248, 0.2)',
            }}>
              <Info
                size={13}
                color={queryState.data.executionPlan.hasSeqScan && !queryState.data.executionPlan.hasIndexScan ? '#eab308' : 'var(--brand-primary)'}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {queryState.data.executionPlan.hasSeqScan && !queryState.data.executionPlan.hasIndexScan
                  ? 'Sequential Scan detected: The planner must scan every table page. On large production datasets, consider indexing predicate columns to leverage an Index Scan.'
                  : queryState.data.executionPlan.hasIndexScan
                  ? 'Index Scan active: The planner uses an existing index structure, minimizing read latency and page reads.'
                  : 'Execution plan nodes processed efficiently within sandbox resource constraints.'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{
          width: '100%',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          borderCollapse: 'collapse',
          textAlign: 'left',
        }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)' }}>
              {columns.map((col, colIdx) => (
                <th
                  key={`${col}-${colIdx}`}
                  style={{
                    padding: '8px 16px',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-default)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.03em',
                    fontSize: 11,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-subtle)',
                }}
              >
                {columns.map((col, colIdx) => {
                  const val = rawTuples && rawTuples[i] ? rawTuples[i][colIdx] : row[col]
                  return (
                    <td
                      key={`${col}-${colIdx}`}
                      style={{
                        padding: '8px 16px',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        maxWidth: 280,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {val === null || val === undefined ? (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>null</span>
                      ) : (
                        String(val)
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}