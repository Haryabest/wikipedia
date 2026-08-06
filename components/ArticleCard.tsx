import Link from 'next/link'
import { WikiImage } from './WikiImage'
import styles from './ArticleCard.module.css'

interface ArticleCardProps {
  title: string
  slug: string
  summary?: string | null
  imageUrl?: string | null
  subcategory?: string | null
}

export function ArticleCard({ title, slug, summary, imageUrl, subcategory }: ArticleCardProps) {
  return (
    <Link href={`/wiki/${slug}`} className={styles.card}>
      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.type}>Статья</span>
          {subcategory && <span className={styles.subcategory}>{subcategory}</span>}
        </div>

        <h2 className={styles.title}>{title}</h2>

        {summary && <p className={styles.summary}>{summary}</p>}

        <div className={styles.footer}>
          <span className={styles.readMore}>Читать статью</span>
          <span className={styles.arrow} aria-hidden>→</span>
        </div>
      </div>

      <div className={styles.media}>
        {imageUrl ? (
          <WikiImage src={imageUrl} alt="" className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden>
            <span className={styles.placeholderLetter}>{title[0]}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
