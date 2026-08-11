import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'
import { isSecureAuthCookie } from '@/lib/auth-cookie'

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isSecureAuthCookie(request),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
