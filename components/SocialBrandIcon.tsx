import { getBrandMetaForFile, getBrandMetaForLabel } from '@/lib/simple-icon-brands'
import { getLogoPath } from '@/lib/social-icon-logo-overrides'
import { normalizeMediaUrl } from '@/lib/media-url'
import styles from './SocialBrandIcon.module.css'

interface SocialBrandIconProps {
  iconFile?: string | null
  imageUrl?: string | null
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SocialBrandIcon({
  iconFile,
  imageUrl,
  label,
  size = 'md',
  className,
}: SocialBrandIconProps) {
  const brand = getBrandMetaForFile(iconFile) ?? getBrandMetaForLabel(label)
  const rootClass = [styles.root, styles[size], className].filter(Boolean).join(' ')

  if (brand?.path) {
    return (
      <span
        className={rootClass}
        style={{ backgroundColor: `#${brand.hex}` }}
        title={label || brand.title}
      >
        <svg role="img" viewBox="0 0 24 24" className={styles.logo} aria-label={label || brand.title}>
          <path d={getLogoPath(brand.slug, brand.path)} fill="#ffffff" />
        </svg>
      </span>
    )
  }

  if (iconFile === '__custom__') {
    return <span className={`${rootClass} ${styles.placeholder}`} aria-hidden />
  }

  if (imageUrl) {
    const resolved = normalizeMediaUrl(imageUrl)
    return (
      <span className={`${rootClass} ${styles.custom}`} title={label}>
        <img src={resolved ?? imageUrl} alt={label || ''} className={styles.customImage} />
      </span>
    )
  }

  if (label) {
    return (
      <span className={`${rootClass} ${styles.placeholder}`} title={label} aria-label={label}>
        <span className={styles.initial}>{label.charAt(0).toUpperCase()}</span>
      </span>
    )
  }

  return <span className={`${rootClass} ${styles.placeholder}`} aria-hidden />
}
