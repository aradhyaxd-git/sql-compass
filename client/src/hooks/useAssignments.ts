import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/react'
import assignmentService from '@/services/assignment.service'

export const assignmentKeys = {
  all: ['assignments'] as const,
  detail: (id: string) => ['assignments', id] as const,
  schema: (id: string) => ['assignments', id, 'schema'] as const,
}

export function useAssignments() {
  const { isLoaded, isSignedIn } = useAuth()
  
  return useQuery({
    queryKey: assignmentKeys.all,
    queryFn: assignmentService.getAll,
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAssignment(id: string) {
  const { isLoaded, isSignedIn } = useAuth()
  
  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => assignmentService.getById(id),
    enabled: Boolean(id) && isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAssignmentSchema(id: string) {
  const { isLoaded, isSignedIn } = useAuth()
  
  return useQuery({
    queryKey: assignmentKeys.schema(id),
    queryFn: () => assignmentService.getSchema(id),
    enabled: Boolean(id) && isLoaded && isSignedIn,
    staleTime: 10 * 60 * 1000,
  })
}