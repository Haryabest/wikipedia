import Link from 'next/link'
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
      {categories.map((cat) => (
        <Link key={cat.id} href={`/category/${cat.slug}`} className={styles.card}>
          <div className={styles.imageWrap}>
            {cat.imageUrl ? (
              <img src={cat.imageUrl} alt={cat.name} className={styles.image} loading="lazy" />
            ) : (
              <div className={styles.placeholder} aria-hidden>{cat.name[0]}</div>
            )}
          </div>
          <div className={styles.info}>
            <h3 className={styles.title}>{cat.name}</h3>
            <span className={styles.count}>
              {cat._count?.articles ?? 0} {articleLabel(cat._count?.articles ?? 0)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
