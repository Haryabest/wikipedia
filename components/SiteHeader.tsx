import Link from 'next/link'
import { SearchForm } from './SearchForm'

interface SiteHeaderProps {
  siteName: string
  logoUrl?: string | null
  showSearch?: boolean
}

export function SiteHeader({ siteName, logoUrl, showSearch = true }: SiteHeaderProps) {
  return (
    <header className="page-header">
      <div className="container page-header__inner">
        <Link href="/" className="logo">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="logo__img" />
          ) : (
            <span className="logo__img" style={{ background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', fontSize: 18 }}>
              W
            </span>
          )}
          {siteName}
        </Link>
        {showSearch && <SearchForm />}
      </div>
    </header>
  )
}
