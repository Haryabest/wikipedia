'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { SITE_UNIVERSE_NAME } from '@/lib/site-brand'
import styles from './SearchForm.module.css'

export function SearchForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  function handleClear() {
    setQuery('')
  }

  return (
    <form className={`search-form ${styles.form}`} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <input
          type="text"
          placeholder={`Поиск по ${SITE_UNIVERSE_NAME}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Поиск"
          className={styles.input}
        />
        {query.length > 0 && (
          <button
            type="button"
            className={styles.clear}
            onClick={handleClear}
            aria-label="Очистить поиск"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>
      <button type="submit" className={styles.submit}>Найти</button>
    </form>
  )
}
