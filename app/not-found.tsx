import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Wiki'

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>{siteName}</Link>
        <Link href="/search" className={styles.searchLink}>Поиск</Link>
      </header>
      <div className={styles.main}>
        <div className={styles.content}>
          <div className={styles.code} aria-hidden>404</div>
          <h1 className={styles.title}>Страница не найдена</h1>
          <p className={styles.text}>
            Возможно, статья была удалена, скрыта или ещё не создана.
            Попробуйте поиск или вернитесь на главную.
          </p>
          <div className={styles.actions}>
            <Link href="/" className="btn btn--primary">На главную</Link>
            <Link href="/search" className="btn">Поиск по wiki</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
