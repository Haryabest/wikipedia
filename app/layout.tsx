import type { Metadata } from 'next'
import { ConditionalFooter } from '@/components/ConditionalFooter'
import { buildRootMetadata } from '@/lib/site-metadata'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata()
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta name="referrer" content="no-referrer" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="site-body">
        <div className="site-shell">
          {children}
        </div>
        <ConditionalFooter />
      </body>
    </html>
  )
}
