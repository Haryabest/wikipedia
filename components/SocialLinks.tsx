import Link from 'next/link'
import { SocialBrandIcon } from './SocialBrandIcon'
import { isSocialLinkComplete } from '@/lib/social-links'
import type { SocialLinkItem } from '@/lib/social-links'
import styles from './SocialLinks.module.css'

interface SocialLinksProps {
  links: SocialLinkItem[]
  variant?: 'default' | 'header' | 'footer'
}

export function SocialLinks({ links, variant = 'default' }: SocialLinksProps) {
  const visible = links.filter(isSocialLinkComplete)
  if (visible.length === 0) return null

  const rowClass =
    variant === 'header'
      ? `${styles.row} ${styles.rowHeader}`
      : variant === 'footer'
        ? `${styles.row} ${styles.rowFooter}`
        : styles.row

  const itemClass =
    variant === 'header'
      ? `${styles.item} ${styles.itemHeader}`
      : variant === 'footer'
        ? `${styles.item} ${styles.itemFooter}`
        : styles.item

  const iconSize = variant === 'header' ? 'sm' : variant === 'footer' ? 'md' : 'lg'

  return (
    <div className={rowClass} aria-label="Социальные сети">
      {visible.map((link, i) => (
        <Link
          key={`${link.url}-${i}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={itemClass}
          title={link.label || 'Социальная сеть'}
        >
          <SocialBrandIcon
            iconFile={link.iconFile}
            imageUrl={link.imageUrl}
            label={link.label}
            size={iconSize}
            className={styles.icon}
          />
        </Link>
      ))}
    </div>
  )
}
