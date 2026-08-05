import type { Metadata } from 'next'
import './globals.css'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Wiki'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s — ${siteName}`,
  },
  description: `${siteName} — информационная энциклопедия с статьями по категориям`,
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
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: siteUrl },
  other: { 'content-language': 'ru' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta name="referrer" content="no-referrer" />
        <link rel="preconnect" href={siteUrl} />
      </head>
      <body>{children}</body>
    </html>
  )
}
