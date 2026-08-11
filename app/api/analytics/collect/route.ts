import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { hashIp, parseUserAgent } from '@/lib/analytics'

const collectSchema = z.object({
  type: z.enum(['pageview', 'click', 'outbound']),
  path: z.string().min(1).max(500),
  target: z.string().max(500).optional().nullable(),
  sessionId: z.string().max(64).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { allowed } = rateLimit(`analytics:${ip}`, 120, 60_000)
  if (!allowed) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = collectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const data = parsed.data
  if (data.path.startsWith('/admin') || data.path.startsWith('/api')) {
    return NextResponse.json({ ok: true })
  }

  const ua = request.headers.get('user-agent') ?? ''
  const { deviceType, browser, os } = parseUserAgent(ua)
  const hostHeader = request.headers.get('host')?.split(':')[0]?.slice(0, 253) ?? null

  await prisma.analyticsEvent.create({
    data: {
      type: data.type,
      path: data.path.slice(0, 500),
      target: data.target?.slice(0, 500) ?? null,
      host: hostHeader,
      referrer: data.referrer?.slice(0, 500) ?? null,
      userAgent: ua.slice(0, 500),
      deviceType,
      browser,
      os,
      sessionId: data.sessionId?.slice(0, 64) ?? null,
      ipHash: ip !== 'unknown' ? hashIp(ip) : null,
    },
  })

  return NextResponse.json({ ok: true })
}
