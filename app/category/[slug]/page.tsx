import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackToHome } from '@/components/BackToHome'
import { SiteHeaderWithSettings } from '@/components/SiteHeaderWithSettings'
import { CategoryArticleList } from '@/components/CategoryArticleList'
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
        parent: true,
        children: {
          where: { hidden: false },
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { articles: { where: { published: true, hidden: false } } } } },
        },
      },
    }),
    getSiteSettings(),
  ])

  if (!category) notFound()

  const categoryIds = [category.id, ...category.children.map((c) => c.id)]

  const articles = await prisma.article.findMany({
    where: {
      published: true,
      hidden: false,
      categoryId: { in: categoryIds },
    },
    orderBy: { title: 'asc' },
    select: {
      title: true,
      slug: true,
      summary: true,
      infoboxImageUrl: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  })

  return (
    <>
      <SiteHeaderWithSettings showSearch />
      <main className={`container ${styles.main}`}>
        <BackToHome />
        {category.parent && (
          <Link href={`/category/${category.parent.slug}`} className={styles.back}>
            ← {category.parent.name}
          </Link>
        )}

        <h1 className={styles.title}>{category.name}</h1>

        {category.children.length > 0 && (
          <section className={styles.subcategories}>
            <h2 className={styles.sectionTitle}>Подкатегории</h2>
            <div className={styles.subcategoryGrid}>
              {category.children.map((sub) => (
                <Link key={sub.id} href={`/category/${sub.slug}`} className={styles.subcategoryChip}>
                  {sub.name}
                  <span className={styles.subcategoryCount}>{sub._count.articles}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <CategoryArticleList
          articles={articles}
          currentCategoryId={category.id}
          subcategories={category.children.map((sub) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            count: sub._count.articles,
          }))}
        />
      </main>
    </>
  )
}
