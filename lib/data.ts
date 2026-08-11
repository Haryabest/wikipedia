import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { resolveSiteName, resolveSiteSubtitle, SITE_BRAND_NAME, SITE_BRAND_SUBTITLE } from '@/lib/site-brand'
import { resolveSiteUrl } from '@/lib/site-url'

export function getDefaultSiteSettings() {
  return {
    id: 'default',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || SITE_BRAND_NAME,
    siteSubtitle: SITE_BRAND_SUBTITLE,
    logoUrl: null,
    emblemUrl: null,
    faviconUrl: null,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000',
    socialLinks: [],
  }
}

export const getSiteSettings = cache(async function getSiteSettings() {
  const row = await prisma.siteSettings.findUnique({ where: { id: 'default' } })
  const defaults = getDefaultSiteSettings()
  if (!row) return defaults

  return {
    ...row,
    siteName: resolveSiteName(row.siteName),
    siteSubtitle: resolveSiteSubtitle(row.siteSubtitle),
    siteUrl: resolveSiteUrl(row.siteUrl),
  }
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

export async function getLatestArticles(limit?: number) {
  return prisma.article.findMany({
    where: { published: true, hidden: false },
    orderBy: { updatedAt: 'desc' },
    ...(limit !== undefined ? { take: limit } : {}),
    select: {
      title: true,
      slug: true,
      summary: true,
      infoboxImageUrl: true,
      updatedAt: true,
      category: { select: { id: true, name: true, parentId: true } },
    },
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
