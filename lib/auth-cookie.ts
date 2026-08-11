/** Secure auth cookies only when the public site URL is HTTPS (or request is proxied as HTTPS). */
export function isSecureAuthCookie(request?: Request): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl?.startsWith('https://')) return true
  if (request) {
    const proto = request.headers.get('x-forwarded-proto')
    if (proto === 'https') return true
  }
  return false
}
