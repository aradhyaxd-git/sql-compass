import type { Store, Options, IncrementResponse, ClientRateLimitInfo } from 'express-rate-limit'

/**
 * In-Memory Sliding Window Log Store for express-rate-limit.
 *
 * Rather than a fixed window counter that resets abruptly at boundary intervals
 * (which permits 2x burst traffic across window boundaries), this store maintains
 * a chronological log of request timestamps per client key and purges timestamps
 * older than (now - windowMs).
 */
export class SlidingWindowMemoryStore implements Store {
  windowMs: number
  localKeys: boolean = true
  private hits = new Map<string, number[]>()
  private interval?: NodeJS.Timeout

  constructor(windowMs?: number) {
    this.windowMs = windowMs || 60 * 1000
    // Periodic garbage collection every 60 seconds
    this.interval = setInterval(() => this.cleanup(), 60 * 1000)
    if (this.interval.unref) {
      this.interval.unref()
    }
  }

  init(options: Options): void {
    if (options.windowMs) {
      this.windowMs = options.windowMs
    }
  }

  private prune(timestamps: number[], threshold: number): number[] {
    let startIndex = 0
    while (startIndex < timestamps.length && timestamps[startIndex] < threshold) {
      startIndex++
    }
    return startIndex === 0 ? timestamps : timestamps.slice(startIndex)
  }

  private cleanup(): void {
    const now = Date.now()
    const threshold = now - this.windowMs
    for (const [key, timestamps] of this.hits.entries()) {
      const active = this.prune(timestamps, threshold)
      if (active.length === 0) {
        this.hits.delete(key)
      } else {
        this.hits.set(key, active)
      }
    }
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const now = Date.now()
    const threshold = now - this.windowMs
    const timestamps = this.hits.get(key)
    if (!timestamps) return undefined

    const active = this.prune(timestamps, threshold)
    if (active.length === 0) {
      this.hits.delete(key)
      return undefined
    }

    this.hits.set(key, active)
    return {
      totalHits: active.length,
      resetTime: new Date(active[0] + this.windowMs),
    }
  }

  async increment(key: string): Promise<IncrementResponse> {
    const now = Date.now()
    const threshold = now - this.windowMs
    const existing = this.hits.get(key) || []
    const active = this.prune(existing, threshold)

    active.push(now)
    this.hits.set(key, active)

    return {
      totalHits: active.length,
      resetTime: new Date(active[0] + this.windowMs),
    }
  }

  async decrement(key: string): Promise<void> {
    const timestamps = this.hits.get(key)
    if (timestamps && timestamps.length > 0) {
      timestamps.pop()
      if (timestamps.length === 0) {
        this.hits.delete(key)
      }
    }
  }

  async resetKey(key: string): Promise<void> {
    this.hits.delete(key)
  }

  async resetAll(): Promise<void> {
    this.hits.clear()
  }

  shutdown(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = undefined
    }
    this.hits.clear()
  }
}
