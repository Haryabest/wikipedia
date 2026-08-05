'use client'

import { FormEvent, useEffect, useState } from 'react'

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [emblemUrl, setEmblemUrl] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((s) => {
      setSiteName(s.siteName ?? '')
      setLogoUrl(s.logoUrl ?? '')
      setEmblemUrl(s.emblemUrl ?? '')
      setSiteUrl(s.siteUrl ?? '')
    })
  }, [])

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    return (await res.json()).url
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteName, logoUrl: logoUrl || null, emblemUrl: emblemUrl || null, siteUrl }),
    })
    setSaving(false)
    alert('Сохранено')
  }

  return (
    <div>
      <h1 className="admin-page-title">Настройки сайта</h1>

      <form onSubmit={handleSubmit} className="admin-form admin-card">
        <label>Название сайта</label>
        <input value={siteName} onChange={(e) => setSiteName(e.target.value)} />

        <label>URL сайта (для SEO)</label>
        <input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://mydomain.com" />

        <label>Логотип (главная страница)</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} style={{ marginBottom: 0, flex: 1 }} />
          <input type="file" accept="image/*" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) setLogoUrl(await uploadFile(file))
          }} />
        </div>

        <label>Эмблема (на каждой странице статьи)</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={emblemUrl} onChange={(e) => setEmblemUrl(e.target.value)} style={{ marginBottom: 0, flex: 1 }} />
          <input type="file" accept="image/*" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) setEmblemUrl(await uploadFile(file))
          }} />
        </div>

        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}
