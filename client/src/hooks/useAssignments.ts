import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/react'
import { setAuthToken } from '@/services/api'
import assignmentService from '@/services/assignment.service'

export const assignmentKeys = {
  all: ['assignments'] as const,
  detail: (id: string) => ['assignments', id] as const,
  schema: (id: string) => ['assignments', id, 'schema'] as const,
}

export function useAssignments() {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: assignmentKeys.all,
    queryFn: async () => {
      const token = await getToken()
      setAuthToken(token)
      return assignmentService.getAll()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useAssignment(id: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: async () => {
      const token = await getToken()
      setAuthToken(token)
      return assignmentService.getById(id)
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAssignmentSchema(id: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: assignmentKeys.schema(id),
    queryFn: async () => {
      const token = await getToken()
      setAuthToken(token)
      return assignmentService.getSchema(id)
    },
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  })
}