import type { Metadata } from 'next'

interface BuildMetadataOptions {
  title: string
  description: string
  path: string
  siteName: string
  siteUrl: string
  image?: string | null
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  keywords?: string[]
}

export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const url = `${opts.siteUrl.replace(/\/$/, '')}${opts.path}`
  const description = opts.description.slice(0, 160)

  return {
    title: opts.title,
    description,
    keywords: opts.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description,
      url,
      siteName: opts.siteName,
      locale: 'ru_RU',
      type: opts.type ?? 'website',
      images: opts.image ? [{ url: opts.image, width: 1200, height: 630, alt: opts.title }] : undefined,
      publishedTime: opts.publishedTime,
      modifiedTime: opts.modifiedTime,
    },
    twitter: {
      card: opts.image ? 'summary_large_image' : 'summary',
      title: opts.title,
      description,
      images: opts.image ? [opts.image] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export function buildWebsiteJsonLd(siteName: string, siteUrl: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description,
    inLanguage: 'ru-RU',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl.replace(/\/$/, '')}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildArticleJsonLd(opts: {
  title: string
  description?: string | null
  image?: string | null
  url: string
  siteName: string
  published: string
  modified: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    image: opts.image,
    url: opts.url,
    datePublished: opts.published,
    dateModified: opts.modified,
    inLanguage: 'ru-RU',
    author: { '@type': 'Organization', name: opts.siteName },
    publisher: { '@type': 'Organization', name: opts.siteName },
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
  }
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function autoMetaDescription(summary: string, content: string, title: string): string {
  const fromSummary = stripHtml(summary)
  if (fromSummary.length >= 50) return fromSummary.slice(0, 160)

  const fromContent = stripHtml(content)
  if (fromContent.length >= 50) return fromContent.slice(0, 160)

  return `Статья «${title}» в энциклопедии. ${fromContent.slice(0, 120)}`.slice(0, 160)
}
