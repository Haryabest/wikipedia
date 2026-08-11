export function resolveSiteUrl(raw: string | null | undefined): string {
  const fallback = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
  const value = raw?.trim() || fallback
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return fallback.replace(/\/$/, '')
    }
    return value.replace(/\/$/, '')
  } catch {
    return fallback.replace(/\/$/, '')
  }
}
