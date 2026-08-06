import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'wiki_admin_token'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isApiRoute = pathname.startsWith('/api')

  if (pathname.startsWith('/admin') && !isAdminSubdomain && process.env.NODE_ENV === 'production') {
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

  if (isAdminArea && !isLoginPage && !request.cookies.get(ADMIN_COOKIE)?.value) {
    const url = request.nextUrl.clone()
    url.pathname = isAdminSubdomain ? '/login' : '/admin/login'
    url.search = ''
    return NextResponse.redirect(url)
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
