import { useState } from 'react'
import { cn } from '@/lib/cn'
import Spinner from '@/components/ui/Spinner'
import type { AssignmentSchema } from '@/types/assignment.types'

interface SchemaViewerProps {
  schema: AssignmentSchema | undefined
  isLoading: boolean
}

const colors = {
  void: '#01010a',
  hull: '#090914',
  deck: '#0e0e1c',
  border: 'rgba(255,255,255,0.07)',
  t1: '#f1f5f9',
  t2: '#94a3b8',
  t3: '#4a5568',
  t4: '#1e2a40',
  primary: '#6366f1',
  success: '#10d98a',
  warning: '#fbbf24',
  error: '#fb7185',
  mono: "'JetBrains Mono', monospace",
  body: "'DM Sans', sans-serif",
}

const typeColorMap: Record<string, string> = {
  'INTEGER': '#60a5fa',
  'SERIAL': '#60a5fa',
  'BIGINT': '#60a5fa',
  'SMALLINT': '#60a5fa',
  'VARCHAR': '#a78bfa',
  'CHARACTER': '#a78bfa',
  'TEXT': '#a78bfa',
  'DATE': '#fbbf24',
  'TIMESTAMP': '#fbbf24',
  'BOOLEAN': '#34d399',
  'DECIMAL': '#f87171',
  'NUMERIC': '#f87171',
  'FLOAT': '#f87171',
  'DOUBLE': '#f87171',
}

function getTypeColor(type: string): string {
  const baseType = type.split('(')[0].toUpperCase()
  return typeColorMap[baseType] || colors.t2
}

export default function SchemaViewer({ schema, isLoading }: SchemaViewerProps) {
  const [activeTable, setActiveTable] = useState(0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    )
  }

  if (!schema || schema.length === 0) {
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
        fontSize: 12, color: colors.t4, fontFamily: colors.body
      }}>
        No schema available
      </div>
    )
  }

  const table = schema[activeTable]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Table Tabs */}
      {schema.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, padding: '12px 14px', paddingBottom: 8,
          borderBottom: `1px solid ${colors.border}`, overflowX: 'auto', flexShrink: 0
        }}>
          {schema.map((t, i) => (
            <button
              key={t.tableName}
              onClick={() => setActiveTable(i)}
              style={{
                padding: '6px 12px', borderRadius: 4, fontSize: 10,
                fontFamily: colors.mono, whiteSpace: 'nowrap', cursor: 'pointer',
                background: activeTable === i ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: activeTable === i ? colors.primary : colors.t4,
                border: activeTable === i ? `1px solid ${colors.primary}` : `1px solid ${colors.border}`,
                transition: 'all 0.2s', fontWeight: activeTable === i ? 500 : 400,
              }}
            >
              {t.tableName}
            </button>
          ))}
        </div>
      )}

      {/* Schema Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Columns Section */}
        <div>
          <div style={{
            fontSize: 10, fontFamily: colors.mono, color: colors.primary,
            letterSpacing: '0.05em', marginBottom: 12, fontWeight: 500, textTransform: 'uppercase'
          }}>
            Columns ({table.columns.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {table.columns.map(col => {
              const typeColor = getTypeColor(col.type)
              return (
                <div key={col.name} style={{
                  padding: '10px', borderRadius: 4,
                  background: 'rgba(99,102,241,0.05)', border: `1px solid rgba(99,102,241,0.1)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: colors.mono, fontSize: 11, color: colors.t1, fontWeight: 500, marginBottom: 4
                    }}>
                      {col.name}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: colors.mono, fontSize: 9, color: typeColor, fontWeight: 500
                      }}>
                        {col.type}
                      </span>
                      {col.nullable && (
                        <span style={{
                          fontSize: 9, fontFamily: colors.mono, color: colors.warning, 
                          background: 'rgba(251,191,36,0.2)', padding: '3px 8px', borderRadius: 3,
                          border: `1px solid rgba(251,191,36,0.4)`, fontWeight: 600, letterSpacing: '0.02em'
                        }}>
                          NULLABLE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sample Data Section */}
        {table.sampleRows.length > 0 && (
          <div>
            <div style={{
              fontSize: 10, fontFamily: colors.mono, color: colors.primary,
              letterSpacing: '0.05em', marginBottom: 12, fontWeight: 500, textTransform: 'uppercase'
            }}>
              Sample Data ({table.sampleRows.length} rows)
            </div>
            <div style={{
              overflowX: 'auto', borderRadius: 4, border: `1px solid ${colors.border}`,
              background: colors.deck
            }}>
              <table style={{
                width: '100%', fontSize: 10, fontFamily: colors.mono, borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ background: colors.hull, borderBottom: `1px solid ${colors.border}` }}>
                    {table.columns.map(col => (
                      <th
                        key={col.name}
                        style={{
                          textAlign: 'left', padding: '8px 10px', color: colors.t2,
                          fontWeight: 500, borderRight: `1px solid ${colors.border}`, whiteSpace: 'nowrap'
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
                        borderBottom: `1px solid ${colors.border}`,
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                      }}
                    >
                      {table.columns.map(col => {
                        const value = row[col.name]
                        return (
                          <td 
                            key={col.name} 
                            style={{
                              padding: '6px 10px', color: colors.t2, borderRight: `1px solid ${colors.border}`,
                              whiteSpace: 'nowrap', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}
                          >
                            {value === null ? (
                              <span style={{ color: colors.t4, fontStyle: 'italic' }}>null</span>
                            ) : (
                              String(value)
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