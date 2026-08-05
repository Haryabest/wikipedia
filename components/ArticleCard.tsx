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
      <div className={styles.media}>
        {imageUrl ? (
          <WikiImage src={imageUrl} alt={title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.placeholder}>{title[0]}</div>
        )}
      </div>
      <div className={styles.body}>
        {subcategory && <span className={styles.subcategory}>{subcategory}</span>}
        <h2 className={styles.title}>{title}</h2>
        {summary && <p className={styles.summary}>{summary}</p>}
        <div className={styles.footer}>
          <span className={styles.readMore}>Читать статью</span>
          <span className={styles.arrow} aria-hidden>→</span>
        </div>
      </div>
    </Link>
  )
}
