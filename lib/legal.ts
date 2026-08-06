export interface LegalSiteInfo {
  siteName: string
  siteUrl: string
}

export function formatLegalDate(date = new Date()): string {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getOperatorLabel(info: LegalSiteInfo): string {
  return `Администрация информационного ресурса «${info.siteName}»`
}
