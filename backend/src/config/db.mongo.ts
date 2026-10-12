import '../env.js'
import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

export const connectPersistenceDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : undefined

  if (!uri) {
    throw new Error('MONGO_URI is not set in environment variables')
  }

  try {
    const conn = await mongoose.connect(uri)
    logger.info(`MongoDB connected: ${conn.connection.host}`, {
      event: 'mongodb_connected',
      host: conn.connection.host,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error(`MongoDB connection error: ${msg}`, {
      event: 'mongodb_connection_error',
      error: msg,
    })
    process.exit(1)
  }
}