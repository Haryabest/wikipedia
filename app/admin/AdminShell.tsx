'use client'

import { AdminModalProvider } from '@/components/admin/AdminModalProvider'
import { AdminNav } from '@/components/admin/AdminNav'
import { AdminLogout } from './AdminLogout'

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminModalProvider>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">Admin Panel</div>
          <AdminNav />
          <AdminLogout />
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </AdminModalProvider>
  )
}
