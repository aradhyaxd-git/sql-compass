import './env.js'
import express from 'express'
import cors from 'cors'
import { connectSandboxDB } from './config/db.postgres.js'
import { connectPersistenceDB } from './config/db.mongo.js'
import assignmentRoutes from './routes/assignmentRouter.js'
import executionRoutes from './routes/executionRouter.js'
import hintRoutes from './routes/hintRouter.js'
import profileRoutes from './routes/profileRouter.js'
import adminRoutes from './routes/adminRouter.js'
import { sandboxPool } from './config/db.postgres.js'
import mongoose from 'mongoose'
import { globalLimiter } from './middleware/rateLimiter.js'
import { logger, distributedTracingMiddleware } from './utils/logger.js'

const app = express()
const PORT = Number(process.env.PORT) || 5000

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
].filter(Boolean) as string[]

const isProduction = process.env.NODE_ENV === 'production'

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !isProduction || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`))
      }
    },
    credentials: true,
  })
)

app.use(distributedTracingMiddleware)
app.use(express.json({ limit: '50kb' }))
app.use(globalLimiter)
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'active',
    timestamp: new Date().toISOString(),
  })
})

app.get('/health/deep', async (_, res) => {
  const checks: Record<string, string> = {
    postgres: 'unknown',
    mongodb: 'unknown',
    server: 'ok',
  }

  try {
    const pgClient = await sandboxPool.connect()
    await pgClient.query('SELECT 1')
    pgClient.release()
    checks.postgres = 'ok'
  } catch (pgErr) {
    checks.postgres = `error: ${pgErr instanceof Error ? pgErr.message : String(pgErr)}`
  }

  checks.mongodb = mongoose.connection.readyState === 1 ? 'ok' : 'disconnected'

  const allOk = checks.postgres === 'ok' && checks.mongodb === 'ok'
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/assignments', assignmentRoutes)
app.use('/api/query', executionRoutes)   // has queryLimiter inside router
app.use('/api/hints', hintRoutes)        // has hintLimiter inside router
app.use('/api/profile', profileRoutes)
app.use('/api/admin', adminRoutes)

app.use((_, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled express exception', {
    event: 'unhandled_error',
    error: err.message,
    stack: err.stack,
  })
  res.status(500).json({ success: false, message: 'Internal server error' })
})

const startServer = async (): Promise<void> => {
  await connectSandboxDB()
  await connectPersistenceDB()

  const server = app.listen(PORT, () => {
    logger.info(`Server started and listening on port ${PORT}`, {
      event: 'server_start',
      port: PORT,
      env: process.env.NODE_ENV ?? 'development',
    })
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use`, { event: 'server_error', code: err.code })
      process.exit(1)
    }
    throw err
  })
}

startServer().catch((err) => {
  logger.error('Server startup failed', { event: 'startup_failure', error: String(err) })
  process.exit(1)
})