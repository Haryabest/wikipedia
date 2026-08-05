import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminArticlesPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { category: { select: { name: true } } },
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Статьи</h1>
        <Link href="/admin/articles/new" className="btn btn--primary">+ Новая статья</Link>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>URL</th>
              <th>Категория</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td><code>/wiki/{a.slug}</code></td>
                <td>{a.category?.name ?? '—'}</td>
                <td>
                  {a.hidden ? (
                    <span className="badge badge--red">Скрыта</span>
                  ) : a.published ? (
                    <span className="badge badge--green">Опубликована</span>
                  ) : (
                    <span className="badge badge--gray">Черновик</span>
                  )}
                </td>
                <td>
                  <Link href={`/admin/articles/${a.id}`} className="btn">Редактировать</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
