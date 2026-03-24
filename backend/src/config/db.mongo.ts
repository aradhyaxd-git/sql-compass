import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectPersistenceDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    throw new Error('MONGO_URI is not set in environment variables')
  }

  try {
    const conn = await mongoose.connect(uri)
    console.log(`[MongoDB] Connected: ${conn.connection.host}`)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[MongoDB] Connection error: ${msg}`)
    process.exit(1)
  }
}