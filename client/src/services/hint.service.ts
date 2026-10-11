import api from './api'
import type { HintData } from '@/types/query.types'

const hintService = {
  getHint: async (assignmentId: string, currentQuery: string): Promise<HintData> => {
    const { data } = await api.post<{ success: boolean; data: HintData }>('/api/hints', {
      assignmentId,
      currentQuery,
    })
    return data.data
  },
}

export default hintService