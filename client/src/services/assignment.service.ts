import api from './api'
import type { Assignment, AssignmentSchema } from '@/types/assignment.types'

const assignmentService = {
  getAll: async (): Promise<Assignment[]> => {
    const { data } = await api.get('/api/assignments')
    return data.data   
  },

  getById: async (id: string): Promise<Assignment> => {
    const { data } = await api.get(`/api/assignments/${id}`)
    return data.data
  },

  getSchema: async (id: string): Promise<AssignmentSchema> => {
    const { data } = await api.get(`/api/assignments/${id}/schema`)
    return data.data
  },
}

export default assignmentService