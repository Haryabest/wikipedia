'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminButton } from '@/components/admin/AdminButton'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(typeof data.error === 'string' ? data.error : 'Ошибка входа')
      }
    } catch {
      setError('Не удалось выполнить вход')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page admin-body">
      <div className="login-card">
        <h1>Вход в админку</h1>
        <form onSubmit={handleSubmit} className="admin-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
          <AdminButton type="submit" icon="login" variant="primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Вход...' : 'Войти'}
          </AdminButton>
        </form>
      </div>
    </div>
  )
}
