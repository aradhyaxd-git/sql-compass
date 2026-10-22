import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { SlidingWindowMemoryStore } from '../utils/slidingWindowStore.js'

const rateLimitResponse = (message: string) => ({
  success: false,
  message,
})

const GLOBAL_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
export const globalLimiter = rateLimit({
  windowMs: GLOBAL_WINDOW_MS,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new SlidingWindowMemoryStore(GLOBAL_WINDOW_MS),
  message: rateLimitResponse('Too many requests. Please slow down and try again shortly.'),
})

const QUERY_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
export const queryLimiter = rateLimit({
  windowMs: QUERY_WINDOW_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: new SlidingWindowMemoryStore(QUERY_WINDOW_MS),
  keyGenerator: (req) => req.userId || ipKeyGenerator(req.ip || ''),
  message: rateLimitResponse('Query execution limit reached. Wait a few minutes before running more queries.'),
})

const HINT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
export const hintLimiter = rateLimit({
  windowMs: HINT_WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new SlidingWindowMemoryStore(HINT_WINDOW_MS),
  keyGenerator: (req) => req.userId || ipKeyGenerator(req.ip || ''),
  message: rateLimitResponse('Hint limit reached. Take a moment to work through the problem, then try again.'),
})