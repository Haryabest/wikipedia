import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDashboardStats } from '@/lib/analytics-data'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export const dynamic = 'force-dynamic'

const PERIODS = [7, 30, 90] as const

export default async function AdminAnalyticsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const sp = await searchParams
  const parsed = Number(sp.days)
  const days = PERIODS.includes(parsed as 7 | 30 | 90) ? (parsed as 7 | 30 | 90) : 30
  const stats = await getDashboardStats(days)

  return <AnalyticsDashboard initialStats={stats} initialDays={days} />
}
