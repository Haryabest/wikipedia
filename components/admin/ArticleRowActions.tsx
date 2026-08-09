'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminIcon } from '@/components/admin/AdminIcon'
import { AdminIconButton } from '@/components/admin/AdminButton'
import { useAdminModal } from '@/components/admin/AdminModalProvider'
import { adminFetch } from '@/lib/admin-fetch'

interface ArticleRowActionsProps {
  id: string
  title: string
}

export function ArticleRowActions({ id, title }: ArticleRowActionsProps) {
  const router = useRouter()
  const modal = useAdminModal()

  async function handleDelete() {
    const ok = await modal.confirm(`Удалить статью «${title}»?`, 'Удаление статьи')
    if (!ok) return
    try {
      await adminFetch(`/api/articles/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') return
      await modal.alert(err instanceof Error ? err.message : 'Не удалось удалить статью', 'Ошибка')
    }
  }

  return (
    <div className="admin-table-actions">
      <Link href={`/admin/articles/${id}`} className="btn">
        <AdminIcon name="edit" />
        Редактировать
      </Link>
      <AdminIconButton
        icon="trash"
        title="Удалить статью"
        variant="danger"
        onClick={handleDelete}
      />
    </div>
  )
}
