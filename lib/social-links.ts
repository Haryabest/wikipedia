export interface SocialLinkItem {
  imageUrl: string
  url: string
  label?: string
}

export function parseSocialLinks(raw: unknown): SocialLinkItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is SocialLinkItem => {
      if (!item || typeof item !== 'object') return false
      const link = item as SocialLinkItem
      return typeof link.imageUrl === 'string' && typeof link.url === 'string'
    })
    .slice(0, 6)
}
