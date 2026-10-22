import { motion, AnimatePresence } from 'framer-motion'
import { X, Command, Play, Wand2, Database, Download } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  {
    keys: ['Cmd', 'Enter'],
    description: 'Execute query in PostgreSQL sandbox',
    icon: Play,
  },
  {
    keys: ['Cmd', 'Shift', 'F'],
    description: 'Format & prettify SQL keywords and clauses',
    icon: Wand2,
  },
  {
    keys: ['Click Identifier'],
    description: 'Insert table or column name into SQL editor',
    icon: Database,
  },
  {
    keys: ['Export CSV'],
    description: 'Download query output to a CSV file',
    icon: Download,
  },
  {
    keys: ['?'],
    description: 'Toggle this keyboard shortcuts cheat sheet',
    icon: Command,
  },
  {
    keys: ['Esc'],
    description: 'Close modals and dismiss hint panels',
    icon: X,
  },
]

export default function ShortcutsModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              padding: '24px 28px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 201,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Command size={16} color="var(--brand-primary)" />
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}>
                  Keyboard Shortcuts
                </h2>
              </div>

              <button
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
              {SHORTCUTS.map((s, i) => {
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
                            padding: '2px 6px',
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
            <div style={{
              marginTop: 18,
              paddingTop: 12,
              borderTop: '1px solid var(--border-subtle)',
              fontSize: 12,
              color: 'var(--text-muted)',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
            }}>
              Press <kbd style={{ padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>?</kbd> anytime to open this guide
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
