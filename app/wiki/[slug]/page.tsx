import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackToHome } from '@/components/BackToHome'
import { SiteHeaderWithSettings } from '@/components/SiteHeaderWithSettings'
import { TableOfContents } from '@/components/TableOfContents'
import { Infobox } from '@/components/Infobox'
import { ArticleContent, extractHeadings } from '@/components/ArticleContent'
import { prisma } from '@/lib/prisma'
import { getArticleSlugMap, getSiteSettings } from '@/lib/data'
import { buildMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd, toJsonLdScript } from '@/lib/seo'
import styles from './page.module.css'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.article.findFirst({
    where: { slug, published: true, hidden: false },
  })
  if (!article) return { title: 'Страница не найдена', robots: { index: false } }

  const settings = await getSiteSettings()
  const description = article.metaDescription ?? article.summary ?? article.title

  return buildMetadata({
    title: article.title,
    description,
    path: `/wiki/${article.slug}`,
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    image: article.infoboxImageUrl,
    type: 'article',
    publishedTime: article.createdAt.toISOString(),
    modifiedTime: article.updatedAt.toISOString(),
    keywords: [article.title, settings.siteName],
  })
}

export default async function WikiArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, settings, slugMap] = await Promise.all([
    prisma.article.findFirst({
      where: { slug, published: true, hidden: false },
      include: {
        category: { include: { parent: true } },
        infoboxRows: { orderBy: { sortOrder: 'asc' } },
      },
    }),
    getSiteSettings(),
    getArticleSlugMap(),
  ])

  if (!article) notFound()

  const headings = extractHeadings(article.content)
  const pageUrl = `${settings.siteUrl.replace(/\/$/, '')}/wiki/${article.slug}`
  const description = article.metaDescription ?? article.summary ?? ''

  const articleLd = buildArticleJsonLd({
    title: article.title,
    description,
    image: article.infoboxImageUrl,
    url: pageUrl,
    siteName: settings.siteName,
    published: article.createdAt.toISOString(),
    modified: article.updatedAt.toISOString(),
  })

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: settings.siteName, url: settings.siteUrl },
    ...(article.category?.parent
      ? [{ name: article.category.parent.name, url: `${settings.siteUrl}/category/${article.category.parent.slug}` }]
      : []),
    ...(article.category
      ? [{ name: article.category.name, url: `${settings.siteUrl}/category/${article.category.slug}` }]
      : []),
    { name: article.title, url: pageUrl },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdScript(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumbs) }} />
      <SiteHeaderWithSettings showSearch={false} />
      <main className={`container ${styles.main}`}>
        <BackToHome />
        <div className={styles.layout}>
          <div className={styles.content}>
            <h1 className={styles.title}>{article.title}</h1>
            {article.summary && <p className={styles.summary}>{article.summary}</p>}
            <TableOfContents headings={headings} />
            <div className={styles.articleGrid}>
              <ArticleContent
                content={article.content}
                articleSlugs={slugMap}
                emblemUrl={settings.emblemUrl}
              />
              <Infobox
                imageUrl={article.infoboxImageUrl}
                caption={article.infoboxCaption}
                rows={article.infoboxRows.map((r) => ({ label: r.label, value: r.value }))}
              />
            </div>
          </div>
        </div>
        {article.category && (
          <p className={styles.category}>
            Категория:{' '}
            {article.category.parent && (
              <>
                <Link href={`/category/${article.category.parent.slug}`}>
                  {article.category.parent.name}
                </Link>
                {' → '}
              </>
            )}
            <Link href={`/category/${article.category.slug}`}>{article.category.name}</Link>
          </p>
        )}
      </main>
    </>
  )
}
