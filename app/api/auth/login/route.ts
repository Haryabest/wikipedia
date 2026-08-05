import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { COOKIE_NAME, createSessionToken } from '@/lib/auth'
import { getClientIp, rateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { allowed } = rateLimit(`login:${ip}`, 10, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Слишком много попыток' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Неверный формат' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Неверные данные' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
  }

  const token = await createSessionToken({ userId: user.id, email: user.email })
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
