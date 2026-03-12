import { useState } from 'react'
import { useAuth } from '@clerk/react'
import { setAuthToken } from '@/services/api'
import hintService from '@/services/hint.service'

export function useHint(assignmentId: string) {
  const { getToken } = useAuth()
  const [hint, setHint] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const requestHint = async (currentQuery: string) => {
    if (isLoading) return

    setIsLoading(true)
    setHint(null)

    try {
      const token = await getToken()
      setAuthToken(token)
      const result = await hintService.getHint(assignmentId, currentQuery)
      setHint(result)
    } catch {
      setHint('Could not fetch a hint right now. Try again in a moment.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearHint = () => setHint(null)

  return { hint, isLoading, requestHint, clearHint }
}