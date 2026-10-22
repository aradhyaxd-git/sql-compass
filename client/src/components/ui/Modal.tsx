import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  title?: string
  description?: string
  maxWidth?: number | string
  children: React.ReactNode
  showCloseButton?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = 440,
  children,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              padding: '24px 28px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.24)',
              zIndex: 1,
            }}
          >
            {(title || showCloseButton) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  marginBottom: description ? 6 : 20,
                }}
              >
                {title && (
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {title}
                  </h2>
                )}
                {showCloseButton && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {description && (
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  margin: '0 0 20px 0',
                  lineHeight: 1.45,
                }}
              >
                {description}
              </p>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
