'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArticleForm } from '@/components/admin/ArticleForm'

export default function EditArticlePage() {
  const params = useParams()
  const id = params.id as string
  const [initial, setInitial] = useState<Parameters<typeof ArticleForm>[0]['initial']>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
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
        setLoading(false)
      })
  }, [id])

  if (loading) return <p>Загрузка...</p>

  return <ArticleForm mode="edit" articleId={id} initial={initial} />
}
