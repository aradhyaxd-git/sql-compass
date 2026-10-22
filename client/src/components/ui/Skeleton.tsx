import React from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 6,
  className = '',
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`shimmer-element ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  )
}

export function ChallengeCardSkeleton() {
  return (
    <div
      className="shimmer-card"
      style={{
        padding: '20px 22px',
        borderRadius: 10,
        height: 180,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Skeleton width={80} height={20} borderRadius={4} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </div>
        <Skeleton width="75%" height={18} borderRadius={4} style={{ marginBottom: 10 }} />
        <Skeleton width="100%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
        <Skeleton width="55%" height={12} borderRadius={4} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Skeleton width={50} height={18} borderRadius={4} />
          <Skeleton width={60} height={18} borderRadius={4} />
        </div>
        <Skeleton width={24} height={24} borderRadius={6} />
      </div>
    </div>
  )
}

export function StatsTileSkeleton() {
  return (
    <div
      className="shimmer-card"
      style={{
        padding: '16px 20px',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flex: 1,
        minWidth: 180,
      }}
    >
      <Skeleton width={42} height={42} borderRadius={10} />
      <div style={{ flex: 1 }}>
        <Skeleton width={70} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
        <Skeleton width={45} height={20} borderRadius={4} />
      </div>
    </div>
  )
}

export function DashboardHeaderSkeleton() {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-card)',
        padding: '36px 24px 28px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
          <div>
            <Skeleton width={140} height={22} borderRadius={4} style={{ marginBottom: 12 }} />
            <Skeleton width={260} height={30} borderRadius={6} style={{ marginBottom: 10 }} />
            <Skeleton width={420} height={14} borderRadius={4} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Skeleton width={130} height={70} borderRadius={10} />
            <Skeleton width={130} height={70} borderRadius={10} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        paddingTop: 54,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Skeleton */}
      <div
        style={{
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-card)',
          padding: '36px 24px 28px',
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Skeleton width={56} height={56} borderRadius={12} />
            <div>
              <Skeleton width={200} height={24} borderRadius={6} style={{ marginBottom: 8 }} />
              <Skeleton width={90} height={22} borderRadius={6} />
            </div>
          </div>
          <Skeleton width={96} height={36} borderRadius={6} />
        </div>
      </div>

      {/* Content Skeleton */}
      <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '32px 24px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <StatsTileSkeleton />
          <StatsTileSkeleton />
          <StatsTileSkeleton />
        </div>

        <div className="shimmer-card" style={{ padding: 24, borderRadius: 10, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Skeleton width={140} height={14} borderRadius={4} />
            <Skeleton width={80} height={14} borderRadius={4} />
          </div>
          <Skeleton width="100%" height={8} borderRadius={4} />
        </div>

        <div className="shimmer-card" style={{ padding: 24, borderRadius: 10 }}>
          <Skeleton width={180} height={20} borderRadius={4} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={36} borderRadius={6} style={{ marginBottom: 10 }} />
          <Skeleton width="100%" height={36} borderRadius={6} style={{ marginBottom: 10 }} />
          <Skeleton width="100%" height={36} borderRadius={6} />
        </div>
      </div>
    </main>
  )
}

export function AttemptSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', paddingTop: 54, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 48, borderBottom: '1px solid var(--border-default)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
        <Skeleton width={120} height={28} borderRadius={6} />
        <Skeleton width={200} height={20} borderRadius={4} />
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '400px 1fr', height: 'calc(100vh - 102px)' }}>
        <div style={{ borderRight: '1px solid var(--border-default)', padding: 20 }}>
          <Skeleton width={80} height={22} borderRadius={4} style={{ marginBottom: 16 }} />
          <Skeleton width="90%" height={26} borderRadius={6} style={{ marginBottom: 14 }} />
          <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width="95%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={14} borderRadius={4} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={140} borderRadius={8} />
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton width="100%" height={280} borderRadius={8} />
          <Skeleton width="100%" height={160} borderRadius={8} />
        </div>
      </div>
    </div>
  )
}

export function PageLoadingSkeleton() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 54,
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton width={32} height={32} borderRadius={8} />
          <Skeleton width={100} height={18} borderRadius={4} />
        </div>
        <Skeleton width={36} height={36} borderRadius="50%" />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '36px 24px', flex: 1 }}>
        <Skeleton width={180} height={24} borderRadius={6} style={{ marginBottom: 12 }} />
        <Skeleton width={320} height={14} borderRadius={4} style={{ marginBottom: 32 }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ChallengeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
