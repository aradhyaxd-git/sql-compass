import { useState } from 'react'
import { useAuth } from '@clerk/react'
import { setAuthToken } from '@/services/api'
import queryService from '@/services/query.service'
import type { QueryState, QueryError } from '@/types/query.types'

export function useQueryExecution(assignmentId: string) {
  const { getToken } = useAuth()
  const [queryState, setQueryState] = useState<QueryState>({ status: 'idle' })

  const execute = async (sql: string) => {
    if (!sql.trim()) return

    setQueryState({ status: 'loading' })

    try {
      const token = await getToken()
      setAuthToken(token)
      const result = await queryService.execute(assignmentId, sql)
      setQueryState({ status: 'success', data: result })
    } catch (err: unknown) {
      const error = (err as { response?: { data?: QueryError } }).response?.data
      setQueryState({
        status: 'error',
        error: error ?? { message: 'Something went wrong. Please try again.' },
      })
    }
  }

  const reset = () => setQueryState({ status: 'idle' })

  return { queryState, execute, reset, isLoading: queryState.status === 'loading' }
}