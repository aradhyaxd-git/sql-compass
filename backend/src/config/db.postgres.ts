import pg from 'pg'

const { Pool } = pg

export const sandboxPool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export const connectSandboxDB = async (): Promise<void> => {
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error('NEON_DATABASE_URL is not set in environment variables')
  }

  try {
    const client = await sandboxPool.connect()
    await client.query('SELECT 1')
    client.release()
    console.log('[Postgres] Neon sandbox connected')
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[Postgres] Connection error: ${msg}`)
    process.exit(1)
  }
}