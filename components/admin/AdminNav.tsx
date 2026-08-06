'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminIcon, type AdminIconName } from '@/components/admin/AdminIcon'

const NAV_ITEMS: Array<{ href: string; label: string; icon: AdminIconName; exact?: boolean }> = [
  { href: '/admin', label: 'Обзор', icon: 'home', exact: true },
  { href: '/admin/articles', label: 'Статьи', icon: 'article' },
  { href: '/admin/categories', label: 'Категории', icon: 'category' },
  { href: '/admin/carousel', label: 'Карусель', icon: 'carousel' },
  { href: '/admin/settings', label: 'Настройки', icon: 'settings' },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="admin-nav">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={isActive(pathname, item.href, item.exact) ? 'active' : undefined}
        >
          <AdminIcon name={item.icon} />
          {item.label}
        </Link>
      ))}
      <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-external">
        <AdminIcon name="external" />
        Открыть сайт
      </a>
    </nav>
  )
}
