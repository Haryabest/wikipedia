'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { SearchForm } from './SearchForm'
import { HeaderSocialLinks } from './HeaderSocialLinks'
import { WikiImage } from './WikiImage'
import { SITE_BRAND_NAME, SITE_BRAND_SUBTITLE } from '@/lib/site-brand'
import { isSocialLinkComplete } from '@/lib/social-links'
import type { SocialLinkItem } from '@/lib/social-links'
import styles from './SiteHeader.module.css'

interface SiteHeaderProps {
  siteName?: string
  siteSubtitle?: string | null
  logoUrl?: string | null
  socialLinks?: SocialLinkItem[]
  showSearch?: boolean
}

export function SiteHeader({
  siteName = SITE_BRAND_NAME,
  siteSubtitle = SITE_BRAND_SUBTITLE,
  logoUrl,
  socialLinks = [],
  showSearch = true,
}: SiteHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  const displayName = siteName?.trim() || SITE_BRAND_NAME
  const displaySubtitle = siteSubtitle?.trim() || SITE_BRAND_SUBTITLE
  const hasLogo = Boolean(logoUrl?.trim())
  const hasLinks = socialLinks.some(isSocialLinkComplete)

  useEffect(() => {
    if (!searchOpen) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSearchOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [searchOpen])

  const branding = (
    <Link href="/" className={styles.branding}>
      <span className={styles.brandTitle}>{displayName}</span>
      <span className={styles.brandSubtitle}>{displaySubtitle}</span>
    </Link>
  )

  const logoLink = hasLogo ? (
    <Link href="/" className={styles.logoLink} aria-label={displayName}>
      <WikiImage src={logoUrl!} alt="" className={styles.logoImg} />
    </Link>
  ) : null

  return (
    <header className="page-header">
      <div className={`container ${styles.inner}`}>
        <div className={styles.desktop}>
          <div className={styles.leftCluster}>
            {logoLink}
            {hasLinks && <HeaderSocialLinks links={socialLinks} />}
          </div>

          <div className={styles.brandingWrap}>{branding}</div>

          <div className={styles.searchRight}>
            {showSearch && <SearchForm />}
          </div>
        </div>

        <div className={styles.mobile}>
          <div className={styles.mobileLeft}>
            {logoLink}
            {hasLinks && <HeaderSocialLinks links={socialLinks} />}
          </div>

          <div className={styles.mobileBrand}>{branding}</div>

          <div className={styles.mobileActions}>
            {showSearch && (
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setSearchOpen((open) => !open)}
                aria-label={searchOpen ? 'Скрыть поиск' : 'Поиск'}
                aria-expanded={searchOpen}
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
            )}
          </div>
        </div>

        {searchOpen && showSearch && (
          <div className={styles.mobileSearch}>
            <SearchForm />
          </div>
        )}
      </div>
    </header>
  )
}
