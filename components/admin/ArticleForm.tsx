'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RichTextEditor } from '@/components/RichTextEditor'
import { autoMetaDescription } from '@/lib/seo'
import { isLegacyContent, parseSections } from '@/lib/wiki'
import { validateForPublish, type FieldErrors, type PublishField } from '@/lib/article-validation'
import styles from './ArticleForm.module.css'

interface Category {
  id: string
  name: string
  parentId?: string | null
  parent?: { name: string } | null
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

function fieldClass(errors: FieldErrors, field: PublishField): string {
  return errors[field] ? 'input-error' : ''
}

export function ArticleForm({ mode, articleId, initial }: ArticleFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? '')
  const [metaTouched, setMetaTouched] = useState(!!initial?.metaDescription)
  const [mainCategoryId, setMainCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [infoboxImageUrl, setInfoboxImageUrl] = useState(initial?.infoboxImageUrl ?? '')
  const [infoboxCaption, setInfoboxCaption] = useState(initial?.infoboxCaption ?? '')
  const [infoboxRows, setInfoboxRows] = useState<InfoboxRow[]>(initial?.infoboxRows ?? [])
  const [content, setContent] = useState(initial ? legacyToHtml(initial.content) : '')
  const [published, setPublished] = useState(initial?.published ?? false)
  const [hidden, setHidden] = useState(initial?.hidden ?? false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')

  const hasSubcategories = useMemo(
    () => categories.some((c) => c.parentId === mainCategoryId),
    [categories, mainCategoryId]
  )

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((cats: Category[]) => {
      setCategories(cats)
      if (initial?.categoryId) {
        const selected = cats.find((c) => c.id === initial.categoryId)
        if (selected?.parentId) {
          setMainCategoryId(selected.parentId)
          setSubcategoryId(selected.id)
        } else if (selected) {
          setMainCategoryId(selected.id)
        }
      }
    })
  }, [initial?.categoryId])

  const computedMeta = useMemo(
    () => autoMetaDescription(summary, content, title),
    [summary, content, title]
  )

  const displayMeta = metaTouched ? metaDescription : computedMeta

  function clearFieldError(field: PublishField) {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function runValidation(wantPublish: boolean): FieldErrors {
    if (!wantPublish) return {}
    return validateForPublish({
      title,
      summary,
      content,
      mainCategoryId,
      subcategoryId,
      infoboxImageUrl,
      hasSubcategories,
    })
  }

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
    setSubmitError('')

    const validationErrors = runValidation(published)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    setErrors({})
    setSaving(true)

    const payload = {
      title,
      slug: slug || undefined,
      summary,
      metaDescription: displayMeta || computedMeta,
      categoryId: subcategoryId || mainCategoryId || null,
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

    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      if (mode === 'create') {
        router.push(`/admin/articles/${data.id}`)
      } else {
        router.refresh()
        alert('Сохранено')
      }
    } else {
      if (data.fields && typeof data.fields === 'object') {
        setErrors(data.fields as FieldErrors)
      }
      setSubmitError(typeof data.error === 'string' ? data.error : 'Не удалось сохранить статью')
    }

    setSaving(false)
  }

  async function handleDelete() {
    if (!articleId || !confirm('Удалить статью?')) return
    await fetch(`/api/articles/${articleId}`, { method: 'DELETE' })
    router.push('/admin/articles')
  }

  const errorList = Object.values(errors)

