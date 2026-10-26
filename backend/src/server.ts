import './env.js'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectSandboxDB, sandboxPool } from './config/db.postgres.js'
import { connectPersistenceDB } from './config/db.mongo.js'
import assignmentRoutes from './routes/assignmentRouter.js'
import executionRoutes from './routes/executionRouter.js'
import hintRoutes from './routes/hintRouter.js'
import profileRoutes from './routes/profileRouter.js'
import adminRoutes from './routes/adminRouter.js'
import authRoutes from './routes/authRouter.js'
import mongoose from 'mongoose'
import { globalLimiter } from './middleware/rateLimiter.js'
import { logger, distributedTracingMiddleware } from './utils/logger.js'
import { formatPrometheusMetrics } from './services/metricsService.js'

const app = express()
const PORT = Number(process.env.PORT) || 6000

app.set('trust proxy', 1)

const isProduction = process.env.NODE_ENV === 'production'

const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean)

const allowedOrigins = [
  ...configuredOrigins,
  !isProduction && 'http://localhost:5173',
  !isProduction && 'http://127.0.0.1:5173',
  !isProduction && 'http://localhost:5174',
  !isProduction && 'http://127.0.0.1:5174',
].filter(Boolean) as string[]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true)
        return
      }
      const normalized = origin.replace(/\/+$/, '')
      if (allowedOrigins.includes(normalized)) {
        callback(null, true)
        return
      }
      if (!isProduction) {
        try {
          const host = new URL(origin).hostname
          if (host === 'localhost' || host === '127.0.0.1') {
            callback(null, true)
            return
          }
        } catch {
          // invalid URL format
        }
      }
      callback(null, false)
    },
    credentials: true,
  })
)

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})

app.use(distributedTracingMiddleware)
app.use(express.json({ limit: '50kb' }))
app.use(cookieParser())

// Fast public liveness probe (no DB connection acquired)
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'active',
    timestamp: new Date().toISOString(),
  })
})

// Rate limit all operational and API endpoints
app.use(globalLimiter)

app.get('/metrics', (_, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  res.status(200).send(formatPrometheusMetrics())
})

app.get('/health/deep', async (_, res) => {
  const checks: Record<string, string> = {
    postgres: 'unknown',
    mongodb: 'unknown',
    server: 'ok',
  }

  let pgClient
  try {
    pgClient = await sandboxPool.connect()
    await pgClient.query('SELECT 1')
    checks.postgres = 'ok'
  } catch {
    checks.postgres = 'error'
  } finally {
    if (pgClient) {
      pgClient.release()
    }
  }

  checks.mongodb = mongoose.connection.readyState === 1 ? 'ok' : 'disconnected'

  const allOk = checks.postgres === 'ok' && checks.mongodb === 'ok'
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/query', executionRoutes)
app.use('/api/hints', hintRoutes)
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
    console.log(`[INFO] Server started and listening on port ${PORT}`)
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

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`, { event: 'shutdown_started' })
    server.close(async () => {
      try {
        await sandboxPool.end()
        await mongoose.disconnect()
        logger.info('Database connections closed', { event: 'shutdown_complete' })
        process.exit(0)
      } catch (err) {
        logger.error('Error during shutdown', { event: 'shutdown_error', error: String(err) })
        process.exit(1)
      }
    })
  }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection caught at process level', {
        event: 'unhandled_rejection',
        error: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      })
    })

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception caught at process level', {
        event: 'uncaught_exception',
        error: err.message,
        stack: err.stack,
      })
    })
  }

startServer().catch((err) => {
  console.error('[FATAL] Server startup failed:', err)
  logger.error('Server startup failed', { event: 'startup_failure', error: String(err) })
  setTimeout(() => process.exit(1), 500)
})