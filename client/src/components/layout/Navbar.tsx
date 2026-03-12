import { Link, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/react'
import { motion } from 'framer-motion'

function StatusDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7 }}>
      <motion.span
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', opacity: 0.35 }}
        animate={{ scale: [1, 2, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', position: 'relative' }} />
    </span>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()

  const navLinks = [
    { to: '/dashboard', label: 'Missions' },
    { to: '/profile',   label: 'Flight Log' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 52,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      background: 'rgba(2,2,8,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 6,
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="13" height="13" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="16" stroke="#6366f1" strokeWidth="2.5" />
            <circle cx="20" cy="20" r="3" fill="#6366f1" />
            <polygon points="20,6 22,17 20,15 18,17" fill="#6366f1" />
            <polygon points="20,34 18,23 20,25 22,23" fill="#334155" />
            <polygon points="34,20 23,18 25,20 23,22" fill="#334155" />
            <polygon points="6,20 17,22 15,20 17,18" fill="#334155" />
          </svg>
        </div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 14, color: '#f8fafc', letterSpacing: '-0.01em' }}>
          SQL Compass
        </span>
      </Link>


      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {navLinks.map(({ to, label }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '5px 14px', borderRadius: 6,
                fontSize: 13, fontFamily: 'Inter, sans-serif',
                color: active ? '#f8fafc' : '#475569',
                background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                fontWeight: active ? 500 : 400,
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}>
                {label}
              </div>
            </Link>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusDot />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1e293b', letterSpacing: '0.06em' }}>
            ONLINE
          </span>
        </div>
        <UserButton />
      </div>
    </nav>
  )
}