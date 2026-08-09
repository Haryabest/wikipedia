const BUCKET = process.env.MINIO_BUCKET ?? 'wiki-images'

function isLocalMediaBase(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|minio)(:\d+)?(\/|$)/i.test(url)
}

/** Same-origin URL for MinIO objects (works through tunnels). */
export function getMediaProxyPath(key: string): string {
  return `/api/media/${key.replace(/^\//, '')}`
}

export function getPublicMediaUrl(key: string): string {
  const publicBase = process.env.MINIO_PUBLIC_URL?.replace(/\/$/, '')
  if (publicBase && !isLocalMediaBase(publicBase)) {
    return `${publicBase}/${BUCKET}/${key}`
  }
  return getMediaProxyPath(key)
}

/** Rewrite stored localhost MinIO URLs to the app proxy. */
export function normalizeMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('/')) return url

  try {
    const parsed = new URL(url)
    const local = isLocalMediaBase(parsed.origin)
    const prefix = `/${BUCKET}/`
    if (local && parsed.pathname.startsWith(prefix)) {
      return getMediaProxyPath(parsed.pathname.slice(prefix.length))
    }
  } catch {
    // not a URL — return as-is
  }

  return url
}

/** Rewrite img src in HTML (article body). */
export function normalizeMediaUrlsInHtml(html: string): string {
  return html.replace(/(<img\b[^>]*\ssrc=["'])([^"']+)(["'])/gi, (_m, before, src, after) => {
    const normalized = normalizeMediaUrl(src) ?? src
    return `${before}${normalized}${after}`
  })
}
