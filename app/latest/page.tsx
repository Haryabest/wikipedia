import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleCard } from '@/components/ArticleCard'
import { SiteHeaderWithSettings } from '@/components/SiteHeaderWithSettings'
import { getLatestArticles, getSiteSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    title: 'Новые статьи',
    description: `Последние опубликованные статьи на ${settings.siteName}`,
    path: '/latest',
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
  })
}

export default async function LatestArticlesPage() {
  const articles = await getLatestArticles()

  return (
    <>
      <SiteHeaderWithSettings showSearch />
      <main className={`container ${styles.main}`}>
        <Link href="/" className={styles.backLink}>
          ← На главную
        </Link>
        <h1 className={styles.title}>Новые статьи</h1>

        {articles.length === 0 ? (
          <p className={styles.empty}>Пока нет опубликованных статей.</p>
        ) : (
          <div className={styles.grid}>
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                title={article.title}
                slug={article.slug}
                summary={article.summary}
                imageUrl={article.infoboxImageUrl}
                subcategory={article.category?.parentId ? article.category.name : null}
              />
            ))}
          </div>
        )}

      </main>
    </>
  )
}
