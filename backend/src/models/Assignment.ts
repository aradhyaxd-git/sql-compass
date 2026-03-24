import mongoose, { Document, Schema } from 'mongoose'
import type { Difficulty } from '../types/index.js'

export interface IAssignment extends Document {
  title: string
  description: string
  difficulty: Difficulty         
  tags: string[] //eg: ['GROUP BY', 'HAVING']
  tableNames: string[] // e.g. ['employees'] — used by schema endpoint
  schemaDetails: string // plain-text schema hint for LLM prompt
  createdAt: Date
  updatedAt: Date
}


const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'] satisfies Difficulty[],
    },
    tags: {
      type: [String],
      default: [],
    },
    tableNames: {
      type: [String],
      required: true,
    },
    schemaDetails: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model<IAssignment>('Assignment', assignmentSchema)