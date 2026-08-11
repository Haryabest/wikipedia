import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDashboardStats } from '@/lib/analytics-data'

const PERIODS = [7, 30, 90] as const

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const parsed = Number(url.searchParams.get('days') ?? 30)
  const days = PERIODS.includes(parsed as 7 | 30 | 90) ? parsed : 30

  const stats = await getDashboardStats(days)
  return NextResponse.json(stats)
}
