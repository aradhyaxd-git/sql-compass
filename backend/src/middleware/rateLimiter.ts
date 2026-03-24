import rateLimit from 'express-rate-limit'

const rateLimitResponse = (message: string) => ({
  success: false,
  message,
})

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,       
  legacyHeaders: false,
  message: rateLimitResponse('Too many requests. Please slow down and try again shortly.'),
})

export const queryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,    
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Query execution limit reached. Wait a few minutes before running more queries.'),
})

export const hintLimiter = rateLimit({
  windowMs: 10*60*1000,  
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse('Hint limit reached. Take a moment to work through the problem, then try again.'),
})