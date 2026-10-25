import '../env.js'
import pg from 'pg'
import { logger } from '../utils/logger.js'

const { Pool } = pg

const isProduction = process.env.NODE_ENV === 'production'

const rawUrl = process.env.SANDBOX_RO_URL || process.env.NEON_DATABASE_URL
const connectionString = rawUrl ? rawUrl.trim() : undefined

if (isProduction && !process.env.SANDBOX_RO_URL && process.env.NEON_DATABASE_URL) {
  console.warn(
    '[SECURITY NOTICE] SANDBOX_RO_URL is not set. Falling back to NEON_DATABASE_URL. For production isolation, set SANDBOX_RO_URL to a read-only role.'
  )
}

const isLocalhost = connectionString ? /localhost|127\.0\.0\.1/.test(connectionString) : false
const isSslDisabled = connectionString ? connectionString.includes('sslmode=disable') : false

const sslConfig =
  isLocalhost || isSslDisabled
    ? false
    : {
        rejectUnauthorized: process.env.PG_REJECT_UNAUTHORIZED === 'true',
      }

export const sandboxPool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

export const connectSandboxDB = async (): Promise<void> => {
  if (!connectionString) {
    const errorMsg = 'Neither SANDBOX_RO_URL nor NEON_DATABASE_URL is set in environment variables'
    console.error(`[FATAL] ${errorMsg}`)
    throw new Error(errorMsg)
  }

  try {
    const client = await sandboxPool.connect()
    await client.query('SELECT 1')
    client.release()
    console.log('[INFO] Sandbox database connected successfully')
    logger.info('Sandbox database connected successfully', {
      event: 'postgres_connected',
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[FATAL] Postgres connection error: ${msg}`)
    logger.error(`Postgres connection error: ${msg}`, {
      event: 'postgres_connection_error',
      error: msg,
    })
    throw error
  }
}