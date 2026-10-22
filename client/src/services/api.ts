import axios from 'axios'

const TOKEN_KEY = 'sqlcompass_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let currentToken: string | null = null

export function setAuthToken(token: string | null) {
  currentToken = token
}

api.interceptors.request.use(async (config) => {
  const token = currentToken || localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        // If an authenticated request fails with 401, clear invalid token
        localStorage.removeItem(TOKEN_KEY)
        currentToken = null
      }
    }
    return Promise.reject(error)
  }
)

export default api