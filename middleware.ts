import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { JWT_AUDIENCE, JWT_ISSUER } from '@/lib/auth-constants'

const ADMIN_COOKIE = 'wiki_admin_token'
const MAX_SEARCH_QUERY_LENGTH = 120

async function isValidAdminToken(token: string): Promise<boolean> {
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    return true
  } catch {
    return false
  }
}

function isBareIpOrLocalHost(hostname: string): boolean {
  const host = hostname.split(':')[0]
  if (host === 'localhost' || host === '127.0.0.1') return true
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isApiRoute = pathname.startsWith('/api')

  if (
    pathname.startsWith('/admin') &&
    !isAdminSubdomain &&
    process.env.NODE_ENV === 'production' &&
    !isBareIpOrLocalHost(hostname)
  ) {
    const adminHost = hostname.replace(/^(www\.)?/, 'admin.')
    return NextResponse.redirect(new URL(pathname, `https://${adminHost}`))
  }

  if (isAdminSubdomain && !pathname.startsWith('/admin') && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  const effectivePathname =
    isAdminSubdomain && !pathname.startsWith('/admin') && !isApiRoute
      ? `/admin${pathname === '/' ? '' : pathname}`
      : pathname
  const isAdminArea = effectivePathname.startsWith('/admin')
  const isLoginPage = effectivePathname === '/admin/login'

  if (pathname.startsWith('/search')) {
    const q = request.nextUrl.searchParams.get('q')
    if (q && q.length > MAX_SEARCH_QUERY_LENGTH) {
      const url = request.nextUrl.clone()
      url.searchParams.set('q', q.slice(0, MAX_SEARCH_QUERY_LENGTH))
      return NextResponse.redirect(url)
    }
  }

  if (isAdminArea && !isLoginPage) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value
    if (!token || !(await isValidAdminToken(token))) {
      const url = request.nextUrl.clone()
      url.pathname = isAdminSubdomain ? '/login' : '/admin/login'
      url.search = ''
      const response = NextResponse.redirect(url)
      if (token) {
        response.cookies.delete(ADMIN_COOKIE)
      }
      return response
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
}
