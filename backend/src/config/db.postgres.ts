import '../env.js'
import pg from 'pg'
import { logger } from '../utils/logger.js'

const { Pool } = pg

const rawUrl = process.env.SANDBOX_RO_URL || process.env.NEON_DATABASE_URL
const connectionString = rawUrl ? rawUrl.trim() : undefined

const isLocalhost = connectionString ? /localhost|127\.0\.0\.1/.test(connectionString) : false
const isSslDisabled = connectionString ? connectionString.includes('sslmode=disable') : false
const sslConfig = isLocalhost || isSslDisabled ? false : { rejectUnauthorized: false }

export const sandboxPool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export const connectSandboxDB = async (): Promise<void> => {
  if (!connectionString) {
    throw new Error('Neither SANDBOX_RO_URL nor NEON_DATABASE_URL is set in environment variables')
  }

  try {
    const client = await sandboxPool.connect()
    await client.query('SELECT 1')
    client.release()
    logger.info('Neon sandbox connected successfully', {
      event: 'postgres_connected',
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error(`Postgres connection error: ${msg}`, {
      event: 'postgres_connection_error',
      error: msg,
    })
    process.exit(1)
  }
}