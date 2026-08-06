import type { CSSProperties } from 'react'
import Link from 'next/link'
import { WikiImage } from './WikiImage'
import styles from './CategoryGrid.module.css'

interface Category {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
  _count?: { articles: number }
}

interface CategoryGridProps {
  categories: Category[]
}

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(145deg, #b85c38 0%, #7a3b24 100%)',
  'linear-gradient(145deg, #e8a87c 0%, #c97b4a 100%)',
  'linear-gradient(145deg, #c9a227 0%, #9a7b1a 100%)',
  'linear-gradient(145deg, #5b7c99 0%, #3d5568 100%)',
  'linear-gradient(145deg, #8b6f5c 0%, #5c483a 100%)',
  'linear-gradient(145deg, #6b8f71 0%, #4a634e 100%)',
]

function articleLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return 'статей'
  if (mod10 === 1) return 'статья'
  if (mod10 >= 2 && mod10 <= 4) return 'статьи'
  return 'статей'
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return <p className={styles.empty}>Категории пока не добавлены.</p>
  }

  return (
    <div className={styles.grid}>
      {categories.map((cat, index) => {
        const count = cat._count?.articles ?? 0

        return (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className={styles.card}
            style={{ '--card-index': index } as CSSProperties}
          >
            <div className={styles.info}>
              <span className={styles.label}>Категория</span>
              <h3 className={styles.title}>{cat.name}</h3>
              <p className={styles.meta}>
                {count} {articleLabel(count)}
              </p>
              <span className={styles.cta} aria-hidden>Открыть →</span>
            </div>

            <div className={styles.media}>
              {cat.imageUrl ? (
                <WikiImage src={cat.imageUrl} alt="" className={styles.image} loading="lazy" />
              ) : (
                <div
                  className={styles.placeholder}
                  style={{ background: PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length] }}
                  aria-hidden
                >
                  <span className={styles.placeholderLetter}>{cat.name[0]}</span>
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
