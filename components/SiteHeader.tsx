'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, Search, X } from 'lucide-react'
import { SearchForm } from './SearchForm'
import { SocialLinks } from './SocialLinks'
import { SITE_BRAND_NAME, SITE_BRAND_SUBTITLE } from '@/lib/site-brand'
import { isSocialLinkComplete } from '@/lib/social-links'
import type { SocialLinkItem } from '@/lib/social-links'
import styles from './SiteHeader.module.css'

interface SiteHeaderProps {
  siteName?: string
  siteSubtitle?: string | null
  socialLinks?: SocialLinkItem[]
  showSearch?: boolean
}

export function SiteHeader({
  siteName = SITE_BRAND_NAME,
  siteSubtitle = SITE_BRAND_SUBTITLE,
  socialLinks = [],
  showSearch = true,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const displayName = siteName?.trim() || SITE_BRAND_NAME
  const displaySubtitle = siteSubtitle?.trim() || SITE_BRAND_SUBTITLE

  const visibleLinks = socialLinks.filter(isSocialLinkComplete)
  const hasLinks = visibleLinks.length > 0

  useEffect(() => {
    if (!menuOpen && !searchOpen) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, searchOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  function closeAll() {
    setMenuOpen(false)
    setSearchOpen(false)
  }

  const branding = (
    <Link href="/" className={styles.branding} onClick={closeAll}>
      <span className={styles.brandTitle}>{displayName}</span>
      <span className={styles.brandSubtitle}>{displaySubtitle}</span>
    </Link>
  )

  return (
    <header className="page-header">
      <div className={`container ${styles.inner}`}>
        <div className={styles.desktop}>
          <div className={styles.linksLeft}>
            <SocialLinks links={socialLinks} variant="header" />
          </div>

          <div className={styles.brandingWrap}>{branding}</div>

          <div className={styles.searchRight}>
            {showSearch && <SearchForm />}
          </div>
        </div>

        <div className={styles.mobile}>
          {hasLinks && (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => {
                setMenuOpen((open) => !open)
                setSearchOpen(false)
              }}
              aria-label={menuOpen ? 'Закрыть ссылки' : 'Ссылки'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <div className={styles.mobileBrand}>{branding}</div>

          <div className={styles.mobileActions}>
            {showSearch && (
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => {
                  setSearchOpen((open) => !open)
                  setMenuOpen(false)
                }}
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

      {menuOpen && hasLinks && (
        <>
          <button
            type="button"
            className={styles.backdrop}
            onClick={() => setMenuOpen(false)}
            aria-label="Закрыть"
          />
          <div className={styles.drawer} role="dialog" aria-label="Ссылки">
            <p className={styles.drawerTitle}>Ссылки</p>
            <SocialLinks links={socialLinks} variant="drawer" />
          </div>
        </>
      )}
    </header>
  )
}
