/** Punycode for эфирия.рф (from url.domainToASCII). */
export const DEFAULT_SITE_DOMAINS = ['efiriya.ru', 'xn--h1aaxo8bq.xn--p1ai'] as const

const DOMAIN_LABELS: Record<string, string> = {
  efiriya.ru: 'efiriya.ru',
  'www.efiriya.ru': 'efiriya.ru',
  'admin.efiriya.ru': 'admin.efiriya.ru',
  'xn--h1aaxo8bq.xn--p1ai': 'эфирия.рф',
  'www.xn--h1aaxo8bq.xn--p1ai': 'эфирия.рф',
  'admin.xn--h1aaxo8bq.xn--p1ai': 'admin.эфирия.рф',
}

function stripPort(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

export function getConfiguredSiteDomains(): string[] {
  const raw = process.env.SITE_DOMAINS?.trim()
  if (!raw) return [...DEFAULT_SITE_DOMAINS]
  return raw
    .split(',')
    .map((d) => stripPort(d.trim()))
    .filter(Boolean)
}

export function formatDomainLabel(hostname: string): string {
  const host = stripPort(hostname)
  return DOMAIN_LABELS[host] ?? host
}

export function isBareIpOrLocalHost(hostname: string): boolean {
  const host = stripPort(hostname)
  if (host === 'localhost' || host === '127.0.0.1') return true
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
}

export function isAdminHostname(hostname: string): boolean {
  return stripPort(hostname).startsWith('admin.')
}

export function isKnownSiteHostname(hostname: string): boolean {
  const host = stripPort(hostname)
  if (isBareIpOrLocalHost(host)) return true

  const domains = getConfiguredSiteDomains()
  for (const domain of domains) {
    if (host === domain || host === `www.${domain}` || host === `admin.${domain}`) {
      return true
    }
  }
  return false
}

export function toAdminHostname(hostname: string): string {
  const host = stripPort(hostname)
  if (isAdminHostname(host)) return host
  return host.replace(/^(www\.)?/, 'admin.')
}

export function requestProto(request: Request, fallback: 'http' | 'https' = 'https'): string {
  const forwarded = request.headers.get('x-forwarded-proto')
  if (forwarded === 'http' || forwarded === 'https') return forwarded
  try {
    const proto = new URL(request.url).protocol.replace(':', '')
    if (proto === 'http' || proto === 'https') return proto
  } catch {
    // ignore
  }
  return fallback
}
