const ALLOW_HTTP = process.env.NODE_ENV !== 'production'

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim())
    if (parsed.protocol === 'https:') return true
    if (ALLOW_HTTP && parsed.protocol === 'http:') return true
    return false
  } catch {
    return false
  }
}

export function isSafeRelativePath(path: string): boolean {
  const trimmed = path.trim()
  return trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')
}

/** Внешние https/http или безопасные relative пути */
export function sanitizeExternalUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  if (isSafeRelativePath(trimmed)) return trimmed
  return isSafeHttpUrl(trimmed) ? trimmed : null
}

/** URL картинок: relative, /api/media, или https */
export function sanitizeMediaUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null
  const trimmed = url.trim()
  if (trimmed.startsWith('/')) {
    if (isSafeRelativePath(trimmed)) return trimmed
    return null
  }
  return isSafeHttpUrl(trimmed) ? trimmed : null
}
