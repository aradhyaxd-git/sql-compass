import api from './api'
import type { QueryResult } from '@/types/query.types'

const queryService = {
  execute: async (assignmentId: string, sql: string, signal?: AbortSignal): Promise<QueryResult> => {
    const { data } = await api.post('/api/query/execute', { assignmentId, sql }, { signal })
    return data.data
  },
}

export default queryService