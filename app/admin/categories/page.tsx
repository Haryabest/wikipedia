'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAdminModal } from '@/components/admin/AdminModalProvider'

interface Category {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
  hidden: boolean
  parentId?: string | null
  parent?: { name: string } | null
  _count?: { articles: number; children: number }
}

export default function AdminCategoriesPage() {
  const modal = useAdminModal()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [parentId, setParentId] = useState('')

  async function load() {
    const res = await fetch('/api/categories')
    setCategories(await res.json())
  }

  useEffect(() => {
    void load()
  }, [])

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    return data.url
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
      }),
    })
    setName('')
    setImageUrl('')
    setParentId('')
    load()
  }

  async function toggleHidden(id: string, hidden: boolean) {
    await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hidden: !hidden }),
    })
    load()
  }

  async function handleDelete(id: string) {
    const ok = await modal.confirm('Удалить категорию?')
    if (!ok) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    load()
  }

  const mainCategories = categories.filter((c) => !c.parentId)

  return (
    <div>
      <h1 className="admin-page-title">Категории</h1>

      <form onSubmit={handleCreate} className="admin-form admin-card">
        <h3>Новая категория</h3>
        <label>Название</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Родительская категория (для подкатегории)</label>
        <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">— Основная категория —</option>
          {mainCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label>Картинка</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ marginBottom: 0, flex: 1 }} />
          <label className="btn">
            Загрузить
            <input type="file" accept="image/*" hidden onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) setImageUrl(await uploadFile(file))
            }} />
          </label>
        </div>
        <button type="submit" className="btn btn--primary">
          {parentId ? 'Добавить подкатегорию' : 'Добавить категорию'}
        </button>
      </form>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Название</th><th>URL</th><th>Тип</th><th>Статей</th><th>Статус</th><th></th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.parent ? `↳ ${c.name}` : c.name}</td>
                <td><code>/category/{c.slug}</code></td>
                <td>{c.parent ? `Подкат. «${c.parent.name}»` : 'Основная'}</td>
                <td>{c._count?.articles ?? 0}</td>
                <td>{c.hidden ? <span className="badge badge--red">Скрыта</span> : <span className="badge badge--green">Видна</span>}</td>
                <td>
                  <button type="button" className="btn" onClick={() => toggleHidden(c.id, c.hidden)}>
                    {c.hidden ? 'Показать' : 'Скрыть'}
                  </button>
                  <button type="button" className="btn btn--danger" onClick={() => handleDelete(c.id)} style={{ marginLeft: 4 }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
