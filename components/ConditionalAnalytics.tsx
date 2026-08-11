import { headers } from 'next/headers'
import { AnalyticsTracker } from './AnalyticsTracker'

export async function ConditionalAnalytics() {
  const pathname = (await headers()).get('x-pathname') ?? ''

  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return null
  }

  return <AnalyticsTracker />
}
