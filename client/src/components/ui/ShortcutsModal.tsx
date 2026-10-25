import { useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard, Play, Wand2, Database, Download } from 'lucide-react'
import { getModifierKey, isMacPlatform } from '@/utils/platform'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ShortcutsModal({ isOpen, onClose }: Props) {
  const isMac = useMemo(() => isMacPlatform(), [])
  const modKey = useMemo(() => getModifierKey(), [])

  const shortcuts = useMemo(
    () => [
      {
        keys: [modKey, 'Enter'],
        description: 'Execute query against live database',
        icon: Play,
      },
      {
        keys: [modKey, 'Shift', 'F'],
        description: 'Auto-format and beautify SQL query',
        icon: Wand2,
      },
      {
        keys: ['Click Schema'],
        description: 'Insert table or column name into editor',
        icon: Database,
      },
      {
        keys: ['Export CSV'],
        description: 'Export query results to CSV file',
        icon: Download,
      },
      {
        keys: ['?'],
        description: 'View keyboard shortcuts guide',
        icon: Keyboard,
      },
      {
        keys: ['Esc'],
        description: 'Close active modal or dismiss panels',
        icon: X,
      },
    ],
    [modKey]
  )

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              padding: '24px 28px',
              boxShadow: 'var(--shadow-xl, 0 24px 48px rgba(0, 0, 0, 0.4))',
              zIndex: 10000,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    background: 'var(--brand-muted)',
                    color: 'var(--brand-primary)',
                    border: '1px solid var(--brand-border)',
                  }}
                >
                  <Keyboard size={16} />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                      margin: 0,
                    }}
                  >
                    Keyboard Shortcuts
                  </h2>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {isMac ? 'macOS profile active' : 'Windows / Linux profile active'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {shortcuts.map((s, i) => {
                const Icon = s.icon
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 6,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={14} color="var(--text-secondary)" />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                        {s.description}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {s.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 4,
                            padding: '2px 7px',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer tip */}
            <div
              style={{
                marginTop: 18,
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
                fontSize: 12,
                color: 'var(--text-muted)',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Press{' '}
              <kbd
                style={{
                  padding: '2px 6px',
                  borderRadius: 3,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-subtle)',
                }}
              >
                ?
              </kbd>{' '}
              anytime to toggle shortcuts
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
