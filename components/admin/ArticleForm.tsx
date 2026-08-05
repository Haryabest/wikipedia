'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RichTextEditor } from '@/components/RichTextEditor'
import { autoMetaDescription } from '@/lib/seo'
import { isLegacyContent, parseSections } from '@/lib/wiki'
import styles from './ArticleForm.module.css'

interface Category {
  id: string
  name: string
}

interface InfoboxRow {
  label: string
  value: string
}

interface ArticleFormProps {
  mode: 'create' | 'edit'
  articleId?: string
  initial?: {
    title: string
    slug: string
    summary: string
    metaDescription: string
    categoryId: string
    infoboxImageUrl: string
    infoboxCaption: string
    infoboxRows: InfoboxRow[]
    content: string
    published: boolean
    hidden: boolean
  }
}

function legacyToHtml(content: string): string {
  if (!isLegacyContent(content)) return content
  return parseSections(content)
    .map((s) => `${s.title ? `<h2>${s.title}</h2>` : ''}${s.content}`)
    .join('')
}

export function ArticleForm({ mode, articleId, initial }: ArticleFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? '')
  const [metaTouched, setMetaTouched] = useState(!!initial?.metaDescription)
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [infoboxImageUrl, setInfoboxImageUrl] = useState(initial?.infoboxImageUrl ?? '')
  const [infoboxCaption, setInfoboxCaption] = useState(initial?.infoboxCaption ?? '')
  const [infoboxRows, setInfoboxRows] = useState<InfoboxRow[]>(initial?.infoboxRows ?? [])
  const [content, setContent] = useState(initial ? legacyToHtml(initial.content) : '')
  const [published, setPublished] = useState(initial?.published ?? false)
  const [hidden, setHidden] = useState(initial?.hidden ?? false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories)
  }, [])

  const computedMeta = useMemo(
    () => autoMetaDescription(summary, content, title),
    [summary, content, title]
  )

  const displayMeta = metaTouched ? metaDescription : computedMeta

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.url
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      title,
      slug: slug || undefined,
      summary,
      metaDescription: displayMeta || computedMeta,
      categoryId: categoryId || null,
      infoboxImageUrl: infoboxImageUrl || null,
      infoboxCaption,
      content,
      infoboxRows,
      published,
      hidden,
    }

    const res = await fetch(
      mode === 'create' ? '/api/articles' : `/api/articles/${articleId}`,
      {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (res.ok) {
      const article = await res.json()
      if (mode === 'create') {
        router.push(`/admin/articles/${article.id}`)
      } else {
        router.refresh()
        alert('Сохранено')
      }
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!articleId || !confirm('Удалить статью?')) return
    await fetch(`/api/articles/${articleId}`, { method: 'DELETE' })
    router.push('/admin/articles')
  }

  return (
    <div>
      <Link href="/admin/articles" className={styles.back}>← Назад к списку</Link>
      <h1 className="admin-page-title">
        {mode === 'create' ? 'Новая статья' : `Редактирование: ${title}`}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className={styles.layout}>
          <div className={styles.main}>
            <div className="admin-card admin-form">
              <label>Заголовок</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />

              {mode === 'edit' && (
                <>
                  <label>URL (slug)</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} />
                </>
              )}

              <label>Краткое описание</label>
              <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Отображается под заголовком" />

              <label>Meta description (SEO) — заполняется автоматически</label>
              <textarea
                value={displayMeta}
                onChange={(e) => { setMetaDescription(e.target.value); setMetaTouched(true) }}
                rows={2}
              />
              <p className="hint">Авто: {computedMeta.slice(0, 100)}…</p>

              <label>Категория</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">— Без категории —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <label>Текст статьи</label>
              <RichTextEditor content={content} onChange={setContent} onUploadImage={uploadFile} />
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={`admin-card admin-form ${styles.infoboxPanel}`}>
              <h3 className={styles.infoboxTitle}>Инфобокс</h3>
              <p className="hint">Боковая панель как в Wikipedia — фото, подпись и факты.</p>

              <label>Фото</label>
              {infoboxImageUrl && (
                <img src={infoboxImageUrl} alt="" className={styles.infoboxPreview} />
              )}
              <div className={styles.uploadRow}>
                <input value={infoboxImageUrl} onChange={(e) => setInfoboxImageUrl(e.target.value)} placeholder="URL" />
                <label className="btn">
                  Загрузить
                  <input type="file" accept="image/*" hidden onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) setInfoboxImageUrl(await uploadFile(file))
                  }} />
                </label>
              </div>

              <label>Подпись к фото</label>
              <input value={infoboxCaption} onChange={(e) => setInfoboxCaption(e.target.value)} placeholder="Подпись под изображением" />

              <label>Строки фактов</label>
              {infoboxRows.map((row, i) => (
                <div key={i} className={styles.infoboxRow}>
                  <input placeholder="Поле" value={row.label} onChange={(e) => {
                    const copy = [...infoboxRows]
                    copy[i] = { ...copy[i], label: e.target.value }
                    setInfoboxRows(copy)
                  }} />
                  <input placeholder="Значение" value={row.value} onChange={(e) => {
                    const copy = [...infoboxRows]
                    copy[i] = { ...copy[i], value: e.target.value }
                    setInfoboxRows(copy)
                  }} />
                  <button type="button" className="btn btn--danger" onClick={() => setInfoboxRows(infoboxRows.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              <button type="button" className="btn" onClick={() => setInfoboxRows([...infoboxRows, { label: '', value: '' }])}>
                + Добавить строку
              </button>
            </div>

            <div className="admin-card admin-form">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                Опубликовать
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                Скрыть с сайта
              </label>

              <div className="admin-actions" style={{ marginTop: 16 }}>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
                </button>
                {mode === 'edit' && (
                  <button type="button" className="btn btn--danger" onClick={handleDelete}>Удалить</button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}
