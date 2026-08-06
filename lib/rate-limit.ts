const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function cleanupExpired(now: number) {
  if (rateLimitMap.size < 1000) return
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key)
  }
}

export function rateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  cleanupExpired(now)
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    'unknown'
  )
}
