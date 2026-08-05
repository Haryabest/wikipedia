'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { WikiImage } from './WikiImage'
import styles from './Carousel.module.css'

interface Slide {
  id: string
  imageUrl: string
  caption?: string | null
  linkUrl?: string | null
}

interface CarouselProps {
  slides: Slide[]
  intervalMs?: number
}

export function Carousel({ slides, intervalMs = 7000 }: CarouselProps) {
  const [index, setIndex] = useState(0)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, intervalMs)
    return () => clearInterval(timer)
  }, [next, intervalMs, slides.length])

  if (slides.length === 0) {
    return (
      <div className={`card ${styles.carousel}`}>
        <div className={styles.placeholder}>Добавьте арты в карусель через админку</div>
      </div>
    )
  }

  const slide = slides[index]

  const image = (
    <WikiImage src={slide.imageUrl} alt={slide.caption ?? ''} className={styles.image} />
  )

  return (
    <div className={`card ${styles.carousel}`}>
      <div className={styles.slide}>
        {slide.linkUrl ? <Link href={slide.linkUrl}>{image}</Link> : image}
        {slide.caption && <p className={styles.caption}>{slide.caption}</p>}
      </div>
      {slides.length > 1 && (
        <>
          <button type="button" className={styles.navBtn} onClick={prev} aria-label="Предыдущий слайд">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <button type="button" className={`${styles.navBtn} ${styles.navNext}`} onClick={next} aria-label="Следующий слайд">
            <ChevronRight size={22} strokeWidth={2} />
          </button>
          <div className={styles.dots}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={i === index ? styles.dotActive : styles.dot}
                onClick={() => setIndex(i)}
                aria-label={`Слайд ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
