'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAdminModal } from '@/components/admin/AdminModalProvider'

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

  async function load() {
    const [slidesRes, articlesRes] = await Promise.all([
      fetch('/api/carousel'),
      fetch('/api/articles'),
    ])
    setSlides(await slidesRes.json())
    setArticles(await articlesRes.json())
  }

  useEffect(() => {
    void load()
  }, [])

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    return (await res.json()).url
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl,
        caption,
        articleId: articleId || null,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      await modal.alert(data.error ?? 'Ошибка', 'Ошибка')
      return
    }
    setImageUrl('')
    setCaption('')
    setArticleId('')
    load()
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/carousel/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    load()
  }

  async function handleDelete(id: string) {
    const ok = await modal.confirm('Удалить слайд?')
    if (!ok) return
    await fetch(`/api/carousel/${id}`, { method: 'DELETE' })
    load()
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
              Загрузить
              <input type="file" accept="image/*" hidden onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) setImageUrl(await uploadFile(file))
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
          <button type="submit" className="btn btn--primary">Добавить слайд</button>
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
                {s.linkUrl ?? s.article?.slug ? `/wiki/${s.article?.slug}` : 'Без ссылки'}
              </div>
            </div>
            <button type="button" className="btn" onClick={() => toggleActive(s.id, s.active)}>
              {s.active ? 'Активен' : 'Неактивен'}
            </button>
            <button type="button" className="btn btn--danger" onClick={() => handleDelete(s.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
