import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export function getDefaultSiteSettings() {
  return {
    id: 'default',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Wiki',
    logoUrl: null,
    emblemUrl: null,
    faviconUrl: null,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    socialLinks: [],
  }
}

export const getSiteSettings = cache(async function getSiteSettings() {
  return (await prisma.siteSettings.findUnique({ where: { id: 'default' } })) ?? getDefaultSiteSettings()
})

export async function getArticleSlugMap(): Promise<Map<string, string>> {
  const articles = await prisma.article.findMany({
    where: { published: true, hidden: false },
    select: { title: true, slug: true },
  })
  return new Map(articles.map((a) => [a.title.toLowerCase(), a.slug]))
}

export async function getVisibleCategories() {
  const parents = await prisma.category.findMany({
    where: { hidden: false, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: { hidden: false },
        select: { id: true },
      },
    },
  })

  return Promise.all(
    parents.map(async (cat) => {
      const childIds = cat.children.map((c) => c.id)
      const articlesCount = await prisma.article.count({
        where: {
          published: true,
          hidden: false,
          categoryId: { in: [cat.id, ...childIds] },
        },
      })
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        hidden: cat.hidden,
        _count: { articles: articlesCount },
      }
    })
  )
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
