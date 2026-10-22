import { useState } from 'react'
import { Database, Table as TableIcon, Copy, Check, Plus } from 'lucide-react'
import Spinner from '@/components/ui/Spinner'
import type { AssignmentSchema } from '@/types/assignment.types'

interface SchemaViewerProps {
  schema: AssignmentSchema | undefined
  isLoading: boolean
  onInsertText?: (text: string) => void
}

export default function SchemaViewer({ schema, isLoading, onInsertText }: SchemaViewerProps) {
  const [activeTable, setActiveTable] = useState(0)
  const [copiedIdentifier, setCopiedIdentifier] = useState<string | null>(null)

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedIdentifier(text)
    setTimeout(() => {
      setCopiedIdentifier((prev) => (prev === text ? null : prev))
    }, 1500)
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 32 }}>
        <Spinner />
      </div>
    )
  }

  if (!schema || schema.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontSize: 13,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
      }}>
        No schema details available for this problem
      </div>
    )
  }

  const table = schema[activeTable] || schema[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-card)' }}>
      {/* Table Tabs */}
      {schema.length > 1 && (
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-subtle)',
          overflowX: 'auto',
          flexShrink: 0,
        }}>
          {schema.map((t, i) => {
            const active = activeTable === i
            return (
              <button
                key={t.tableName}
                onClick={() => setActiveTable(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: active ? 'var(--brand-muted)' : 'transparent',
                  color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  border: active ? '1px solid var(--brand-border)' : '1px solid var(--border-default)',
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.15s ease',
                }}
              >
                <TableIcon size={13} />
                <span>{t.tableName}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Schema Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Columns Definition */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--brand-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              <Database size={13} />
              <span>Schema Columns ({table.columns.length})</span>
            </div>

            <button
              onClick={(e) => handleCopy(e, table.tableName)}
              title="Copy table name"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 4,
                background: 'transparent',
                border: '1px solid var(--border-default)',
                color: copiedIdentifier === table.tableName ? 'var(--status-online)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              {copiedIdentifier === table.tableName ? <Check size={11} /> : <Copy size={11} />}
              <span>{copiedIdentifier === table.tableName ? 'Copied' : table.tableName}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {table.columns.map((col) => {
              const isCopied = copiedIdentifier === col.name
              return (
                <div
                  key={col.name}
                  onClick={() => onInsertText?.(col.name)}
                  title={onInsertText ? `Click to insert "${col.name}" into editor` : undefined}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: onInsertText ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (onInsertText) {
                      e.currentTarget.style.borderColor = 'var(--brand-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onInsertText) {
                      e.currentTarget.style.borderColor = 'var(--border-default)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {onInsertText && (
                      <Plus size={12} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      {col.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--brand-primary)',
                      background: 'var(--brand-light)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}>
                      {col.type}
                    </span>
                    {col.nullable && (
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--status-warning)',
                        background: 'var(--status-warning-bg)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        padding: '2px 5px',
                        borderRadius: 3,
                      }}>
                        NULLABLE
                      </span>
                    )}
                    <button
                      onClick={(e) => handleCopy(e, col.name)}
                      title="Copy column name"
                      style={{
                        padding: 3,
                        borderRadius: 4,
                        background: 'transparent',
                        border: 'none',
                        color: isCopied ? 'var(--status-online)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sample Rows Section */}
        {table.sampleRows && table.sampleRows.length > 0 && (
          <div>
            <div style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Sample Data ({table.sampleRows.length} rows)
            </div>

            <div style={{
              overflowX: 'auto',
              borderRadius: 6,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-subtle)',
            }}>
              <table style={{
                width: '100%',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-card)' }}>
                    {table.columns.map((col) => (
                      <th
                        key={col.name}
                        style={{
                          padding: '7px 12px',
                          color: 'var(--text-secondary)',
                          fontWeight: 600,
                          borderRight: '1px solid var(--border-default)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.sampleRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)',
                      }}
                    >
                      {table.columns.map((col) => {
                        const val = row[col.name]
                        return (
                          <td
                            key={col.name}
                            style={{
                              padding: '6px 12px',
                              color: 'var(--text-primary)',
                              borderRight: '1px solid var(--border-subtle)',
                              whiteSpace: 'nowrap',
                              maxWidth: 160,
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
          </div>
        )}
      </div>
    </div>
  )
}