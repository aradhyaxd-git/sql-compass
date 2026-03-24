import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

// Token holder - will be set by App.tsx when Clerk auth is ready
let currentToken: string | null = null
let getTokenFn: (() => Promise<string | null>) | null = null

export function setAuthToken(token: string | null) {
  currentToken = token
}

export function setGetTokenFn(fn: (() => Promise<string | null>) | null) {
  getTokenFn = fn
}

// Request interceptor to attach Clerk token on every request
api.interceptors.request.use(async (config) => {
  try {
    let token = null
    if (getTokenFn) {
      try {
        token = await getTokenFn()
        if (token) {
          config.headers = config.headers ?? {}
          config.headers.Authorization = `Bearer ${token}`
          return config
        }
      } catch (err) {
        // token fetch failed, try fallback
      }
    }
    
    // Fall back to stored token if fresh fetch fails
    if (!token && currentToken) {
      token = currentToken
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
      return config
    }
  } catch (err) {
    // silently handle interceptor errors
  }

  return config
})

export default api