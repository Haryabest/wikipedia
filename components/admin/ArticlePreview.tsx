'use client'

import { ArticleContent } from '@/components/ArticleContent'
import { Infobox } from '@/components/Infobox'
import styles from './ArticlePreview.module.css'

interface InfoboxRow {
  label: string
  value: string
}

interface ArticlePreviewProps {
  title: string
  summary: string
  content: string
  infoboxImageUrl: string
  infoboxCaption: string
  infoboxRows: InfoboxRow[]
}

const emptySlugMap = new Map<string, string>()

export function ArticlePreview({
  title,
  summary,
  content,
  infoboxImageUrl,
  infoboxCaption,
  infoboxRows,
}: ArticlePreviewProps) {
  const visibleRows = infoboxRows.filter((row) => row.label.trim() || row.value.trim())

  return (
    <div className={`admin-card ${styles.panel}`}>
      <h3 className={styles.title}>Предпросмотр статьи</h3>
      <p className="hint">Так статья будет выглядеть на сайте.</p>

      <div className={styles.frame}>
        <h1 className={styles.articleTitle}>{title.trim() || 'Заголовок статьи'}</h1>
        {summary.trim() && <p className={styles.summary}>{summary}</p>}

        <div className={styles.grid}>
          <ArticleContent content={content} articleSlugs={emptySlugMap} />
          {(infoboxImageUrl || visibleRows.length > 0) && (
            <Infobox
              imageUrl={infoboxImageUrl || null}
              caption={infoboxCaption || null}
              rows={visibleRows}
            />
          )}
        </div>
      </div>
    </div>
  )
}
