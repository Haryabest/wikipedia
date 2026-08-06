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

  const [emblemUrl, setEmblemUrl] = useState('')

  const [siteUrl, setSiteUrl] = useState('')

  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([])

  const [saving, setSaving] = useState(false)



  useEffect(() => {

    adminFetch<{

      siteName?: string

      logoUrl?: string | null

      emblemUrl?: string | null

      siteUrl?: string

      socialLinks?: unknown

    }>('/api/settings')

      .then((s) => {

        setSiteName(s.siteName ?? '')

        setLogoUrl(s.logoUrl ?? '')

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

          <label htmlFor="siteName">Название сайта</label>

          <input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />



          <label htmlFor="siteUrl">URL сайта (для SEO)</label>

          <input id="siteUrl" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://mydomain.com" />



          <ImageUploadField

            label="Логотип в шапке (картинка целиком, вместо иконки и подписи)"

            value={logoUrl}

            onChange={setLogoUrl}

            onUpload={uploadFile}

          />

          <p className="hint" style={{ marginTop: -8 }}>Если логотип загружен, текстовое название в шапке скрывается и остаётся только для SEO/доступности.</p>



          <ImageUploadField

            label="Эмблема (на каждой странице статьи)"

            value={emblemUrl}

            onChange={setEmblemUrl}

            onUpload={uploadFile}

          />

        </div>



        <div className="admin-card">

          <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600 }}>Социальные сети</h2>

          <p className="hint" style={{ marginTop: 0, marginBottom: 20 }}>

            Выберите соцсеть из списка, добавьте ссылку и сохраните. До 10 ссылок. Иконки отображаются в шапке и футере.

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

