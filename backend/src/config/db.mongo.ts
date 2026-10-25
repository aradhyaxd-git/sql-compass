import '../env.js'
import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

export const connectPersistenceDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : undefined

  if (!uri) {
    const errorMsg = 'MONGO_URI is not set in environment variables'
    console.error(`[FATAL] ${errorMsg}`)
    throw new Error(errorMsg)
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    })
    console.log(`[INFO] MongoDB connected: ${conn.connection.host}`)
    logger.info(`MongoDB connected: ${conn.connection.host}`, {
      event: 'mongodb_connected',
      host: conn.connection.host,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[FATAL] MongoDB connection error: ${msg}`)
    if (msg.includes('MongooseServerSelectionError') || msg.includes('timed out') || msg.includes('ETIMEDOUT')) {
      console.error(
        '[FATAL TIP] Check your MongoDB Atlas Network Access IP Access List. Ensure 0.0.0.0/0 is whitelisted for Render dynamic IPs.'
      )
    }
    logger.error(`MongoDB connection error: ${msg}`, {
      event: 'mongodb_connection_error',
      error: msg,
    })
    throw error
  }
}