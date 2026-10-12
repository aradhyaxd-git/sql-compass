import crypto from 'node:crypto'

export interface CachedHint {
  hint: string
  level: 1 | 2 | 3
  errorClass?: string | null
  concept?: string | null
  cachedAt: number
  expiresAt: number
}

const DEFAULT_TTL_SECONDS = 600 // 10 minutes
const MAX_CACHE_ENTRIES = 500

class HintCacheService {
  private cache = new Map<string, CachedHint>()
  private hits = 0
  private misses = 0

  private getTTL(): number {
    const envTtl = Number(process.env.HINT_CACHE_TTL_SECONDS)
    return !Number.isNaN(envTtl) && envTtl > 0 ? envTtl : DEFAULT_TTL_SECONDS
  }

  public computeKey(assignmentId: string, query: string, level: number): string {
    const normalizedQuery = (query || '').trim().toLowerCase().replace(/\s+/g, ' ')
    const hash = crypto.createHash('sha256').update(normalizedQuery).digest('hex').substring(0, 16)
    return `${assignmentId}:${level}:${hash}`
  }

  public get(assignmentId: string, query: string, level: number): CachedHint | null {
    const key = this.computeKey(assignmentId, query, level)
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.misses++
      return null
    }

    this.hits++
    return entry
  }

  public set(
    assignmentId: string,
    query: string,
    level: 1 | 2 | 3,
    data: { hint: string; errorClass?: string | null; concept?: string | null }
  ): void {
    if (this.cache.size >= MAX_CACHE_ENTRIES) {
      const now = Date.now()
      for (const [k, v] of this.cache.entries()) {
        if (now > v.expiresAt) {
          this.cache.delete(k)
        }
      }
      if (this.cache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = this.cache.keys().next().value
        if (oldestKey) this.cache.delete(oldestKey)
      }
    }

    const key = this.computeKey(assignmentId, query, level)
    const now = Date.now()
    const ttlMs = this.getTTL() * 1000

    this.cache.set(key, {
      hint: data.hint,
      level,
      errorClass: data.errorClass,
      concept: data.concept,
      cachedAt: now,
      expiresAt: now + ttlMs,
    })
  }

  public getStats() {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: `${hitRate.toFixed(1)}%`,
    }
  }

  public clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }
}

export const hintCache = new HintCacheService()
