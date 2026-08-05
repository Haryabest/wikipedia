import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl
  const isAdminSubdomain = hostname.startsWith('admin.')

  if (isAdminSubdomain && !pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  if (pathname.startsWith('/admin') && !isAdminSubdomain && process.env.NODE_ENV === 'production') {
    const adminHost = hostname.replace(/^(www\.)?/, 'admin.')
    if (!hostname.startsWith('admin.')) {
      return NextResponse.redirect(new URL(pathname, `https://${adminHost}`))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
}
