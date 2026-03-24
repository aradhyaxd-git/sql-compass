import { useState } from 'react'
import { useAuth } from '@clerk/react'
import hintService from '@/services/hint.service'

export function useHint(assignmentId: string) {
  const { isLoaded, isSignedIn } = useAuth()
  const [hint, setHint] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const requestHint = async (currentQuery: string) => {
    if (isLoading) return
    
    if (!isLoaded || !isSignedIn) {
      setHint('Not authenticated. Please sign in.')
      return
    }

    setIsLoading(true)
    setHint(null)

    try {
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