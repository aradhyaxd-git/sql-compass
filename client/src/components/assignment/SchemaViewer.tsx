import { useState } from 'react'
import { cn } from '@/lib/cn'
import Spinner from '@/components/ui/Spinner'
import type { AssignmentSchema } from '@/types/assignment.types'

interface SchemaViewerProps {
  schema: AssignmentSchema | undefined
  isLoading: boolean
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
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        No schema available
      </div>
    )
  }

  const table = schema[activeTable]

  return (
    <div className="flex flex-col h-full">

      {schema.length > 1 && (
        <div className="flex gap-1 px-4 pt-3 pb-2 border-b border-border shrink-0 overflow-x-auto">
          {schema.map((t, i) => (
            <button
              key={t.tableName}
              onClick={() => setActiveTable(i)}
              className={cn(
                'px-3 py-1 rounded text-xs font-mono whitespace-nowrap cursor-pointer transition-colors',
                activeTable === i
                  ? 'bg-brand/15 text-brand-light'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {t.tableName}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-5">

        
        <div>
          <p className="text-2xs text-text-muted font-semibold uppercase tracking-widest mb-2">
            Columns
          </p>
          <div className="space-y-1">
            {table.columns.map(col => (
              <div key={col.name} className="flex items-center gap-2 font-mono text-xs">
                <span className="text-text-primary">{col.name}</span>
                <span className="text-brand-light">{col.type}</span>
                {col.nullable && (
                  <span className="text-text-muted text-2xs">nullable</span>
                )}
              </div>
            ))}
          </div>
        </div>


        {table.sampleRows.length > 0 && (
          <div>
            <p className="text-2xs text-text-muted font-semibold uppercase tracking-widest mb-2">
              Sample data
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-overlay">
                    {table.columns.map(col => (
                      <th
                        key={col.name}
                        className="text-left px-3 py-2 text-text-muted font-medium border-b border-border whitespace-nowrap"
                      >
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.sampleRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      {table.columns.map(col => (
                        <td key={col.name} className="px-3 py-1.5 text-text-secondary whitespace-nowrap">
                          {row[col.name] === null
                            ? <span className="text-text-muted italic">null</span>
                            : String(row[col.name])
                          }
                        </td>
                      ))}
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