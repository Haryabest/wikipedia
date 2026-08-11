'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DashboardStats } from '@/lib/analytics-data'
import styles from './AnalyticsDashboard.module.css'

const PERIODS = [7, 30, 90] as const
type Period = (typeof PERIODS)[number]

interface AnalyticsDashboardProps {
  initialStats: DashboardStats
  initialDays: Period
}

function formatDate(date: string): string {
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function BarList({
  items,
  labelKey,
}: {
  items: Array<{ name: string; count: number } | { path: string; count: number } | { target: string; count: number }>
  labelKey: 'name' | 'path' | 'target'
}) {
  if (items.length === 0) {
    return <p className={styles.empty}>Нет данных за период</p>
  }

  const max = Math.max(...items.map((i) => i.count), 1)

  return (
    <ul className={styles.barList}>
      {items.map((item) => {
        const label =
          labelKey === 'name'
            ? (item as { name: string }).name
            : labelKey === 'path'
              ? (item as { path: string }).path
              : (item as { target: string }).target
        const count = item.count
        return (
          <li key={label} className={styles.barRow}>
            <span className={styles.barLabel}>{label}</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className={styles.barValue}>{count}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function AnalyticsDashboard({ initialStats, initialDays }: AnalyticsDashboardProps) {
  const router = useRouter()
  const [days, setDays] = useState<Period>(initialDays)
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [loading, setLoading] = useState(false)

  const loadStats = useCallback(async (period: Period) => {
    if (period === days) return
    setDays(period)
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/dashboard?days=${period}`, { cache: 'no-store' })
      if (!res.ok) {
        setDays(initialDays)
        setStats(initialStats)
        return
      }
      const data = (await res.json()) as DashboardStats
      setStats(data)
      router.replace(`/admin/dashboard?days=${period}`, { scroll: false })
    } catch {
      setDays(initialDays)
      setStats(initialStats)
    } finally {
      setLoading(false)
    }
  }, [days, initialDays, initialStats, router])

  useEffect(() => {
    setDays(initialDays)
    setStats(initialStats)
  }, [initialDays, initialStats])

  const maxDaily = Math.max(...stats.dailyPageviews.map((d) => d.count), 1)
  const periodLabel = `${days} дн.`

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Дашборд</h1>
        <div className={styles.periodToggle} role="group" aria-label="Период">
          {PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              className={period === days ? styles.periodBtnActive : styles.periodBtn}
              onClick={() => loadStats(period)}
              disabled={loading && period !== days}
              aria-pressed={period === days}
            >
              {period} дн.
            </button>
          ))}
        </div>
      </div>

      <p className={styles.subtitle}>
        Статистика за {periodLabel}: посещения, клики, устройства и источники трафика
      </p>

      <div className={loading ? `${styles.content} ${styles.contentLoading}` : styles.content}>
        <div className={styles.totals}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totals.pageviews}</div>
            <div className={styles.statLabel}>Просмотры</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totals.uniqueVisitors}</div>
            <div className={styles.statLabel}>Уникальные посетители</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totals.uniqueSessions}</div>
            <div className={styles.statLabel}>Сессии</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totals.clicks}</div>
            <div className={styles.statLabel}>Клики внутри сайта</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totals.outbound}</div>
            <div className={styles.statLabel}>Внешние клики</div>
          </div>
        </div>

        <div className={styles.grid}>
          <section className="admin-card">
            <h2 className={styles.sectionTitle}>Просмотры по дням · {periodLabel}</h2>
            <div className={styles.chart}>
              {stats.dailyPageviews.map((day) => (
                <div key={day.date} className={styles.chartCol}>
                  <div
                    className={styles.chartBar}
                    style={{ height: `${(day.count / maxDaily) * 100}%` }}
                    title={`${day.count} просмотров`}
                  />
                  <span className={styles.chartLabel}>{formatDate(day.date)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card">
            <h2 className={styles.sectionTitle}>Популярные страницы · {periodLabel}</h2>
            <BarList items={stats.topPages} labelKey="path" />
          </section>

          <section className="admin-card">
            <h2 className={styles.sectionTitle}>Клики и переходы · {periodLabel}</h2>
            <BarList items={stats.topClicks} labelKey="target" />
          </section>

          <section className="admin-card">
            <h2 className={styles.sectionTitle}>Устройства · {periodLabel}</h2>
            <BarList items={stats.devices} labelKey="name" />
          </section>

          <section className="admin-card">
            <h2 className={styles.sectionTitle}>Браузеры · {periodLabel}</h2>
            <BarList items={stats.browsers} labelKey="name" />
          </section>

          <section className="admin-card">
            <h2 className={styles.sectionTitle}>Операционные системы · {periodLabel}</h2>
            <BarList items={stats.os} labelKey="name" />
          </section>

          <section className="admin-card">
            <h2 className={styles.sectionTitle}>Источники трафика · {periodLabel}</h2>
            <BarList items={stats.referrers} labelKey="name" />
          </section>
        </div>
      </div>
    </div>
  )
}
