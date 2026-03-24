import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'   
import { useAssignment, useAssignmentSchema } from '@/hooks/useAssignments'
import { useQueryExecution } from '@/hooks/useQueryExecution'
import { useHint } from '@/hooks/useHints'
import Navbar from '@/components/layout/Navbar'
import SQLEditor from '@/components/editor/SQLEditor'
import ResultsTable from '@/components/editor/ResultsTable'
import HintPanel from '@/components/editor/HintPanel'
import SuccessBanner from '@/components/editor/SuccessBanner'
import SchemaViewer from '@/components/assignment/SchemaViewer'
import type { Difficulty } from '@/types/assignment.types'

const D = {
  void: '#01010a',
  hull:'#090914',
  deck:'#0e0e1c',
  border: 'rgba(255,255,255,0.07)',
  t1:'#f1f5f9',
  t2:'#94a3b8',
  t3:'#4a5568',
  t4:'#1e2a40',
  primary:'#6366f1',
  mono:"'JetBrains Mono', monospace",
  display:"'Plus Jakarta Sans', sans-serif",
  body:"'DM Sans', sans-serif",
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function RunIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  )
}

function DiffChip({ difficulty }: { difficulty: Difficulty }) {
  const cfg = {
    easy:{ color: '#10d98a', bg: 'rgba(16,217,138,0.07)', border: 'rgba(16,217,138,0.18)', label: 'RECON',   bars: 1 },
    medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.18)', label: 'STRIKE',  bars: 2 },
    hard:{ color: '#fb7185', bg: 'rgba(251,113,133,0.07)', border: 'rgba(251,113,133,0.18)', label: 'ASSAULT', bars: 3 },
  }[difficulty]

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px',
      background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 9 }}>
        {[1,2,3].map(b => (
          <div key={b} style={{
            width: 3, height: b === 1 ? 3 : b === 2 ? 6 : 9,
            borderRadius: 1,
            background: b <= cfg.bars ? cfg.color : 'rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>
      <span style={{ fontFamily: D.mono, fontSize: 9, color: cfg.color, letterSpacing: '0.1em' }}>
        {cfg.label}
      </span>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: D.void, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {[0,1,2].map(i => (
          <motion.div key={i}
            animate={{ opacity: [0.15, 0.6, 0.15], scaleY: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            style={{ width: 3, height: 20, borderRadius: 2, background: D.primary, transformOrigin: 'center' }}
          />
        ))}
      </div>
    </div>
  )
}

type LeftTab = 'question' | 'schema'

export default function Attempt() {
  const { id } = useParams<{ id: string }>()
  const { data: assignment, isLoading: assignmentLoading } = useAssignment(id!)
  const { data: schema, isLoading: schemaLoading } = useAssignmentSchema(id!)
  const { queryState, execute, reset, isLoading: queryLoading } = useQueryExecution(id!)
  const { hint, isLoading: hintLoading, requestHint, clearHint } = useHint(id!)
  const [sql, setSql] = useState('')
  const [leftTab, setLeftTab] = useState<LeftTab>('question')

  const handleSqlChange = (value: string) => {
    setSql(value)
    if (queryState.status !== 'idle') reset()
  }

  if (assignmentLoading) return <LoadingScreen />

  if (!assignment) {
    return (
      <div style={{ minHeight: '100vh', background: D.void, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontFamily: D.mono, fontSize: 11, color: D.t4, letterSpacing: '0.1em' }}>MISSION NOT FOUND</span>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{ fontFamily: D.mono, fontSize: 10, color: D.t3, background: 'none', border: `1px solid ${D.border}`, padding: '6px 14px', borderRadius: 5, cursor: 'pointer', letterSpacing: '0.08em' }}>
            RETURN TO BASE
          </button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: D.void, paddingTop: 52, display: 'flex', flexDirection: 'column' }}>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 44,
          borderBottom: `1px solid ${D.border}`,
          background: D.hull,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: D.t4, display: 'flex', lineHeight: 1, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = D.t2}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = D.t4}
            >
              <BackIcon />
            </Link>
            <div style={{ width: 1, height: 16, background: D.border }} />
            <h1 style={{ fontFamily: D.display, fontWeight: 600, fontSize: 13, color: D.t1, letterSpacing: '-0.01em' }}>
              {assignment.title}
            </h1>
            <DiffChip difficulty={assignment.difficulty} />
          </div>

         
          <motion.button
            onClick={() => execute(sql)}
            disabled={queryLoading}
            whileHover={{ boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 16px',
              background: queryLoading ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.9)',
              border: `1px solid ${queryLoading ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.6)'}`,
              borderRadius: 6,
              fontFamily: D.mono, fontSize: 10, letterSpacing: '0.1em',
              color: queryLoading ? D.t4 : '#fff',
              cursor: queryLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {queryLoading
              ? <div style={{ display: 'flex', gap: 3 }}>
                  {[0,1,2].map(i => (
                    <motion.div key={i}
                      animate={{ opacity: [0.3,1,0.3] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i*0.12 }}
                      style={{ width: 3, height: 3, borderRadius: '50%', background: D.t4 }}
                    />
                  ))}
                </div>
              : <RunIcon />
            }
            {queryLoading ? 'EXECUTING' : 'RUN'}
            {!queryLoading && (
              <span style={{ opacity: 0.5, fontSize: 9 }}>⌘↵</span>
            )}
          </motion.button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          
          <div style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: D.hull }}>

          
            <div style={{ display: 'flex', borderBottom: `1px solid ${D.border}`, flexShrink: 0 }}>
              {(['question', 'schema'] as LeftTab[]).map(tab => {
                const active = leftTab === tab
                return (
                  <button key={tab} onClick={() => setLeftTab(tab)} style={{
                    flex: 1, padding: '9px 0',
                    fontFamily: D.mono, fontSize: 9, letterSpacing: '0.1em',
                    color: active ? D.t1 : D.t4,
                    background: 'none', border: 'none',
                    borderBottom: active ? `1px solid ${D.primary}` : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                    textTransform: 'uppercase',
                    marginBottom: -1,
                  }}>
                    {tab === 'question' ? 'BRIEFING' : 'SCHEMA INTEL'}
                  </button>
                )
              })}
            </div>

         
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {leftTab === 'question' ? (
                <div style={{ padding: '18px 16px' }}>
                  <p style={{ fontSize: 13, color: D.t2, lineHeight: 1.72, fontFamily: D.body, marginBottom: 20 }}>
                    {assignment.description}
                  </p>
                  {assignment.tags.length > 0 && (
                    <div>
                      <p style={{ fontFamily: D.mono, fontSize: 9, color: D.t4, letterSpacing: '0.1em', marginBottom: 10 }}>
                        TOPICS
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {assignment.tags.map((tag: string) => (
                          <span key={tag} style={{
                            fontFamily: D.mono, fontSize: 9, color: D.t3,
                            background: D.deck, border: `1px solid rgba(255,255,255,0.05)`,
                            padding: '3px 8px', borderRadius: 3, letterSpacing: '0.04em',
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <SchemaViewer schema={schema} isLoading={schemaLoading} />
              )}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {queryState.status === 'success' && (
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}`, flexShrink: 0 }}>
                <SuccessBanner rowCount={queryState.data.rowCount} duration={queryState.data.duration} />
              </div>
            )}
            <div style={{ flex: 1, overflow: 'hidden', borderBottom: `1px solid ${D.border}` }}>
              <SQLEditor value={sql} onChange={handleSqlChange} onRun={() => execute(sql)} />
            </div>
            <div style={{ height: 200, borderBottom: `1px solid ${D.border}`, overflow: 'hidden' }}>
              <ResultsTable queryState={queryState} />
            </div>
            <HintPanel hint={hint} isLoading={hintLoading} onRequest={() => requestHint(sql)} onClear={clearHint} />
          </div>
        </div>
      </div>
    </>
  )
}