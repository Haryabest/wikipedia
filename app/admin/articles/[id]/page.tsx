'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArticleForm } from '@/components/admin/ArticleForm'
import { adminFetch } from '@/lib/admin-fetch'

interface ArticleResponse {
  title: string
  slug: string
  summary?: string | null
  metaDescription?: string | null
  categoryId?: string | null
  infoboxImageUrl?: string | null
  infoboxCaption?: string | null
  infoboxRows?: { label: string; value: string }[]
  content?: string
  published: boolean
  hidden: boolean
}

export default function EditArticlePage() {
  const params = useParams()
  const id = params.id as string
  const [initial, setInitial] = useState<Parameters<typeof ArticleForm>[0]['initial']>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminFetch<ArticleResponse>(`/api/articles/${id}`)
      .then((article) => {
        setInitial({
          title: article.title,
          slug: article.slug,
          summary: article.summary ?? '',
          metaDescription: article.metaDescription ?? '',
          categoryId: article.categoryId ?? '',
          infoboxImageUrl: article.infoboxImageUrl ?? '',
          infoboxCaption: article.infoboxCaption ?? '',
          infoboxRows: article.infoboxRows ?? [],
          content: article.content ?? '',
          published: article.published,
          hidden: article.hidden,
        })
      })
      .catch((err: unknown) => {
        if (!(err instanceof Error && err.message === 'Unauthorized')) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить статью')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p>Загрузка...</p>
  if (error) return <p className="form-alert" role="alert">{error}</p>

  return <ArticleForm mode="edit" articleId={id} initial={initial} />
}
