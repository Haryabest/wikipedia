import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [articlesCount, categoriesCount, publishedCount, slidesCount] = await Promise.all([
    prisma.article.count(),
    prisma.category.count(),
    prisma.article.count({ where: { published: true, hidden: false } }),
    prisma.carouselSlide.count({ where: { active: true } }),
  ])

  return (
    <div>
      <h1 className="admin-page-title">Обзор</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Вы вошли как {session.email}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        <div className="admin-card">
          <div style={{ fontSize: 32, fontWeight: 700 }}>{articlesCount}</div>
          <div style={{ color: '#666', fontSize: 14 }}>Всего статей</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: 32, fontWeight: 700 }}>{publishedCount}</div>
          <div style={{ color: '#666', fontSize: 14 }}>Опубликовано</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: 32, fontWeight: 700 }}>{categoriesCount}</div>
          <div style={{ color: '#666', fontSize: 14 }}>Категорий</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: 32, fontWeight: 700 }}>{slidesCount}</div>
          <div style={{ color: '#666', fontSize: 14 }}>Слайдов карусели</div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 12px' }}>Быстрые действия</h3>
        <div className="admin-actions">
          <Link href="/admin/articles/new" className="btn btn--primary">Новая статья</Link>
          <Link href="/admin/categories" className="btn">Категории</Link>
          <Link href="/admin/carousel" className="btn">Карусель</Link>
        </div>
      </div>
    </div>
  )
}
