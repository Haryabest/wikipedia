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
  const [siteSubtitle, setSiteSubtitle] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [emblemUrl, setEmblemUrl] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminFetch<{
      siteName?: string
      siteSubtitle?: string | null
      logoUrl?: string | null
      faviconUrl?: string | null
      emblemUrl?: string | null
      siteUrl?: string
      socialLinks?: unknown
    }>('/api/settings')
      .then((s) => {
        setSiteName(s.siteName ?? '')
        setSiteSubtitle(s.siteSubtitle ?? '')
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
          siteSubtitle: siteSubtitle || null,
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

          <label htmlFor="siteName">Название в шапке (крупный текст)</label>
          <input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
          <p className="hint">Например: Эфитека</p>

          <label htmlFor="siteSubtitle">Подзаголовок в шапке</label>
          <input
            id="siteSubtitle"
            value={siteSubtitle}
            onChange={(e) => setSiteSubtitle(e.target.value)}
            placeholder="Эфирия: мир в деталях — путеводитель по вселенной"
          />
          <p className="hint">Мелкий текст под названием. Также используется в SEO.</p>

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
          <p className="hint">Если пусто — используется стандартная иконка или эмблема статьи.</p>

          <ImageUploadField
            label="Логотип (опционально, для других мест)"
            value={logoUrl}
            onChange={setLogoUrl}
            onUpload={uploadFile}
          />

          <ImageUploadField
            label="Эмблема (на страницах статей)"
            value={emblemUrl}
            onChange={setEmblemUrl}
            onUpload={uploadFile}
          />
        </div>

        <div className="admin-card">
          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600 }}>Ссылки в шапке</h2>
          <p className="hint" style={{ marginTop: 0, marginBottom: 20 }}>
            Соцсети, сайты, каналы и другие ресурсы. Выберите из списка (иконка «Сайт» — для обычных ссылок) или «Другое» с кастомной иконкой. До 10 ссылок.
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
