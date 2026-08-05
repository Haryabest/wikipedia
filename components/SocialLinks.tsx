import Link from 'next/link'
import { WikiImage } from './WikiImage'
import styles from './SocialLinks.module.css'

export interface SocialLinkItem {
  imageUrl: string
  url: string
  label?: string
}

interface SocialLinksProps {
  links: SocialLinkItem[]
}

export function SocialLinks({ links }: SocialLinksProps) {
  const visible = links.filter((l) => l.imageUrl && l.url)
  if (visible.length === 0) return null

  return (
    <div className={styles.row} aria-label="Социальные сети">
      {visible.map((link, i) => (
        <Link
          key={`${link.url}-${i}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.item}
          title={link.label || 'Социальная сеть'}
        >
          <WikiImage src={link.imageUrl} alt={link.label || ''} className={styles.image} />
        </Link>
      ))}
    </div>
  )
}
