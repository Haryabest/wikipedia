export type AnalyticsEventType = 'pageview' | 'click' | 'outbound'

export interface ParsedUserAgent {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown'
  browser: string
  os: string
}

export function parseUserAgent(ua: string): ParsedUserAgent {
  const lower = ua.toLowerCase()
  let deviceType: ParsedUserAgent['deviceType'] = 'desktop'
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'tablet'
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile'
  }

  let browser = 'Other'
  if (lower.includes('edg/')) browser = 'Edge'
  else if (lower.includes('chrome/') && !lower.includes('edg/')) browser = 'Chrome'
  else if (lower.includes('firefox/')) browser = 'Firefox'
  else if (lower.includes('safari/') && !lower.includes('chrome/')) browser = 'Safari'
  else if (lower.includes('opr/') || lower.includes('opera')) browser = 'Opera'

  let os = 'Other'
  if (lower.includes('windows')) os = 'Windows'
  else if (lower.includes('mac os') || lower.includes('macintosh')) os = 'macOS'
  else if (lower.includes('android')) os = 'Android'
  else if (lower.includes('iphone') || lower.includes('ipad')) os = 'iOS'
  else if (lower.includes('linux')) os = 'Linux'

  return { deviceType, browser, os }
}

export function hashIp(ip: string): string {
  const day = new Date().toISOString().slice(0, 10)
  const data = `${ip}:${day}:${process.env.JWT_SECRET ?? 'salt'}`
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i)
    hash |= 0
  }
  return `h${Math.abs(hash)}`
}
