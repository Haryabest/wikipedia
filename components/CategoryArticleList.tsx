'use client'

import { useMemo, useState } from 'react'
import { ArticleCard } from './ArticleCard'
import styles from './CategoryArticleList.module.css'

interface ArticleItem {
  title: string
  slug: string
  summary: string | null
  infoboxImageUrl: string | null
  category: { id: string; name: string; slug: string } | null
}

interface SubcategoryItem {
  id: string
  name: string
  slug: string
  count: number
}

interface CategoryArticleListProps {
  articles: ArticleItem[]
  subcategories: SubcategoryItem[]
  currentCategoryId: string
}

type SortOption = 'title-asc' | 'title-desc'

export function CategoryArticleList({
  articles,
  subcategories,
  currentCategoryId,
}: CategoryArticleListProps) {
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all')
  const [sort, setSort] = useState<SortOption>('title-asc')

  const filteredArticles = useMemo(() => {
    let list = articles

    if (subcategoryFilter === 'current') {
      list = list.filter((article) => article.category?.id === currentCategoryId)
    } else if (subcategoryFilter !== 'all') {
      list = list.filter((article) => article.category?.id === subcategoryFilter)
    }

    return [...list].sort((a, b) => {
      const cmp = a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' })
      return sort === 'title-desc' ? -cmp : cmp
    })
  }, [articles, subcategoryFilter, sort, currentCategoryId])

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Статьи <span className={styles.count}>({filteredArticles.length})</span>
        </h2>

        <div className={styles.toolbar}>
          <div className={styles.filters} role="group" aria-label="Фильтр по подкатегории">
            <button
              type="button"
              className={subcategoryFilter === 'all' ? styles.filterActive : styles.filter}
              onClick={() => setSubcategoryFilter('all')}
            >
              Все
              <span className={styles.filterCount}>{articles.length}</span>
            </button>

            {subcategories.length > 0 && (
              <button
                type="button"
                className={subcategoryFilter === 'current' ? styles.filterActive : styles.filter}
                onClick={() => setSubcategoryFilter('current')}
              >
                Только эта категория
              </button>
            )}

            {subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={subcategoryFilter === sub.id ? styles.filterActive : styles.filter}
                onClick={() => setSubcategoryFilter(sub.id)}
              >
                {sub.name}
                <span className={styles.filterCount}>{sub.count}</span>
              </button>
            ))}
          </div>

          <label className={styles.sort}>
            <span className={styles.sortLabel}>Сортировка</span>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              <option value="title-asc">По алфавиту А–Я</option>
              <option value="title-desc">По алфавиту Я–А</option>
            </select>
          </label>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <p className={styles.empty}>По выбранному фильтру статей не найдено.</p>
      ) : (
        <div className={styles.grid}>
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.slug}
              title={article.title}
              slug={article.slug}
              summary={article.summary}
              imageUrl={article.infoboxImageUrl}
              subcategory={
                article.category && article.category.id !== currentCategoryId
                  ? article.category.name
                  : null
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}
