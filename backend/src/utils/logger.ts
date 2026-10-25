import winston from 'winston'
import { AsyncLocalStorage } from 'node:async_hooks'
import crypto from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'

export interface TraceContextData {
  requestId: string
  correlationId?: string
  userId?: string
  route?: string
  method?: string
}

export const traceStorage = new AsyncLocalStorage<TraceContextData>()

const { combine, timestamp, printf, json, errors } = winston.format

const isProduction = process.env.NODE_ENV === 'production'

// Custom format that injects distributed trace context from AsyncLocalStorage
const distributedTraceFormat = winston.format((info) => {
  const context = traceStorage.getStore()
  if (context) {
    info.trace = {
      requestId: context.requestId,
      correlationId: context.correlationId || context.requestId,
      userId: context.userId || 'anonymous',
      route: context.route,
      method: context.method,
    }
  }
  return info
})

const consoleHumanFormat = printf((info) => {
  const { level, message, timestamp: time, event, latencyMs, ...meta } = info
  const trace = info.trace as TraceContextData | undefined
  const reqId = trace?.requestId ? `[req:${trace.requestId.slice(0, 8)}]` : ''
  const user = trace?.userId && trace.userId !== 'anonymous' ? `[user:${trace.userId}]` : ''
  const evt = event ? `[${event}]` : ''
  const lat = latencyMs !== undefined ? ` (${latencyMs}ms)` : ''
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
  return `${time} [${level.toUpperCase()}] ${reqId}${user}${evt}: ${message}${lat}${metaStr}`
})

const VALID_LOG_LEVELS = new Set(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])

function getLogLevel(): string {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase().trim()
  if (envLevel && VALID_LOG_LEVELS.has(envLevel)) {
    return envLevel
  }
  return isProduction ? 'info' : 'debug'
}

export const logger = winston.createLogger({
  level: getLogLevel(),
  format: combine(
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    errors({ stack: true }),
    distributedTraceFormat(),
    process.env.LOG_FORMAT === 'json' ? json() : consoleHumanFormat
  ),
  defaultMeta: {
    service: 'sql-compass-backend',
    env: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.Console(),
  ],
})

export const updateTraceUser = (userId: string): void => {
  const store = traceStorage.getStore()
  if (store) {
    store.userId = userId
  }
}

// Distributed tracing middleware: assigns or extracts Request IDs and populates AsyncLocalStorage
export const distributedTracingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingRequestId = (req.headers['x-request-id'] as string) || (req.headers['x-correlation-id'] as string)
  const requestId = incomingRequestId || crypto.randomUUID()
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId

  res.setHeader('X-Request-ID', requestId)
  res.setHeader('X-Correlation-ID', correlationId)

  const contextData: TraceContextData = {
    requestId,
    correlationId,
    userId: req.userId || 'anonymous',
    route: req.originalUrl || req.url,
    method: req.method,
  }

  traceStorage.run(contextData, () => {
    const startTime = Date.now()

    logger.debug('Inbound HTTP request received', {
      event: 'http_request_start',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    })

    res.on('finish', () => {
      const latencyMs = Date.now() - startTime
      const { statusCode } = res
      // Update userId if set during auth middleware
      if (req.userId && contextData.userId === 'anonymous') {
        contextData.userId = req.userId
      }

      const logPayload = {
        event: 'http_request_finish',
        method: req.method,
        url: req.originalUrl,
        statusCode,
        latencyMs,
        ip: req.ip,
      }

      if (statusCode >= 500) {
        logger.error(`HTTP request completed with server error [${statusCode}]`, logPayload)
      } else if (statusCode >= 400) {
        logger.warn(`HTTP request completed with client error [${statusCode}]`, logPayload)
      } else {
        logger.info(`HTTP request completed [${statusCode}]`, logPayload)
      }
    })

    next()
  })
}
