'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { AdminIcon } from '@/components/admin/AdminIcon'
import { AdminButton, AdminIconButton } from '@/components/admin/AdminButton'
import { useAdminModal } from '@/components/admin/AdminModalProvider'
import { adminFetch } from '@/lib/admin-fetch'

interface Article {
  id: string
  title: string
  slug: string
}

interface Slide {
  id: string
  imageUrl: string
  caption?: string | null
  linkUrl?: string | null
  articleId?: string | null
  active: boolean
  article?: { title: string; slug: string } | null
}

export default function AdminCarouselPage() {
  const modal = useAdminModal()
  const [slides, setSlides] = useState<Slide[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [articleId, setArticleId] = useState('')

  const load = useCallback(async () => {
    try {
      const [slidesData, articlesData] = await Promise.all([
        adminFetch<Slide[]>('/api/carousel'),
        adminFetch<Article[]>('/api/articles'),
      ])
      setSlides(slidesData)
      setArticles(articlesData)
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось загрузить карусель', 'Ошибка')
    }
  }, [modal])

  useEffect(() => {
    void load()
  }, [load])

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const data = await adminFetch<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    return data.url
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    try {
      await adminFetch('/api/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          caption,
          articleId: articleId || null,
        }),
      })
      setImageUrl('')
      setCaption('')
      setArticleId('')
      await load()
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось создать слайд', 'Ошибка')
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      await adminFetch(`/api/carousel/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      })
      await load()
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось обновить слайд', 'Ошибка')
    }
  }

  async function handleDelete(id: string) {
    const ok = await modal.confirm('Удалить слайд?')
    if (!ok) return
    try {
      await adminFetch(`/api/carousel/${id}`, { method: 'DELETE' })
      await load()
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось удалить слайд', 'Ошибка')
    }
  }

  return (
    <div>
      <h1 className="admin-page-title">Карусель ({slides.length}/10)</h1>
      <p className="hint">Слайды меняются каждые 7 секунд. Клик по арту ведёт на статью.</p>

      {slides.length < 10 && (
        <form onSubmit={handleCreate} className="admin-form admin-card">
          <label>Изображение (арт)</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required style={{ marginBottom: 0, flex: 1 }} />
            <label className="btn">
              <AdminIcon name="upload" />
              Загрузить
              <input type="file" accept="image/*" hidden onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                try {
                  setImageUrl(await uploadFile(file))
                } catch (err: unknown) {
                  if (err instanceof Error && err.message === 'Unauthorized') return
                  await modal.alert(err instanceof Error ? err.message : 'Не удалось загрузить изображение', 'Ошибка')
                }
              }} />
            </label>
          </div>
          <label>Подпись</label>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} />
          <label>Статья (куда перекидывает при клике)</label>
          <select value={articleId} onChange={(e) => setArticleId(e.target.value)}>
            <option value="">— Без ссылки —</option>
            {articles.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
          <AdminButton type="submit" icon="plus" variant="primary">Добавить слайд</AdminButton>
        </form>
      )}

      <div className="admin-card">
        {slides.length === 0 && <p className="hint">Слайдов пока нет.</p>}
        {slides.map((s) => (
          <div key={s.id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <img src={s.imageUrl} alt="" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 6 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div>{s.caption ?? '—'}</div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {s.linkUrl ?? (s.article ? `/wiki/${s.article.slug}` : 'Без ссылки')}
              </div>
            </div>
            <AdminButton type="button" icon={s.active ? 'eye' : 'eyeOff'} onClick={() => toggleActive(s.id, s.active)}>
              {s.active ? 'Активен' : 'Неактивен'}
            </AdminButton>
            <AdminIconButton icon="trash" title="Удалить слайд" variant="danger" onClick={() => handleDelete(s.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
