export function isMacPlatform(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }
  const nav = navigator as any
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || ''
  return /Mac|iPhone|iPod|iPad/i.test(platform)
}

export function getModifierKey(): string {
  return isMacPlatform() ? 'Cmd' : 'Ctrl'
}

export function getModifierSymbol(): string {
  return isMacPlatform() ? '⌘' : 'Ctrl'
}

export function getRunShortcut(): string {
  return isMacPlatform() ? 'Cmd+Enter' : 'Ctrl+Enter'
}

export function getFormatShortcut(): string {
  return isMacPlatform() ? 'Cmd+Shift+F' : 'Ctrl+Shift+F'
}
