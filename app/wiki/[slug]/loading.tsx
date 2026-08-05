import { SiteHeader } from '@/components/SiteHeader'
import styles from '@/components/ArticleSkeleton.module.css'

export default function ArticleLoading() {
  return (
    <>
      <SiteHeader siteName="Wiki" />
      <div className={`container ${styles.wrapper}`}>
        <div className={`${styles.skeletonLineLg} ${styles.skeletonPulse}`} />
        <div className={`${styles.skeletonLineSm} ${styles.skeletonPulse}`} />
        <div style={{ height: 24 }} />
        <div className={`${styles.skeletonLineMd} ${styles.skeletonPulse}`} style={{ width: '40%' }} />

        <div className={styles.skeletonInfobox}>
          <div className={`${styles.skeletonBlock} ${styles.skeletonPulse}`} style={{ height: 160 }} />
          <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '80%' }} />
        </div>

        <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '85%' }} />
        <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '70%' }} />
        <div style={{ height: 24 }} />
        <div className={`${styles.skeletonLineLg} ${styles.skeletonPulse}`} style={{ height: 22, width: '35%' }} />
        <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '90%' }} />
      </div>
    </>
  )
}
