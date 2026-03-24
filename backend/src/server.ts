import './env.js'
import express from 'express'
import cors from 'cors'
import { connectSandboxDB } from './config/db.postgres.js'
import { connectPersistenceDB } from './config/db.mongo.js'
import assignmentRoutes from './routes/assignmentRouter.js'
import executionRoutes from './routes/executionRouter.js'
import hintRoutes from './routes/hintRouter.js'
import profileRoutes from './routes/profileRouter.js'
import { globalLimiter } from './middleware/rateLimiter.js'


const app = express()
const PORT = Number(process.env.PORT) || 5000

const allowedOrigins = [
  process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  'http://localhost:5173',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`))
      }
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '50kb' }))
app.use(globalLimiter)
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'active',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/assignments', assignmentRoutes)
app.use('/api/query', executionRoutes)   // has queryLimiter inside router
app.use('/api/hints',hintRoutes)        // has hintLimiter inside router
app.use('/api/profile', profileRoutes)

app.use((_, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

const startServer = async (): Promise<void> => {
  await connectSandboxDB()
  await connectPersistenceDB()

  const server = app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`)
    console.log(`[Server] ENV: ${process.env.NODE_ENV ?? 'development'}`)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] Port ${PORT} is already in use`)
      process.exit(1)
    }
    throw err
  })
}

startServer().catch(err => {
  console.error('[Server] Startup failed:', err)
  process.exit(1)
})