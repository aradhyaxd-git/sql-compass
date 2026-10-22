import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import queryService from '@/services/query.service'
import type { QueryState } from '@/types/query.types'

export function useQueryExecution(assignmentId: string) {
  const { isLoaded, isSignedIn } = useAuth()
  const [queryState, setQueryState] = useState<QueryState>({ status: 'idle' })
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const execute = async (sql: string) => {
    if (!sql.trim()) return

    if (!isLoaded || !isSignedIn) {
      setQueryState({ status: 'error', error: { message: 'Not authenticated. Please sign in.' } })
      return
    }

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setQueryState({ status: 'loading' })

    try {
      const result = await queryService.execute(assignmentId, sql, controller.signal)
      setQueryState({ status: 'success', data: result })
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CanceledError') {
        setQueryState({ status: 'idle' })
        return
      }

      const axiosError = err as { response?: { data?: { message?: string; hint?: string } }; message?: string }
      const message = axiosError.response?.data?.message ?? axiosError.message ?? 'Something went wrong. Please try again.'
      const hint = axiosError.response?.data?.hint
      setQueryState({ status: 'error', error: { message, hint } })
    }
  }

  const cancelQuery = () => {
    abortControllerRef.current?.abort()
    setQueryState({ status: 'idle' })
  }

  const reset = () => {
    abortControllerRef.current?.abort()
    setQueryState({ status: 'idle' })
  }

  return { queryState, execute, cancelQuery, reset, isLoading: queryState.status === 'loading' }
}