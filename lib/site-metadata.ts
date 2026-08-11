import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/data'
import { normalizeMediaUrl } from '@/lib/media-url'
import { SITE_BRAND_SUBTITLE } from '@/lib/site-brand'
import { resolveSiteUrl } from '@/lib/site-url'

export async function buildRootMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings.siteName
  const siteUrl = resolveSiteUrl(settings.siteUrl)
  const description = settings.siteSubtitle?.trim() || SITE_BRAND_SUBTITLE
  const icon =
    normalizeMediaUrl(settings.faviconUrl) ??
    normalizeMediaUrl(settings.emblemUrl) ??
    '/icon.svg'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s — ${siteName}`,
    },
    description,
    applicationName: siteName,
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: { email: false, telephone: false },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName,
      url: siteUrl,
      title: siteName,
      description,
    },
    twitter: { card: 'summary_large_image', title: siteName, description },
    alternates: { canonical: siteUrl },
    icons: {
      icon: [{ url: icon, type: icon.endsWith('.svg') ? 'image/svg+xml' : undefined }],
      shortcut: icon,
      apple: icon,
    },
    other: { 'content-language': 'ru' },
  }
}
