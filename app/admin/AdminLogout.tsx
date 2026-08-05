'use client'

import { useRouter } from 'next/navigation'

export function AdminLogout() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="admin-logout">
      <button type="button" className="btn" onClick={handleLogout}>
        Выйти
      </button>
    </div>
  )
}
