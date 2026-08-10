import styles from './ArticleSkeleton.module.css'

interface ArticleCardSkeletonProps {
  count?: number
}

export function ArticleCardSkeleton({ count = 1 }: ArticleCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.cardSkeleton} aria-hidden>
          <div className={styles.cardSkeletonBody}>
            <div className={styles.cardSkeletonTop}>
              <div className={`${styles.cardSkeletonBadge} ${styles.skeletonPulse}`} />
              <div className={`${styles.cardSkeletonCategory} ${styles.skeletonPulse}`} />
            </div>
            <div className={`${styles.cardSkeletonTitle} ${styles.skeletonPulse}`} />
            <div className={`${styles.cardSkeletonSummary} ${styles.skeletonPulse}`} />
            <div className={`${styles.cardSkeletonSummary} ${styles.skeletonPulse}`} style={{ width: '75%' }} />
            <div className={styles.cardSkeletonFooter}>
              <div className={`${styles.cardSkeletonLink} ${styles.skeletonPulse}`} />
            </div>
          </div>
          <div className={`${styles.cardSkeletonMedia} ${styles.skeletonPulse}`} />
        </div>
      ))}
    </>
  )
}
