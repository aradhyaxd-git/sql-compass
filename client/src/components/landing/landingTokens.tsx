import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export function Show({ when, children }: { when: 'signed-in' | 'signed-out'; children: React.ReactNode }) {
  const { isSignedIn } = useAuth()
  if (when === 'signed-in' && isSignedIn) return <>{children}</>
  if (when === 'signed-out' && !isSignedIn) return <>{children}</>
  return null
}

export const C = {
  void: 'var(--bg-canvas)',
  hull: 'var(--bg-card)',
  deck: 'var(--bg-subtle)',
  raised: 'var(--bg-elevated)',
  primary: 'var(--brand-primary)',
  pLight: 'var(--brand-hover)',
  pGlow: 'var(--brand-light)',
  signal: 'var(--accent-cyan)',
  sGlow: 'var(--accent-cyan-light)',
  online: 'var(--status-online)',
  alert: 'var(--status-danger)',
  xp: 'var(--status-xp)',
  t1: 'var(--text-primary)',
  t2: 'var(--text-secondary)',
  t3: 'var(--text-muted)',
  t4: 'var(--text-subtle)',
  border: 'var(--border-default)',
  borderA: 'var(--brand-border)',
}

export const F = {
  display: 'var(--font-display)',
  ui: 'var(--font-mono)',
  sql: "'JetBrains Mono', monospace",
  body: 'var(--font-sans)',
}

export const Icon = {
  Terminal: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M7 8l4 4-4 4M13 16h4" />
    </svg>
  ),
  Bolt: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Signal: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" />
    </svg>
  ),
  Map: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  ),
  Chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Compass: ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke={C.primary} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="22" stroke={C.signal} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.4" />
      <circle cx="24" cy="24" r="3.5" fill={C.primary} />
      <path d="M24 6 L26 21 L24 19 L22 21 Z" fill={C.primary} />
      <path d="M24 42 L22 27 L24 29 L26 27 Z" fill={C.t3} />
      <path d="M42 24 L27 22 L29 24 L27 26 Z" fill={C.t3} />
      <path d="M6 24 L21 26 L19 24 L21 22 Z" fill={C.t3} />
      <circle cx="24" cy="24" r="8" stroke={C.pLight} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
    </svg>
  ),
}

export function RankBadge({ rank, active }: { rank: number; active: boolean }) {
  const color = active ? C.pLight : C.t4
  const glowColor = active ? 'rgba(91,94,244,0.3)' : 'transparent'
  const shapes = [
    <polygon key={0} points="12,2 22,12 12,22 2,12" stroke={color} strokeWidth="1.5" fill="none" />,
    <React.Fragment key={1}>
      <polygon points="12,2 22,12 12,22 2,12" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1" fill="none" />
    </React.Fragment>,
    <polygon key={2} points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5" stroke={color} strokeWidth="1.5" fill="none" />,
    <React.Fragment key={3}>
      <polygon points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5" stroke={color} strokeWidth="1.5" fill="none" />
      <polygon points="12,5 13.5,10 18,10 14.5,13 15.8,18 12,15 8.2,18 9.5,13 6,10 10.5,10" stroke={color} strokeWidth="1" fill="none" />
    </React.Fragment>,
    <React.Fragment key={4}>
      <polygon points="12,1 14.5,8.5 22,8.5 16,13 18.5,20.5 12,16 5.5,20.5 8,13 2,8.5 9.5,8.5" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="2.5" fill={color} opacity="0.6" />
    </React.Fragment>,
  ]

  return (
    <div style={{ filter: active ? `drop-shadow(0 0 8px ${glowColor})` : 'none', transition: 'filter 0.3s' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {shapes[rank]}
      </svg>
    </div>
  )
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouse)

    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.4 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
        const dx = n.x - mouse.current.x
        const dy = n.y - mouse.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          n.x += (dx / dist) * 0.8
          n.y += (dy / dist) * 0.8
        }
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12
            ctx.beginPath()
            ctx.strokeStyle = `rgba(91,94,244,${alpha})`
            ctx.lineWidth = 0.6
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(91,94,244,${n.opacity})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  )
}

export function NoiseOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity: 0.022,
      }}
    />
  )
}

export function Pulse({ color = C.online }: { color?: string }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: 8,
        height: 8,
        flexShrink: 0,
      }}
    >
      <motion.span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: color,
          opacity: 0.3,
        }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          position: 'relative',
        }}
      />
    </span>
  )
}

export function TiltCard({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 24 })
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 24 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rotX.set(((e.clientY - cy) / rect.height) * -10)
    rotY.set(((e.clientX - cx) / rect.width) * 10)
  }
  const handleLeave = () => {
    rotX.set(0)
    rotY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX: sRotX,
        rotateY: sRotY,
        transformStyle: 'preserve-3d',
        transformPerspective: 800,
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}
