import './env.js'
import express from 'express'
import cors from 'cors'
import { connectSandboxDB, sandboxPool } from './config/db.postgres.js'
import { connectPersistenceDB } from './config/db.mongo.js'
import assignmentRoutes from './routes/assignmentRouter.js'
import executionRoutes from './routes/executionRouter.js'
import hintRoutes from './routes/hintRouter.js'
import profileRoutes from './routes/profileRouter.js'
import adminRoutes from './routes/adminRouter.js'
import mongoose from 'mongoose'
import { globalLimiter } from './middleware/rateLimiter.js'
import { logger, distributedTracingMiddleware } from './utils/logger.js'
import { formatPrometheusMetrics } from './services/metricsService.js'
import { handleJsonRpcMessage } from './mcp/mcpServer.js'

const app = express()
const PORT = Number(process.env.PORT) || 6000

app.set('trust proxy', 1)

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

app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'active',
    timestamp: new Date().toISOString(),
  })
})

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

app.use(globalLimiter)

app.use('/api/assignments', assignmentRoutes)
app.use('/api/query', executionRoutes)
app.use('/api/hints', hintRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/admin', adminRoutes)

app.post('/api/mcp', async (req, res) => {
  try {
    const response = await handleJsonRpcMessage(req.body)
    if (!response) {
      res.status(204).end()
      return
    }
    res.status(200).json(response)
  } catch (err) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: { code: -32603, message: err instanceof Error ? err.message : String(err) },
    })
  }
})

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
}

startServer().catch((err) => {
  logger.error('Server startup failed', { event: 'startup_failure', error: String(err) })
  process.exit(1)
})