import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import hintService from '@/services/hint.service'
import type { HintData } from '@/types/query.types'

export function useHint(assignmentId: string) {
  const { isLoaded, isSignedIn } = useAuth()
  const [hintData, setHintData] = useState<HintData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const requestHint = async (currentQuery: string) => {
    if (isLoading) return

    if (!isLoaded || !isSignedIn) {
      setHintData({ hint: 'Not authenticated. Please sign in.', level: 1 })
      return
    }

    setIsLoading(true)
    setHintData(null)

    try {
      const result = await hintService.getHint(assignmentId, currentQuery)
      setHintData(result)
    } catch {
      setHintData({
        hint: 'Could not fetch a hint right now. Try again in a moment.',
        level: 1,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearHint = () => setHintData(null)

  return {
    hintData,
    hint: hintData?.hint ?? null,
    level: hintData?.level ?? 1,
    errorClass: hintData?.errorClass,
    concept: hintData?.concept,
    fromCache: hintData?.fromCache,
    isLoading,
    requestHint,
    clearHint,
  }
}