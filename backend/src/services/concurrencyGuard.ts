interface SlotAcquisition {
  allowed: boolean
  activeCount: number
  release: () => void
}

const activeSlots = new Map<string, number>()
const MAX_CONCURRENT_PER_USER = 1

export function acquireExecutionSlot(key: string): SlotAcquisition {
  const current = activeSlots.get(key) || 0

  if (current >= MAX_CONCURRENT_PER_USER) {
    return {
      allowed: false,
      activeCount: current,
      release: () => {},
    }
  }

  activeSlots.set(key, current + 1)

  let released = false
  const release = () => {
    if (released) return
    released = true
    const count = activeSlots.get(key) || 1
    if (count <= 1) {
      activeSlots.delete(key)
    } else {
      activeSlots.set(key, count - 1)
    }
  }

  return {
    allowed: true,
    activeCount: current + 1,
    release,
  }
}

export function getActiveExecutionCount(): number {
  let total = 0
  for (const count of activeSlots.values()) {
    total += count
  }
  return total
}

export function clearAllExecutionSlots(): void {
  activeSlots.clear()
}
