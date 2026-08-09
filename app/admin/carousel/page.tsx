'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { AdminButton, AdminIconButton } from '@/components/admin/AdminButton'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useAdminModal } from '@/components/admin/AdminModalProvider'
import { adminFetch } from '@/lib/admin-fetch'
import { normalizeMediaUrl } from '@/lib/media-url'

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

const MAX_SLIDES = 10

export default function AdminCarouselPage() {
  const modal = useAdminModal()
  const [slides, setSlides] = useState<Slide[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [articleId, setArticleId] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [editArticleId, setEditArticleId] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

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

  function startEdit(slide: Slide) {
    setEditingId(slide.id)
    setEditImageUrl(slide.imageUrl)
    setEditCaption(slide.caption ?? '')
    setEditArticleId(slide.articleId ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditImageUrl('')
    setEditCaption('')
    setEditArticleId('')
  }

  async function handleUpdate(e: FormEvent, id: string) {
    e.preventDefault()
    if (!editImageUrl.trim()) {
      await modal.alert('Укажите изображение', 'Ошибка')
      return
    }
    setSavingEdit(true)
    try {
      await adminFetch(`/api/carousel/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: editImageUrl,
          caption: editCaption,
          articleId: editArticleId || null,
        }),
      })
      cancelEdit()
      await load()
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось сохранить слайд', 'Ошибка')
    } finally {
      setSavingEdit(false)
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
    if (editingId === id) cancelEdit()
    try {
      await adminFetch(`/api/carousel/${id}`, { method: 'DELETE' })
      await load()
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось удалить слайд', 'Ошибка')
    }
  }

  const atLimit = slides.length >= MAX_SLIDES

  return (
    <div>
      <h1 className="admin-page-title">Карусель ({slides.length}/{MAX_SLIDES})</h1>
      <p className="hint">Слайды меняются каждые 7 секунд. Клик по арту ведёт на статью.</p>

      {atLimit ? (
        <div className="form-alert" role="status">
          Достигнут лимит {MAX_SLIDES} слайдов. Удалите слайд, чтобы добавить новый, или отредактируйте существующий.
        </div>
      ) : (
        <form onSubmit={handleCreate} className="admin-form admin-card">
          <h3 style={{ margin: '0 0 16px' }}>Новый слайд</h3>
          <ImageUploadField
            label="Изображение (арт)"
            value={imageUrl}
            onChange={setImageUrl}
            onUpload={uploadFile}
          />
          <label>Подпись</label>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} />
          <label>Статья (куда перекидывает при клике)</label>
          <select value={articleId} onChange={(e) => setArticleId(e.target.value)}>
            <option value="">— Без ссылки —</option>
            {articles.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
          <AdminButton type="submit" icon="plus" variant="primary" disabled={!imageUrl.trim()}>
            Добавить слайд
          </AdminButton>
        </form>
      )}

      <div className="admin-card">
        {slides.length === 0 && <p className="hint">Слайдов пока нет.</p>}
        {slides.map((s) => (
          <div key={s.id} className="admin-carousel-slide">
            {editingId === s.id ? (
              <form onSubmit={(e) => handleUpdate(e, s.id)} className="admin-form admin-carousel-edit">
                <ImageUploadField
                  label="Изображение (арт)"
                  value={editImageUrl}
                  onChange={setEditImageUrl}
                  onUpload={uploadFile}
                />
                <label>Подпись</label>
                <input value={editCaption} onChange={(e) => setEditCaption(e.target.value)} />
                <label>Статья (куда перекидывает при клике)</label>
                <select value={editArticleId} onChange={(e) => setEditArticleId(e.target.value)}>
                  <option value="">— Без ссылки —</option>
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
                <div className="admin-table-actions">
                  <AdminButton type="submit" icon="save" variant="primary" disabled={savingEdit || !editImageUrl.trim()}>
                    Сохранить
                  </AdminButton>
                  <AdminButton type="button" icon="x" onClick={cancelEdit} disabled={savingEdit}>
                    Отмена
                  </AdminButton>
                </div>
              </form>
            ) : (
              <>
                <img
                  src={normalizeMediaUrl(s.imageUrl) ?? s.imageUrl}
                  alt=""
                  className="admin-carousel-thumb"
                />
                <div className="admin-carousel-info">
                  <div>{s.caption ?? '—'}</div>
                  <div className="admin-carousel-link">
                    {s.linkUrl ?? (s.article ? `/wiki/${s.article.slug}` : 'Без ссылки')}
                  </div>
                </div>
                <div className="admin-table-actions">
                  <AdminButton type="button" icon="edit" onClick={() => startEdit(s)}>
                    Редактировать
                  </AdminButton>
                  <AdminButton type="button" icon={s.active ? 'eye' : 'eyeOff'} onClick={() => toggleActive(s.id, s.active)}>
                    {s.active ? 'Активен' : 'Неактивен'}
                  </AdminButton>
                  <AdminIconButton icon="trash" title="Удалить слайд" variant="danger" onClick={() => handleDelete(s.id)} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
