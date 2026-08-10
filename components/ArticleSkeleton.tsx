import styles from './ArticleSkeleton.module.css'

export function ArticleSkeleton() {
  return (
    <div className={styles.wrapper} aria-hidden>
      <div className={`${styles.skeletonLineSm} ${styles.skeletonPulse}`} style={{ width: '140px' }} />
      <div className={`${styles.skeletonLineLg} ${styles.skeletonPulse}`} />
      <div className={`${styles.skeletonLineMd} ${styles.skeletonPulse}`} />
      <div className={styles.articleLayout}>
        <div className={styles.articleMain}>
          <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '85%' }} />
          <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '70%' }} />
          <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '92%' }} />
        </div>
        <div className={styles.skeletonInfobox}>
          <div className={`${styles.skeletonBlock} ${styles.skeletonPulse}`} style={{ height: 180, marginBottom: 12 }} />
          <div className={`${styles.skeletonLineSm} ${styles.skeletonPulse}`} />
          <div className={`${styles.skeletonLineSm} ${styles.skeletonPulse}`} />
          <div className={`${styles.skeletonLineSm} ${styles.skeletonPulse}`} style={{ width: '80%' }} />
        </div>
      </div>
    </div>
  )
}
