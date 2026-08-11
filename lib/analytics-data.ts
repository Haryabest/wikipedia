import { prisma } from '@/lib/prisma'
import { formatDomainLabel } from '@/lib/site-domains'

export interface DashboardStats {
  periodDays: number
  totals: {
    pageviews: number
    clicks: number
    outbound: number
    uniqueSessions: number
    uniqueVisitors: number
  }
  dailyPageviews: Array<{ date: string; count: number }>
  topPages: Array<{ path: string; count: number }>
  topClicks: Array<{ target: string; count: number }>
  domains: Array<{ name: string; count: number }>
  devices: Array<{ name: string; count: number }>
  browsers: Array<{ name: string; count: number }>
  os: Array<{ name: string; count: number }>
  referrers: Array<{ name: string; count: number }>
}

function startDate(days: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - (days - 1))
  return d
}

function bucketByDay(events: { createdAt: Date }[], days: number): Array<{ date: string; count: number }> {
  const map = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (days - 1 - i))
    map.set(d.toISOString().slice(0, 10), 0)
  }
  for (const e of events) {
    const key = e.createdAt.toISOString().slice(0, 10)
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }))
}

function topCounts(items: string[], limit = 10): Array<{ name: string; count: number }> {
  const map = new Map<string, number>()
  for (const item of items) {
    if (!item) continue
    map.set(item, (map.get(item) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

export async function getDashboardStats(periodDays: number): Promise<DashboardStats> {
  const since = startDate(periodDays)

  const events = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: since } },
    select: {
      type: true,
      path: true,
      target: true,
      host: true,
      referrer: true,
      deviceType: true,
      browser: true,
      os: true,
      sessionId: true,
      ipHash: true,
      createdAt: true,
    },
  })

  const pageviews = events.filter((e) => e.type === 'pageview')
  const clicks = events.filter((e) => e.type === 'click')
  const outbound = events.filter((e) => e.type === 'outbound')

  const sessions = new Set(pageviews.map((e) => e.sessionId).filter(Boolean))
  const visitors = new Set(pageviews.map((e) => e.ipHash).filter(Boolean))

  return {
    periodDays,
    totals: {
      pageviews: pageviews.length,
      clicks: clicks.length,
      outbound: outbound.length,
      uniqueSessions: sessions.size,
      uniqueVisitors: visitors.size,
    },
    dailyPageviews: bucketByDay(pageviews, periodDays),
    topPages: topCounts(pageviews.map((e) => e.path), 12).map(({ name, count }) => ({
      path: name,
      count,
    })),
    topClicks: topCounts(
      [...clicks, ...outbound].map((e) => e.target ?? e.path),
      12
    ).map(({ name, count }) => ({ target: name, count })),
    domains: topCounts(
      pageviews.map((e) => (e.host ? formatDomainLabel(e.host) : 'неизвестно')),
      8
    ),
    devices: topCounts(pageviews.map((e) => e.deviceType ?? 'unknown'), 6),
    browsers: topCounts(pageviews.map((e) => e.browser ?? 'Other'), 8),
    os: topCounts(pageviews.map((e) => e.os ?? 'Other'), 8),
    referrers: topCounts(
      pageviews.map((e) => {
        if (!e.referrer) return 'Прямой заход'
        try {
          return new URL(e.referrer).hostname
        } catch {
          return e.referrer
        }
      }),
      8
    ),
  }
}
