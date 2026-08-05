import DOMPurify from 'isomorphic-dompurify'

export interface ArticleSection {
  id: string
  title: string
  content: string
}

export function parseSections(raw: string): ArticleSection[] {
  if (!raw?.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function isLegacyContent(raw: string): boolean {
  if (!raw?.trim()) return false
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
  } catch {
    return false
  }
}

export function stringifySections(sections: ArticleSection[]): string {
  return JSON.stringify(sections)
}

const WIKI_LINK_REGEX = /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g

export function renderWikiLinks(html: string, articleSlugs: Map<string, string>): string {
  return html.replace(WIKI_LINK_REGEX, (_, target: string, label?: string) => {
    const trimmed = target.trim()
    const slug = articleSlugs.get(trimmed.toLowerCase()) ?? createLinkSlug(trimmed)
    const text = (label ?? trimmed).trim()
    return `<a href="/wiki/${encodeURIComponent(slug)}" class="wiki-link">${escapeHtml(text)}</a>`
  })
}

function createLinkSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-яё0-9-]/gi, '')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a',
      'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'img', 'figure', 'figcaption',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel', 'id'],
    ALLOW_DATA_ATTR: false,
  })
}

export function renderArticleHtml(content: string, articleSlugs: Map<string, string>): string {
  if (isLegacyContent(content)) {
    const sections = parseSections(content)
    const html = sections
      .map((s) => {
        const heading = s.title ? `<h2 id="${s.id}">${escapeHtml(s.title)}</h2>` : ''
        return `${heading}${renderWikiLinks(s.content, articleSlugs)}`
      })
      .join('')
    return sanitizeHtml(html)
  }

  const withIds = addHeadingIds(content)
  return sanitizeHtml(renderWikiLinks(withIds, articleSlugs))
}

function addHeadingIds(html: string): string {
  let counter = 0
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
    if (/id\s*=/.test(attrs)) return match
    counter++
    const id = `section-${counter}`
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`
  })
}

export function extractHeadingsFromContent(content: string): { id: string; title: string }[] {
  if (isLegacyContent(content)) {
    return parseSections(content)
      .filter((s) => s.title.trim())
      .map((s) => ({ id: s.id, title: s.title }))
  }

  const headings: { id: string; title: string }[] = []
  const regex = /<h([23])([^>]*?)>(.*?)<\/h\1>/gi
  let match
  let counter = 0

  while ((match = regex.exec(content)) !== null) {
    counter++
    const attrs = match[2]
    const idMatch = attrs.match(/id\s*=\s*["']([^"']+)["']/)
    const id = idMatch?.[1] ?? `section-${counter}`
    const title = match[3].replace(/<[^>]+>/g, '').trim()
    if (title) headings.push({ id, title })
  }

  return headings
}

export function extractHeadings(sections: ArticleSection[]): { id: string; title: string }[] {
  return sections
    .filter((s) => s.title.trim())
    .map((s) => ({ id: s.id, title: s.title }))
}
