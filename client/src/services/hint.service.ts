import api from './api'
import type { HintResponse } from '@/types/query.types'

const hintService = {
  getHint: async (assignmentId: string, currentQuery: string): Promise<string> => {
    const { data } = await api.post<HintResponse>('/api/hints', {
      assignmentId,
      currentQuery,
    })
    return data.hint
  },
}

export default hintService