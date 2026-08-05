import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { AdminLogout } from './AdminLogout'
import './admin.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    return <>{children}</>
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Admin Panel</div>
        <nav className="admin-nav">
          <Link href="/admin">Обзор</Link>
          <Link href="/admin/articles">Статьи</Link>
          <Link href="/admin/categories">Категории</Link>
          <Link href="/admin/carousel">Карусель</Link>
          <Link href="/admin/settings">Настройки</Link>
          <a href="/" target="_blank" rel="noopener">Открыть сайт ↗</a>
        </nav>
        <AdminLogout />
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}
