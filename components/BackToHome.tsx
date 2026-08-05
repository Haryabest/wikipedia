import Link from 'next/link'
import styles from './BackToHome.module.css'

export function BackToHome() {
  return (
    <Link href="/" className={styles.link}>
      ← К выбору категорий
    </Link>
  )
}
