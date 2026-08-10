import Link from 'next/link'
import { SITE_UNIVERSE_NAME } from '@/lib/site-brand'
import { SiteHeaderWithSettings } from '@/components/SiteHeaderWithSettings'
import { Carousel } from '@/components/Carousel'
import { CategoryGrid } from '@/components/CategoryGrid'
import { ArticleCard } from '@/components/ArticleCard'
import { AlphabetIndex } from '@/components/AlphabetIndex'
import { getCarouselSlides, getLatestArticles, getSiteSettings, getVisibleArticles, getVisibleCategories } from '@/lib/data'
import { buildMetadata, buildWebsiteJsonLd, toJsonLdScript } from '@/lib/seo'
import type { Metadata } from 'next'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    title: settings.siteName,
    description: `${settings.siteName} — ${settings.siteSubtitle}`,
    path: '/',
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    keywords: [settings.siteName, SITE_UNIVERSE_NAME, 'энциклопедия', 'статьи'],
  })
}

export default async function HomePage() {
  const [settings, categories, articles, latestArticles, slides] = await Promise.all([
    getSiteSettings(),
    getVisibleCategories(),
    getVisibleArticles(),
    getLatestArticles(6),
    getCarouselSlides(),
  ])

  const websiteLd = buildWebsiteJsonLd(
    settings.siteName,
    settings.siteUrl,
    settings.siteSubtitle
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdScript(websiteLd) }} />
      <SiteHeaderWithSettings showSearch />
      <main className="container">
        <div className={styles.hero}>
          <Carousel slides={slides} />
        </div>

        {latestArticles.length > 0 && (
          <section className={styles.latestSection} aria-labelledby="latest-heading">
            <div className={styles.sectionHeader}>
              <h2 id="latest-heading" className={styles.sectionTitle}>Последние статьи</h2>
              <Link href="/latest" className={styles.allLink}>
                Все новые статьи →
              </Link>
            </div>
            <div className={styles.latestGrid}>
              {latestArticles.map((article) => (
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
          </section>
        )}

        <section className={styles.categoriesSection} aria-labelledby="categories-heading">
          <h2 id="categories-heading" className={styles.sectionTitle}>Статьи по категориям</h2>
          <CategoryGrid categories={categories} />
        </section>

        <AlphabetIndex articles={articles} />
      </main>
    </>
  )
}
