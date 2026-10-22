import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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
import { AttemptSkeleton } from '@/components/ui/Skeleton'
import AttemptToolbar from '@/components/attempt/AttemptToolbar'
import AttemptSidebar from '@/components/attempt/AttemptSidebar'
import { toast } from 'sonner'

export default function Attempt() {
  const { id } = useParams<{ id: string }>()
  const { data: assignment, isLoading: assignmentLoading } = useAssignment(id!)
  const { data: schema, isLoading: schemaLoading } = useAssignmentSchema(id!)
  const { queryState, execute, cancelQuery, reset, isLoading: queryLoading } = useQueryExecution(id!)
  const { hintData, hint, isLoading: hintLoading, requestHint, clearHint } = useHint(id!)
  const { data: attempts, refetch: refetchAttempts } = useAssignmentAttempts(id!)
  const [sql, setSql] = useState('')

  const handleSqlChange = (value: string) => {
    setSql(value)
    if (queryState.status !== 'idle') reset()
  }

  const handleFormat = () => {
    if (!sql.trim()) return
    setSql(formatSql(sql))
    toast.info('SQL query formatted')
  }

  const handleInsertSnippet = (snippet: string) => {
    setSql((prev) => (prev ? `${prev.trim()} ${snippet}` : snippet))
  }

  const handleRunQuery = async () => {
    if (queryLoading) {
      cancelQuery()
      return
    }
    await execute(sql)
    setTimeout(() => refetchAttempts(), 700)
  }

  const handleRestoreQuery = (query: string) => {
    setSql(query)
    reset()
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

  if (assignmentLoading) return <AttemptSkeleton />

  if (!assignment) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-canvas)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
          Challenge Not Found
        </span>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button
            type="button"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--brand-primary)',
              background: 'var(--brand-muted)',
              border: '1px solid var(--brand-border)',
              padding: '8px 16px',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Back to Challenges
          </button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-canvas)',
          paddingTop: 54,
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 0.2s ease',
        }}
      >
        {/* Workspace Action Toolbar */}
        <AttemptToolbar
          title={assignment.title}
          difficulty={assignment.difficulty}
          sql={sql}
          queryLoading={queryLoading}
          onFormat={handleFormat}
          onReset={() => setSql('')}
          onRun={handleRunQuery}
        />

        {/* Main Workspace Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar: Problem Briefing, Schema Details, and History */}
          <AttemptSidebar
            assignment={assignment}
            schema={schema}
            schemaLoading={schemaLoading}
            attempts={attempts as any}
            onInsertSnippet={handleInsertSnippet}
            onRestoreQuery={handleRestoreQuery}
          />

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