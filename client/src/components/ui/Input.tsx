import React, { forwardRef, useState } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, style, className = '', disabled, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            {label}
          </label>
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: error ? 'var(--status-danger)' : isFocused ? 'var(--brand-primary)' : 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            style={{
              width: '100%',
              padding: leftIcon && rightIcon ? '10px 40px 10px 38px' : leftIcon ? '10px 14px 10px 38px' : rightIcon ? '10px 38px 10px 14px' : '10px 14px',
              borderRadius: 8,
              border: `1px solid ${error ? 'var(--status-danger)' : isFocused ? 'var(--brand-primary)' : 'var(--border-default)'}`,
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontFamily: props.type === 'password' || props.inputMode === 'numeric' ? 'var(--font-mono)' : 'var(--font-sans)',
              fontSize: 13,
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              boxShadow: isFocused ? (error ? '0 0 0 2px rgba(244, 63, 94, 0.2)' : '0 0 0 2px var(--brand-border)') : 'none',
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
              ...style,
            }}
            {...props}
          />

          {rightIcon && (
            <div
              style={{
                position: 'absolute',
                right: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: 'var(--status-danger)',
              lineHeight: 1.3,
            }}
          >
            {error}
          </span>
        ) : helperText ? (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: 'var(--text-muted)',
              lineHeight: 1.3,
            }}
          >
            {helperText}
          </span>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
