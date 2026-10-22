import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  name: string
  picture?: string
  googleId?: string
  passwordHash?: string
  role: 'user' | 'admin'
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  twoFactorTempSecret?: string
  lastTotpUsed?: string
  passwordResetTokenHash?: string
  passwordResetExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorTempSecret: {
      type: String,
      select: false,
    },
    lastTotpUsed: {
      type: String,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
      index: true,
      sparse: true,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model<IUser>('User', userSchema)
