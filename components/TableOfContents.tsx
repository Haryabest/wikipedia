import Link from 'next/link'
import styles from './TableOfContents.module.css'

interface Heading {
  id: string
  title: string
}

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null

  return (
    <nav className={styles.toc} aria-label="Содержание страницы">
      <span className={styles.label}>Содержание:</span>
      <ul className={styles.list}>
        {headings.map((h) => (
          <li key={h.id}>
            <Link href={`#${h.id}`}>{h.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
