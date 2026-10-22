import React from 'react'
import { Sparkles, CheckCircle2, Award } from 'lucide-react'

interface DashboardHeaderProps {
  firstName?: string
  username?: string
  missionsCompleted: number
  totalMissions: number
  totalXP: number
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  firstName,
  username,
  missionsCompleted,
  totalMissions,
  totalXP,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 28,
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px',
            borderRadius: 4,
            background: 'var(--brand-muted)',
            border: '1px solid var(--brand-border)',
            color: 'var(--brand-primary)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            marginBottom: 10,
            letterSpacing: '0.04em',
          }}
        >
          <Sparkles size={12} />
          <span>CURATED PRACTICE TRACK</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 26,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {firstName ? `Welcome back, ${firstName}` : username ? `Welcome back, @${username}` : 'SQL Challenges & Missions'}
          </h1>
          {username && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--brand-primary)',
                background: 'var(--brand-muted)',
                border: '1px solid var(--brand-border)',
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              @{username}
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginTop: 6,
            marginBottom: 0,
            fontFamily: 'var(--font-sans)',
            maxWidth: 600,
            lineHeight: 1.5,
          }}
        >
          Real PostgreSQL schema execution, automated AST security enforcement, and progressive AI hints.
        </p>
      </div>

      {/* Progress Summary Cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div
          style={{
            padding: '12px 18px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            minWidth: 120,
          }}
        >
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 2 }}>
            SOLVED
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} color="var(--status-online)" />
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {missionsCompleted}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              / {totalMissions}
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '12px 18px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            minWidth: 120,
          }}
        >
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 2 }}>
            EXPERIENCE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={16} color="var(--status-xp)" />
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {totalXP}
            </span>
            <span style={{ fontSize: 11, color: 'var(--status-xp)', fontFamily: 'var(--font-mono)' }}>
              XP
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
