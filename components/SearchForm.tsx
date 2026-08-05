'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

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

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="search"
        placeholder="Поиск по wiki..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Поиск"
      />
      <button type="submit">Найти</button>
    </form>
  )
}
