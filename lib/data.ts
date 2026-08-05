import { prisma } from '@/lib/prisma'

export async function getSiteSettings() {
  return (
    (await prisma.siteSettings.findUnique({ where: { id: 'default' } })) ?? {
      id: 'default',
      siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Wiki',
      logoUrl: null,
      emblemUrl: null,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    }
  )
}

export async function getArticleSlugMap(): Promise<Map<string, string>> {
  const articles = await prisma.article.findMany({
    where: { published: true, hidden: false },
    select: { title: true, slug: true },
  })
  return new Map(articles.map((a) => [a.title.toLowerCase(), a.slug]))
}

export async function getVisibleCategories() {
  return prisma.category.findMany({
    where: { hidden: false },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { articles: { where: { published: true, hidden: false } } } } },
  })
}

export async function getVisibleArticles() {
  return prisma.article.findMany({
    where: { published: true, hidden: false },
    orderBy: { title: 'asc' },
    select: { title: true, slug: true },
  })
}

export async function getCarouselSlides() {
  const slides = await prisma.carouselSlide.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    take: 10,
    include: { article: { select: { slug: true } } },
  })

  return slides.map((s) => ({
    id: s.id,
    imageUrl: s.imageUrl,
    caption: s.caption,
    linkUrl: s.linkUrl ?? (s.article ? `/wiki/${s.article.slug}` : null),
  }))
}
