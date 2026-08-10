import { SiteHeaderWithSettings } from '@/components/SiteHeaderWithSettings'
import { ArticleCardSkeleton } from '@/components/ArticleCardSkeleton'
import skeletonStyles from '@/components/ArticleSkeleton.module.css'
import styles from './page.module.css'

export default function LatestArticlesLoading() {
  return (
    <>
      <SiteHeaderWithSettings showSearch />
      <main className={`container ${styles.main}`}>
        <div className={skeletonStyles.skeletonLineSm} style={{ width: 120, marginBottom: 16 }} />
        <div className={skeletonStyles.skeletonLineLg} style={{ width: 260, marginBottom: 28 }} />

        <div className={styles.grid}>
          <ArticleCardSkeleton count={6} />
        </div>
      </main>
    </>
  )
}
