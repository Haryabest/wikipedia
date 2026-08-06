import { BackToHome } from '@/components/BackToHome'
import { SiteHeaderWithSettings } from '@/components/SiteHeaderWithSettings'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSiteSettings } from '@/lib/data'
import styles from './page.module.css'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const settings = await getSiteSettings()

  const results =
    query.length > 0
      ? await prisma.article.findMany({
          where: {
            published: true,
            hidden: false,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { summary: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
          orderBy: { title: 'asc' },
          take: 50,
          select: { title: true, slug: true, summary: true },
        })
      : []

  return (
    <>
      <SiteHeaderWithSettings />
      <main className={`container ${styles.main}`}>
        <BackToHome />
        <h1 className={styles.title}>Поиск</h1>
        {query ? (
          <>
            <p className={styles.info}>
              Результаты для «{query}»: {results.length}
            </p>
            {results.length === 0 ? (
              <p className={styles.empty}>Ничего не найдено.</p>
            ) : (
              <ul className={styles.list}>
                {results.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/wiki/${r.slug}`}>{r.title}</Link>
                    {r.summary && <p className={styles.summary}>{r.summary}</p>}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className={styles.empty}>Введите запрос в строку поиска.</p>
        )}
      </main>
    </>
  )
}
