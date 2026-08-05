import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import styles from './page.module.css'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findFirst({ where: { slug, hidden: false } })
  if (!category) return { title: 'Категория не найдена', robots: { index: false } }

  const settings = await getSiteSettings()
  return buildMetadata({
    title: category.name,
    description: `Все статьи в категории «${category.name}» — ${settings.siteName}`,
    path: `/category/${category.slug}`,
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    image: category.imageUrl,
  })
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [category, settings] = await Promise.all([
    prisma.category.findFirst({
      where: { slug, hidden: false },
      include: {
        articles: {
          where: { published: true, hidden: false },
          orderBy: { title: 'asc' },
          select: { title: true, slug: true, summary: true },
        },
      },
    }),
    getSiteSettings(),
  ])

  if (!category) notFound()

  return (
    <>
      <SiteHeader siteName={settings.siteName} logoUrl={settings.logoUrl} showSearch />
      <main className={`container ${styles.main}`}>
        <Link href="/" className={styles.back}>← На главную</Link>
        <h1 className={styles.title}>{category.name}</h1>
        {category.articles.length === 0 ? (
          <p className={styles.empty}>В этой категории пока нет статей.</p>
        ) : (
          <ul className={styles.list}>
            {category.articles.map((a) => (
              <li key={a.slug} className={styles.item}>
                <Link href={`/wiki/${a.slug}`} className={styles.link}>
                  <h2 className={styles.itemTitle}>{a.title}</h2>
                  {a.summary && <p className={styles.itemSummary}>{a.summary}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
