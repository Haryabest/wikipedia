'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { SocialBrandIcon } from '@/components/SocialBrandIcon'
import type { SocialNetworkOption } from '@/lib/social-links'
import styles from './SocialNetworkPicker.module.css'

interface SocialNetworkPickerProps {
  options: SocialNetworkOption[]
  value: SocialNetworkOption | null
  onChange: (option: SocialNetworkOption | null) => void
  placeholder?: string
}

export function SocialNetworkPicker({
  options,
  value,
  onChange,
  placeholder = 'Выберите соцсеть',
}: SocialNetworkPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((option) => option.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectOption(option: SocialNetworkOption) {
    onChange(option)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {value ? (
          <>
            <SocialBrandIcon iconFile={value.iconFile} label={value.label} size="md" />
            <span className={styles.triggerLabel}>{value.label}</span>
          </>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <span className={styles.chevron} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <input
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск..."
            autoFocus
          />
          <ul className={styles.list} role="listbox">
            {filtered.length === 0 ? (
              <li className={styles.empty}>Ничего не найдено</li>
            ) : (
              filtered.map((option) => (
                <li key={option.iconFile}>
                  <button
                    type="button"
                    className={value?.iconFile === option.iconFile ? styles.optionActive : styles.option}
                    onClick={() => selectOption(option)}
                    role="option"
                    aria-selected={value?.iconFile === option.iconFile}
                  >
                    <SocialBrandIcon iconFile={option.iconFile} label={option.label} size="md" />
                    <span>{option.label}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
