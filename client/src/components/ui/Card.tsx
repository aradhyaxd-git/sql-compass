import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', style, children, className = '', ...props }, ref) => {
    const paddingMap = {
      none: 0,
      sm: '14px 16px',
      md: '20px 24px',
      lg: '28px 32px',
    }

    const backgroundMap = {
      default: 'var(--bg-card)',
      elevated: 'var(--bg-card)',
      subtle: 'var(--bg-subtle)',
    }

    const shadowMap = {
      default: 'none',
      elevated: '0 8px 30px rgba(0, 0, 0, 0.12)',
      subtle: 'none',
    }

    return (
      <div
        ref={ref}
        style={{
          background: backgroundMap[variant],
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          padding: paddingMap[padding],
          boxShadow: shadowMap[variant],
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          ...style,
        }}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
export default Card
