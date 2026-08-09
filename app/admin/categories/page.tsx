'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { AdminIcon } from '@/components/admin/AdminIcon'
import { AdminButton, AdminIconButton } from '@/components/admin/AdminButton'
import { useAdminModal } from '@/components/admin/AdminModalProvider'
import { adminFetch } from '@/lib/admin-fetch'

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

  const load = useCallback(async () => {
    try {
      setCategories(await adminFetch<Category[]>('/api/categories'))
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось загрузить категории', 'Ошибка')
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
      await adminFetch('/api/categories', {
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
      await load()
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось создать категорию', 'Ошибка')
    }
  }

  async function toggleHidden(id: string, hidden: boolean) {
    try {
      await adminFetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: !hidden }),
      })
      await load()
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось обновить категорию', 'Ошибка')
    }
  }

  async function handleDelete(id: string) {
    const ok = await modal.confirm('Удалить категорию?')
    if (!ok) return
    try {
      await adminFetch(`/api/categories/${id}`, { method: 'DELETE' })
      await load()
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось удалить категорию', 'Ошибка')
    }
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
        <AdminButton type="submit" icon="plus" variant="primary">
          {parentId ? 'Добавить подкатегорию' : 'Добавить категорию'}
        </AdminButton>
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
                <td className="admin-table-actions">
                  <AdminButton
                    type="button"
                    icon={c.hidden ? 'eye' : 'eyeOff'}
                    onClick={() => toggleHidden(c.id, c.hidden)}
                  >
                    {c.hidden ? 'Показать' : 'Скрыть'}
                  </AdminButton>
                  <AdminIconButton
                    icon="trash"
                    title="Удалить категорию"
                    variant="danger"
                    onClick={() => handleDelete(c.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
