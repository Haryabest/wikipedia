import { SiteHeader } from '@/components/SiteHeader'
import { Carousel } from '@/components/Carousel'
import { CategoryGrid } from '@/components/CategoryGrid'
import { AlphabetIndex } from '@/components/AlphabetIndex'
import { getCarouselSlides, getSiteSettings, getVisibleArticles, getVisibleCategories } from '@/lib/data'
import { buildMetadata, buildWebsiteJsonLd } from '@/lib/seo'
import type { Metadata } from 'next'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    title: settings.siteName,
    description: `${settings.siteName} — информационная энциклопедия. Статьи по категориям, алфавитный указатель, поиск.`,
    path: '/',
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    keywords: [settings.siteName, 'энциклопедия', 'wiki', 'статьи'],
  })
}

export default async function HomePage() {
  const [settings, categories, articles, slides] = await Promise.all([
    getSiteSettings(),
    getVisibleCategories(),
    getVisibleArticles(),
    getCarouselSlides(),
  ])

  const websiteLd = buildWebsiteJsonLd(
    settings.siteName,
    settings.siteUrl,
    'Информационная wiki-энциклопедия'
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <SiteHeader siteName={settings.siteName} logoUrl={settings.logoUrl} showSearch />
      <main className="container">
        <div className={styles.hero}>
          <Carousel slides={slides} />
        </div>

        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className={styles.sectionTitle}>Статьи по категориям</h2>
          <CategoryGrid categories={categories} />
        </section>

        <AlphabetIndex articles={articles} />
      </main>
    </>
  )
}
