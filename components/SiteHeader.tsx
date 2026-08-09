import Link from 'next/link'
import { SearchForm } from './SearchForm'
import { SocialLinks } from './SocialLinks'
import { normalizeMediaUrl } from '@/lib/media-url'
import type { SocialLinkItem } from '@/lib/social-links'

interface SiteHeaderProps {
  siteName: string
  logoUrl?: string | null
  socialLinks?: SocialLinkItem[]
  showSearch?: boolean
}

export function SiteHeader({ siteName, logoUrl, socialLinks = [], showSearch = true }: SiteHeaderProps) {
  return (
    <header className="page-header">
      <div className="container page-header__inner">
        <div className="page-header__side page-header__side--start">
          <Link href="/" className="logo" aria-label={siteName}>
            {logoUrl ? (
              <>
                <img src={normalizeMediaUrl(logoUrl) ?? logoUrl} alt={siteName} className="logo__img" />
                <span className="sr-only">{siteName}</span>
              </>
            ) : (
              <>
                <span className="logo__fallback" aria-hidden>
                  {siteName.trim()[0]?.toUpperCase() ?? 'W'}
                </span>
                {siteName}
              </>
            )}
          </Link>
        </div>

        <div className="page-header__social">
          <SocialLinks links={socialLinks} variant="header" />
        </div>

        <div className="page-header__side page-header__side--end">
          {showSearch && <SearchForm />}
        </div>
      </div>
    </header>
  )
}