  return (
    <div>
      <Link href="/admin/articles" className={styles.back}>← Назад к списку</Link>
      <h1 className="admin-page-title">
        {mode === 'create' ? 'Новая статья' : `Редактирование: ${title}`}
      </h1>

      {errorList.length > 0 && (
        <div className="form-alert" role="alert">
          <strong>Статья не может быть опубликована</strong>
          <ul>
            {errorList.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {submitError && (
        <div className="form-alert" role="alert">{submitError}</div>
      )}

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className={styles.layout}>
          <div className={styles.main}>
            <div className="admin-card admin-form">
              <label htmlFor="title">Заголовок *</label>
              <input
                id="title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); clearFieldError('title') }}
                className={fieldClass(errors, 'title')}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}

              {mode === 'edit' && (
                <>
                  <label htmlFor="slug">URL (slug)</label>
                  <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </>
              )}

              <label htmlFor="summary">Краткое описание *</label>
              <input
                id="summary"
                value={summary}
                onChange={(e) => { setSummary(e.target.value); clearFieldError('summary') }}
                placeholder="Отображается под заголовком и в карточках категорий"
                className={fieldClass(errors, 'summary')}
              />
              {errors.summary && <span className="field-error">{errors.summary}</span>}

              <label htmlFor="meta">Meta description (SEO) — заполняется автоматически</label>
              <textarea
                id="meta"
                value={displayMeta}
                onChange={(e) => { setMetaDescription(e.target.value); setMetaTouched(true) }}
                rows={2}
              />
              <p className="hint">Авто: {computedMeta.slice(0, 100)}…</p>

              <label htmlFor="category">Категория *</label>
              <select
                id="category"
                value={mainCategoryId}
                onChange={(e) => {
                  setMainCategoryId(e.target.value)
                  setSubcategoryId('')
                  clearFieldError('mainCategoryId')
                  clearFieldError('subcategoryId')
                }}
                className={fieldClass(errors, 'mainCategoryId')}
              >
                <option value="">— Выберите категорию —</option>
                {categories.filter((c) => !c.parentId).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.mainCategoryId && <span className="field-error">{errors.mainCategoryId}</span>}

              {hasSubcategories && (
                <>
                  <label htmlFor="subcategory">Подкатегория *</label>
                  <select
                    id="subcategory"
                    value={subcategoryId}
                    onChange={(e) => { setSubcategoryId(e.target.value); clearFieldError('subcategoryId') }}
                    className={fieldClass(errors, 'subcategoryId')}
                  >
                    <option value="">— Выберите подкатегорию —</option>
                    {categories.filter((c) => c.parentId === mainCategoryId).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.subcategoryId && <span className="field-error">{errors.subcategoryId}</span>}
                </>
              )}

              <label>Текст статьи *</label>
              <div className={`${styles.editorWrap} ${errors.content ? 'input-error' : ''}`} style={errors.content ? { border: '1px solid #dc2626', borderRadius: 8, boxShadow: '0 0 0 3px rgba(220,38,38,0.12)' } : undefined}>
                <RichTextEditor
                  content={content}
                  onChange={(v) => { setContent(v); clearFieldError('content') }}
                  onUploadImage={uploadFile}
                />
              </div>
              {errors.content && <span className="field-error">{errors.content}</span>}
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={`admin-card admin-form ${styles.infoboxPanel}`}>
              <h3 className={styles.infoboxTitle}>Инфобокс</h3>
              <p className="hint">Основное фото статьи — показывается в карточках категорий справа.</p>

              <label>Фото *</label>
              {infoboxImageUrl && (
                <img src={infoboxImageUrl} alt="" className={styles.infoboxPreview} />
              )}
              <div className={styles.uploadRow}>
                <input
                  value={infoboxImageUrl}
                  onChange={(e) => { setInfoboxImageUrl(e.target.value); clearFieldError('infoboxImageUrl') }}
                  placeholder="URL или загрузите файл"
                  className={fieldClass(errors, 'infoboxImageUrl')}
                />
                <label className="btn">
                  Загрузить
                  <input type="file" accept="image/*" hidden onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setInfoboxImageUrl(await uploadFile(file))
                      clearFieldError('infoboxImageUrl')
                    }
                  }} />
                </label>
              </div>
              {errors.infoboxImageUrl && <span className="field-error">{errors.infoboxImageUrl}</span>}

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
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => {
                    setPublished(e.target.checked)
                    if (!e.target.checked) setErrors({})
                  }}
                />
                Опубликовать
              </label>
              <p className="hint">При публикации обязательны: заголовок, описание, текст, категория и фото.</p>
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
