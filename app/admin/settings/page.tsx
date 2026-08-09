'use client'

import { FormEvent, useEffect, useState } from 'react'
import { SocialLinksEditor } from '@/components/admin/SocialLinksEditor'
import { AdminButton } from '@/components/admin/AdminButton'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useAdminModal } from '@/components/admin/AdminModalProvider'
import { isSocialLinkComplete, parseSocialLinks, type SocialLinkItem } from '@/lib/social-links'
import { adminFetch } from '@/lib/admin-fetch'

export default function AdminSettingsPage() {
  const modal = useAdminModal()
  const [siteName, setSiteName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [emblemUrl, setEmblemUrl] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminFetch<{
      siteName?: string
      logoUrl?: string | null
      faviconUrl?: string | null
      emblemUrl?: string | null
      siteUrl?: string
      socialLinks?: unknown
    }>('/api/settings')
      .then((s) => {
        setSiteName(s.siteName ?? '')
        setLogoUrl(s.logoUrl ?? '')
        setFaviconUrl(s.faviconUrl ?? '')
        setEmblemUrl(s.emblemUrl ?? '')
        setSiteUrl(s.siteUrl ?? '')
        setSocialLinks(parseSocialLinks(s.socialLinks))
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === 'Unauthorized') return
        void modal.alert(err instanceof Error ? err.message : 'Не удалось загрузить настройки', 'Ошибка')
      })
  }, [modal])

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const data = await adminFetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    return data.url
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await adminFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          logoUrl: logoUrl || null,
          faviconUrl: faviconUrl || null,
          emblemUrl: emblemUrl || null,
          siteUrl,
          socialLinks: socialLinks.filter(isSocialLinkComplete),
        }),
      })
      await modal.alert('Сохранено')
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось сохранить настройки', 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="admin-page-title">Настройки сайта</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-card">
          <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Основное и SEO</h2>

          <label htmlFor="siteName">Название сайта</label>
          <input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
          <p className="hint">Отображается во вкладке браузера и в результатах поиска.</p>

          <label htmlFor="siteUrl">URL сайта (для SEO)</label>
          <input
            id="siteUrl"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://mydomain.com"
          />
          <p className="hint">Канонический адрес для Open Graph, sitemap и соцсетей.</p>

          <ImageUploadField
            label="Иконка сайта (favicon, вкладка браузера)"
            value={faviconUrl}
            onChange={setFaviconUrl}
            onUpload={uploadFile}
            placeholder="URL или загрузите PNG/SVG (~32×32)"
          />
          <p className="hint">Если пусто — используется стандартная иконка «W» или эмблема статьи.</p>

          <ImageUploadField
            label="Логотип в шапке"
            value={logoUrl}
            onChange={setLogoUrl}
            onUpload={uploadFile}
          />
          <p className="hint">Рекомендуется горизонтальный логотип без лишних полей. Высота в шапке — до 64px.</p>

          <ImageUploadField
            label="Эмблема (на страницах статей)"
            value={emblemUrl}
            onChange={setEmblemUrl}
            onUpload={uploadFile}
          />
        </div>

        <div className="admin-card">
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600 }}>Социальные сети</h2>
          <p className="hint" style={{ marginTop: 0, marginBottom: 20 }}>
            Выберите соцсеть из списка, добавьте ссылку и сохраните. До 10 ссылок.
          </p>
          <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} onUpload={uploadFile} />
        </div>

        <AdminButton type="submit" icon="save" variant="primary" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </AdminButton>
      </form>
    </div>
  )
}
