import React, { useState } from 'react'

interface UserAvatarProps {
  imageUrl?: string | null
  name?: string | null
  size?: number
  shape?: 'circle' | 'rounded'
  className?: string
  style?: React.CSSProperties
}

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const trimmed = name.trim()
  if (!trimmed) return 'U'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

export default function UserAvatar({
  imageUrl,
  name,
  size = 36,
  shape = 'rounded',
  className = '',
  style = {},
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const initials = getInitials(name)
  const borderRadius = shape === 'circle' ? '50%' : 10

  const shouldRenderImage = Boolean(imageUrl && !imageError)

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: '1.5px solid var(--brand-border)',
        background: 'linear-gradient(135deg, var(--brand-muted) 0%, rgba(56, 189, 248, 0.12) 100%)',
        flexShrink: 0,
        ...style,
      }}
    >
      {shouldRenderImage ? (
        <img
          src={imageUrl!}
          alt={name || 'User avatar'}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius,
            display: 'block',
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: Math.max(11, Math.round(size * 0.38)),
            color: 'var(--brand-primary)',
            letterSpacing: '0.02em',
            userSelect: 'none',
          }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
