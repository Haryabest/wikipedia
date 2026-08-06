import brandMeta from './social-brand-meta.json'

export interface SocialBrandMeta {
  slug: string
  hex: string
  title: string
  path: string
}

const brandMetaByFile = brandMeta as Record<string, SocialBrandMeta>

export function getBrandMetaForFile(iconFile: string | null | undefined): SocialBrandMeta | null {
  if (!iconFile || iconFile === '__custom__') return null
  return brandMetaByFile[iconFile] ?? null
}

export function getBrandMetaForLabel(label: string | null | undefined): SocialBrandMeta | null {
  if (!label) return null
  return Object.values(brandMetaByFile).find((item) => item.title === label) ?? null
}
