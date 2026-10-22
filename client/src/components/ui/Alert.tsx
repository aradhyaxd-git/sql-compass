import React from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

export interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info'
  title?: string
  message: string | React.ReactNode
  onClose?: () => void
  style?: React.CSSProperties
}

export const Alert: React.FC<AlertProps> = ({
  type = 'error',
  title,
  message,
  onClose,
  style,
}) => {
  const configs = {
    error: {
      bg: 'var(--status-danger-bg)',
      border: 'rgba(244, 63, 94, 0.3)',
      color: 'var(--status-danger)',
      Icon: AlertCircle,
    },
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
      color: 'var(--status-success, #22c55e)',
      Icon: CheckCircle2,
    },
    warning: {
      bg: 'rgba(234, 179, 8, 0.1)',
      border: 'rgba(234, 179, 8, 0.3)',
      color: '#eab308',
      Icon: AlertTriangle,
    },
    info: {
      bg: 'var(--brand-muted)',
      border: 'var(--brand-border)',
      color: 'var(--brand-primary)',
      Icon: Info,
    },
  }

  const { bg, border, color, Icon } = configs[type]

  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: bg,
        border: `1px solid ${border}`,
        color,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        lineHeight: 1.4,
        ...style,
      }}
    >
      <Icon size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 600, marginBottom: 2 }}>
            {title}
          </div>
        )}
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            opacity: 0.7,
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default Alert
