import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

interface UserStats {
  missionsCompleted: number
  queriesExecuted: number
  totalXP: number
  rank: {
    name: string
    index: number
    nextXP: number | null
  }
}

export interface Attempt {
  _id: string
  assignmentId: string
  assignmentTitle: string
  query: string
  status: 'success' | 'error'
  correct?: boolean
  verdictReason?: string
  rowCount: number
  xpEarned?: number
  executedAt: string
}

export function useUserStats() {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: UserStats }>('/api/profile/stats')
      return data.data
    },
  })
}

export function useAttemptHistory() {
  return useQuery({
    queryKey: ['attemptHistory'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Attempt[] }>('/api/profile/attempts')
      return data.data
    },
  })
}

export function useAssignmentAttempts(assignmentId: string) {
  return useQuery({
    queryKey: ['assignmentAttempts', assignmentId],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Attempt[] }>('/api/profile/attempts', {
        params: { assignmentId, limit: 15 },
      })
      return data.data
    },
    enabled: !!assignmentId,
  })
}
