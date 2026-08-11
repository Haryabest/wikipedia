'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal } from 'lucide-react'
import { SocialBrandIcon } from './SocialBrandIcon'
import { isSocialLinkComplete } from '@/lib/social-links'
import type { SocialLinkItem } from '@/lib/social-links'
import styles from './HeaderSocialLinks.module.css'

const VISIBLE_COUNT = 3

interface HeaderSocialLinksProps {
  links: SocialLinkItem[]
}

export function HeaderSocialLinks({ links }: HeaderSocialLinksProps) {
  const visible = links.filter(isSocialLinkComplete)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  if (visible.length === 0) return null

  const primary = visible.slice(0, VISIBLE_COUNT)
  const overflow = visible.slice(VISIBLE_COUNT)

  return (
    <div className={styles.root} aria-label="Социальные сети">
      <div className={styles.row}>
        {primary.map((link, i) => (
          <Link
            key={`${link.url}-${i}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.item}
            title={link.label || 'Социальная сеть'}
          >
            <SocialBrandIcon
              iconFile={link.iconFile}
              imageUrl={link.imageUrl}
              label={link.label}
              size="sm"
            />
          </Link>
        ))}

        {overflow.length > 0 && (
          <div className={styles.menuWrap} ref={menuRef}>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Другие соцсети"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <div className={styles.menu} role="menu">
                {overflow.map((link, i) => (
                  <Link
                    key={`${link.url}-more-${i}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.menuItem}
                    role="menuitem"
                    title={link.label || 'Социальная сеть'}
                    onClick={() => setMenuOpen(false)}
                  >
                    <SocialBrandIcon
                      iconFile={link.iconFile}
                      imageUrl={link.imageUrl}
                      label={link.label}
                      size="sm"
                    />
                    {link.label && <span className={styles.menuLabel}>{link.label}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
