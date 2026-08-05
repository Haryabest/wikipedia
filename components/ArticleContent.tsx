import { renderArticleHtml, extractHeadingsFromContent } from '@/lib/wiki'
import { WikiImage } from './WikiImage'
import styles from './ArticleContent.module.css'

interface ArticleContentProps {
  content: string
  articleSlugs: Map<string, string>
  emblemUrl?: string | null
}

export function ArticleContent({ content, articleSlugs, emblemUrl }: ArticleContentProps) {
  const html = renderArticleHtml(content, articleSlugs)

  return (
    <article className={styles.article}>
      {emblemUrl && (
        <WikiImage src={emblemUrl} alt="" className={styles.emblem} />
      )}
      {html ? (
        <div
          className={`article-content ${styles.body}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className={styles.empty}>Содержимое статьи пока не добавлено.</p>
      )}
    </article>
  )
}

export { extractHeadingsFromContent as extractHeadings }
