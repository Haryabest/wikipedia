'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useAdminModal } from '@/components/admin/AdminModalProvider'
import type { SocialLinkItem } from '@/lib/social-links'
import { parseSocialLinks } from '@/lib/social-links'

const EMPTY_LINK: SocialLinkItem = { imageUrl: '', url: '', label: '' }

export default function AdminSettingsPage() {
  const modal = useAdminModal()
  const [siteName, setSiteName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [emblemUrl, setEmblemUrl] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([
    { ...EMPTY_LINK },
    { ...EMPTY_LINK },
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((s) => {
      setSiteName(s.siteName ?? '')
      setLogoUrl(s.logoUrl ?? '')
      setEmblemUrl(s.emblemUrl ?? '')
      setSiteUrl(s.siteUrl ?? '')
      const links = parseSocialLinks(s.socialLinks)
      setSocialLinks([
        links[0] ?? { ...EMPTY_LINK },
        links[1] ?? { ...EMPTY_LINK },
      ])
    })
  }, [])

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.url
  }

  function updateSocialLink(index: number, patch: Partial<SocialLinkItem>) {
    setSocialLinks((prev) => prev.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteName,
        logoUrl: logoUrl || null,
        emblemUrl: emblemUrl || null,
        siteUrl,
        socialLinks: socialLinks.filter((l) => l.imageUrl.trim() && l.url.trim()),
      }),
    })
    setSaving(false)
    await modal.alert('Сохранено')
  }

  return (
    <div>
      <h1 className="admin-page-title">Настройки сайта</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-card">
          <label htmlFor="siteName">Название сайта</label>
          <input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />

          <label htmlFor="siteUrl">URL сайта (для SEO)</label>
          <input id="siteUrl" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://mydomain.com" />

          <ImageUploadField
            label="Логотип (главная страница)"
            value={logoUrl}
            onChange={setLogoUrl}
            onUpload={uploadFile}
          />

          <ImageUploadField
            label="Эмблема (на каждой странице статьи)"
            value={emblemUrl}
            onChange={setEmblemUrl}
            onUpload={uploadFile}
          />
        </div>

        <div className="admin-card">
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Ссылки на соцсети</h2>
          <p className="hint" style={{ marginTop: 0 }}>Иконки отображаются на главной странице над каруселью. Нажатие ведёт на указанный URL.</p>

          {socialLinks.map((link, i) => (
            <div key={i} style={{ marginBottom: i === 0 ? 24 : 0, paddingBottom: i === 0 ? 24 : 0, borderBottom: i === 0 ? '1px solid #eee' : undefined }}>
              <ImageUploadField
                label={`Иконка ${i + 1}`}
                value={link.imageUrl}
                onChange={(url) => updateSocialLink(i, { imageUrl: url })}
                onUpload={uploadFile}
              />
              <label htmlFor={`social-url-${i}`}>Ссылка {i + 1}</label>
              <input
                id={`social-url-${i}`}
                value={link.url}
                onChange={(e) => updateSocialLink(i, { url: e.target.value })}
                placeholder="https://vk.com/... или https://t.me/..."
              />
              <label htmlFor={`social-label-${i}`}>Подпись (необязательно)</label>
              <input
                id={`social-label-${i}`}
                value={link.label ?? ''}
                onChange={(e) => updateSocialLink(i, { label: e.target.value })}
                placeholder="VK, Telegram..."
              />
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  )
}
