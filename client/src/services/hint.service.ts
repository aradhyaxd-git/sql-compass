import api from './api'
import type { HintResponse } from '@/types/query.types'

const hintService = {
  getHint: async (assignmentId: string, currentQuery: string): Promise<string> => {
    const { data } = await api.post<{ success: boolean; data: HintResponse }>('/api/hints', {
      assignmentId,
      currentQuery,
    })
    return data.data.hint  
  },
}

export default hintService