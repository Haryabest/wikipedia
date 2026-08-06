import { headers } from 'next/headers'
import { SiteFooter } from './SiteFooter'

export async function ConditionalFooter() {
  const pathname = (await headers()).get('x-pathname') ?? ''

  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return null
  }

  return <SiteFooter />
}
