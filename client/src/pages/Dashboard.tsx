import { useState, useMemo } from 'react'
import { useUser } from '@/context/AuthContext'
import { useAssignments } from '@/hooks/useAssignments'
import { useUserStats, useAttemptHistory } from '@/hooks/useProfile'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ChallengeCardSkeleton } from '@/components/ui/Skeleton'
import ChallengeCard from '@/components/dashboard/ChallengeCard'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardFilterBar, { Filter, StatusFilter } from '@/components/dashboard/DashboardFilterBar'

export default function Dashboard() {
  const { user } = useUser()
  const [filter, setFilter] = useState<Filter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: assignments, isLoading, error } = useAssignments()
  const { data: stats } = useUserStats()
  const { data: attemptHistory } = useAttemptHistory()

  const solvedIds = useMemo(() => {
    const ids = new Set<string>()
    if (attemptHistory) {
      for (const a of attemptHistory) {
        if (a.correct) ids.add(a.assignmentId)
      }
    }
    return ids
  }, [attemptHistory])

  const allTopics = useMemo(() => {
    if (!assignments) return []
    const tagSet = new Set<string>()
    for (const a of assignments) {
      if (a.tags) {
        for (const t of a.tags) tagSet.add(t)
      }
    }
    return Array.from(tagSet).sort()
  }, [assignments])

  const filtered = useMemo(() => {
    if (!assignments) return []
    return assignments.filter((a) => {
      const matchesDifficulty = filter === 'all' || a.difficulty === filter
      const matchesTopic = selectedTopic === 'all' || (a.tags && a.tags.includes(selectedTopic))
      const isSolved = solvedIds.has(a._id)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'solved' && isSolved) ||
        (statusFilter === 'unsolved' && !isSolved)

      const matchesSearch =
        searchQuery.trim() === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesDifficulty && matchesTopic && matchesStatus && matchesSearch
    })
  }, [assignments, filter, selectedTopic, statusFilter, solvedIds, searchQuery])

  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--bg-canvas)',
          paddingTop: 54,
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 0.2s ease',
        }}
      >
        {/* Header Hero Banner */}
        <div
          style={{
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-card)',
            padding: '36px 24px 28px',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <DashboardHeader
              firstName={user?.firstName}
              username={user?.username}
              missionsCompleted={stats?.missionsCompleted ?? 0}
              totalMissions={assignments?.length ?? 31}
              totalXP={stats?.totalXP ?? 0}
            />

            <DashboardFilterBar
              filter={filter}
              onFilterChange={setFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              allTopics={allTopics}
              selectedTopic={selectedTopic}
              onTopicChange={setSelectedTopic}
            />
          </div>
        </div>

        {/* Challenge Cards Grid */}
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 24px', flex: 1 }}>
          {isLoading && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <ChallengeCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && (
            <div
              style={{
                padding: 24,
                borderRadius: 8,
                background: 'var(--status-danger-bg)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: 'var(--status-danger)',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
              }}
            >
              Unable to load challenges. Please verify backend connection.
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '64px 20px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>
                No challenges match your search
              </p>
              <p style={{ fontSize: 13 }}>Try clearing filters or searching for another keyword.</p>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}
            >
              {filtered.map((assignment, index) => (
                <ChallengeCard
                  key={assignment._id}
                  assignment={assignment}
                  index={index}
                  isSolved={solvedIds.has(assignment._id)}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </>
  )
}