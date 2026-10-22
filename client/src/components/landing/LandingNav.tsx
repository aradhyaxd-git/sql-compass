import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { C, F, Pulse, Show } from './landingTokens'

export default function LandingNav() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 54,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-default)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <img
          src="/logo.png"
          alt="SQL Compass Logo"
          style={{ width: 26, height: 26, objectFit: 'contain' }}
        />
        <span
          style={{
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: 15,
            color: C.t1,
            letterSpacing: '-0.02em',
          }}
        >
          SQL Compass
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
          <Pulse />
          <span
            style={{
              fontFamily: F.ui,
              fontSize: 11,
              color: C.t3,
              letterSpacing: '0.04em',
            }}
          >
            PostgreSQL Sandbox Ready
          </span>
        </div>

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
            color: C.t2,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <Show when="signed-out">
          <Link to="/auth/login" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ color: C.t1 }}
              style={{
                background: 'none',
                border: 'none',
                color: C.t2,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: F.body,
                padding: '6px 12px',
              }}
            >
              Sign in
            </motion.button>
          </Link>
          <Link to="/auth/register" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{
                boxShadow: `0 0 24px ${C.pGlow}`,
                background: '#6668f8',
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: C.primary,
                border: 'none',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                padding: '7px 18px',
                borderRadius: 7,
                fontFamily: F.body,
                transition: 'background 0.2s',
              }}
            >
              Launch &rarr;
            </motion.button>
          </Link>
        </Show>
        <Show when="signed-in">
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ boxShadow: `0 0 24px ${C.pGlow}` }}
              style={{
                background: C.primary,
                border: 'none',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                padding: '7px 18px',
                borderRadius: 7,
                fontFamily: F.body,
              }}
            >
              Mission Control &rarr;
            </motion.button>
          </Link>
        </Show>
      </div>
    </nav>
  )
}
