import Link from 'next/link'
import { SiteHeaderWithSettings } from '@/components/SiteHeaderWithSettings'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <>
      <SiteHeaderWithSettings showSearch />
      <main className={styles.main}>
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
      </main>
    </>
  )
}
