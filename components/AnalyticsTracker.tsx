'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { trackAnalytics } from '@/lib/analytics-client'

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    trackAnalytics('pageview', pathname)
  }, [pathname])

  useEffect(() => {
    if (pathname.startsWith('/admin')) return

    function onClick(e: MouseEvent) {
      const el = (e.target as Element).closest('a')
      if (!el?.href) return

      const url = new URL(el.href, window.location.origin)
      const currentPath = window.location.pathname

      if (url.origin !== window.location.origin) {
        trackAnalytics('outbound', currentPath, url.href)
      } else if (el.pathname !== currentPath) {
        trackAnalytics('click', currentPath, `${el.pathname}${url.search}`)
      }
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [pathname])

  return null
}
