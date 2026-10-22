import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/react'
import { motion } from 'framer-motion'
import { Sun, Moon, Command } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import ShortcutsModal from '@/components/ui/ShortcutsModal'

function SandboxStatusDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7 }}>
        <motion.span
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--status-online)', opacity: 0.35 }}
          animate={{ scale: [1, 2, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-online)', position: 'relative' }} />
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
        PostgreSQL 16 Sandbox
      </span>
    </span>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input, textarea or contenteditable
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (e.key === '?' || ((e.metaKey || e.ctrlKey) && e.key === '/')) {
        e.preventDefault()
        setShowShortcuts((prev) => !prev)
      } else if (e.key === 'Escape') {
        setShowShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navLinks = [
    { to: '/dashboard', label: 'Challenges' },
    { to: '/profile', label: 'Activity' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: 54,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-default)',
      backdropFilter: 'blur(12px)',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/logo.png"
            alt="SQL Compass Logo"
            style={{ width: 28, height: 28, objectFit: 'contain' }}
          />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            SQL Compass
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--brand-muted)' : 'transparent',
                  border: active ? '1px solid var(--brand-border)' : '1px solid transparent',
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}>
                  {label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="hidden sm:flex">
          <SandboxStatusDot />
        </div>

        <button
          onClick={() => setShowShortcuts(true)}
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 6,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
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
          <Command size={14} />
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 6,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
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
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <UserButton />
      </div>

      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </nav>
  )
}