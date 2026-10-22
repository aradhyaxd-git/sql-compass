import mongoose, { Document, Schema } from 'mongoose'

export interface IAttempt extends Document {
  userId: string
  assignmentId: string    // Mongo Assignment _id
  assignmentTitle: string // denormalized for quick profile display
  query: string // the SQL the user ran
  status: 'success' | 'error'
  correct: boolean
  verdictReason?: string
  diffSummary?: Record<string, unknown>
  rowCount: number
  errorMessage?: string
  xpEarned: number
  executedAt: Date
}



const attemptSchema = new Schema<IAttempt>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    assignmentId: {
      type: String,
      required: true,
    },
    assignmentTitle: {
      type: String,
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'error'],
    },
    correct: {
      type: Boolean,
      default: false,
      index: true,
    },
    verdictReason: {
      type: String,
    },
    diffSummary: {
      type: Schema.Types.Mixed,
    },
    rowCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
)


attemptSchema.index({ userId: 1, assignmentId: 1, correct: 1 })
export default mongoose.model<IAttempt>('Attempt', attemptSchema)