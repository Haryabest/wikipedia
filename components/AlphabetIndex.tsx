'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './AlphabetIndex.module.css'

interface ArticleRef {
  title: string
  slug: string
}

interface AlphabetIndexProps {
  articles: ArticleRef[]
}

const RU_LETTERS = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

export function AlphabetIndex({ articles }: AlphabetIndexProps) {
  const [expanded, setExpanded] = useState(false)

  const grouped = articles.reduce<Record<string, ArticleRef[]>>((acc, article) => {
    const letter = article.title[0]?.toUpperCase() ?? '#'
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(article)
    return acc
  }, {})

  const letters = RU_LETTERS.filter((l) => grouped[l]?.length)

  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▾' : '▸'} Список статей по алфавиту ({articles.length})
      </button>

      {expanded && (
        <div className={`card ${styles.list}`}>
          {letters.length === 0 ? (
            <p className={styles.empty}>Статей пока нет.</p>
          ) : (
            letters.map((letter) => (
              <div key={letter} className={styles.group}>
                <h3 className={styles.letter}>{letter}</h3>
                <ul className={styles.articles}>
                  {grouped[letter].map((a) => (
                    <li key={a.slug}>
                      <Link href={`/wiki/${a.slug}`}>{a.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
