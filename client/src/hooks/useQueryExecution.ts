import { useState } from 'react'
import { useAuth } from '@clerk/react'
import queryService from '@/services/query.service'
import type { QueryState, QueryError } from '@/types/query.types'

export function useQueryExecution(assignmentId: string) {
  const { isLoaded, isSignedIn } = useAuth()
  const [queryState, setQueryState] = useState<QueryState>({ status: 'idle' })

  const execute = async (sql: string) => {
    if (!sql.trim()) return
    
    if (!isLoaded || !isSignedIn) {
      setQueryState({ status: 'error', error: { message: 'Not authenticated. Please sign in.' } })
      return
    }

    setQueryState({ status: 'loading' })

    try {
      const result = await queryService.execute(assignmentId, sql)
      setQueryState({ status: 'success', data: result })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } }; message?: string }
      const message = axiosError.response?.data?.message ?? axiosError.message ?? 'Something went wrong. Please try again.'
      setQueryState({ status: 'error', error: { message } })
    }
  }

  const reset = () => setQueryState({ status: 'idle' })

  return { queryState, execute, reset, isLoading: queryState.status === 'loading' }
}