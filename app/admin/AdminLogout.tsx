'use client'

import { useRouter } from 'next/navigation'
import { AdminButton } from '@/components/admin/AdminButton'

export function AdminLogout() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="admin-logout">
      <AdminButton type="button" icon="logout" onClick={handleLogout}>
        Выйти
      </AdminButton>
    </div>
  )
}
