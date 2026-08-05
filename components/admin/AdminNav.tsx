'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin', label: 'Обзор', exact: true },
  { href: '/admin/articles', label: 'Статьи' },
  { href: '/admin/categories', label: 'Категории' },
  { href: '/admin/carousel', label: 'Карусель' },
  { href: '/admin/settings', label: 'Настройки' },
] as const

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
          className={isActive(pathname, item.href, 'exact' in item ? item.exact : false) ? 'active' : undefined}
        >
          {item.label}
        </Link>
      ))}
      <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-external">
        Открыть сайт ↗
      </a>
    </nav>
  )
}
