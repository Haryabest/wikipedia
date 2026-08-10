/** Крупное название в шапке */
export const SITE_BRAND_NAME = 'Эфитека'

/** Подзаголовок под названием в шапке */
export const SITE_BRAND_SUBTITLE =
  'Эфирия: мир в деталях — путеводитель по вселенной'

/** Название вселенной / энциклопедии в тексте интерфейса (вместо «wiki») */
export const SITE_UNIVERSE_NAME = 'Эфирия'

const LEGACY_NAMES = new Set(['wiki', 'wikipedia'])

export function resolveSiteName(value: string | null | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed || LEGACY_NAMES.has(trimmed.toLowerCase())) return SITE_BRAND_NAME
  return trimmed
}

export function resolveSiteSubtitle(value: string | null | undefined): string {
  const trimmed = value?.trim()
  if (!trimmed) return SITE_BRAND_SUBTITLE
  return trimmed
}
