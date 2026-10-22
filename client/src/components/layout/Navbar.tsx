import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon, Command, LogOut, ChevronDown } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import ShortcutsModal from '@/components/ui/ShortcutsModal'
import UserAvatar from '@/components/ui/UserAvatar'

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

        <UserMenu />
      </div>

      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </nav>
  )
}

function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="User menu"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          borderRadius: 20,
          cursor: 'pointer',
          padding: '3px 8px 3px 4px',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-strong, var(--border-default))'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)'
        }}
      >
        <UserAvatar
          imageUrl={user.imageUrl}
          name={user.fullName || user.username || user.firstName}
          size={24}
          shape="circle"
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-primary)',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.username ? `@${user.username}` : user.firstName}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 230,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              padding: '12px 14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              zIndex: 100,
            }}
          >
            <div style={{ marginBottom: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                  {user.fullName || user.username}
                </div>
                {user.role === 'admin' && (
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'var(--status-warning-bg)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--status-warning)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Admin
                  </span>
                )}
              </div>
              {user.username && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--brand-primary)',
                    marginTop: 2,
                  }}
                >
                  @{user.username}
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 3 }}>
                {user.email}
              </div>
            </div>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                padding: '6px 0',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              Profile & Activity
            </Link>

            <button
              onClick={async () => {
                setIsOpen(false)
                await signOut()
                navigate('/')
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                marginTop: 6,
                padding: '6px 0',
                background: 'transparent',
                border: 'none',
                borderTop: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                color: 'var(--status-danger)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}