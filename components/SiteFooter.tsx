import Link from 'next/link'
import { SocialLinks } from '@/components/SocialLinks'
import { getSiteSettings } from '@/lib/data'
import { parseSocialLinks } from '@/lib/social-links'
import styles from './SiteFooter.module.css'

export async function SiteFooter() {
  const settings = await getSiteSettings()
  const socialLinks = parseSocialLinks(settings.socialLinks)
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <SocialLinks links={socialLinks} variant="footer" />

        <div className={styles.bottom}>
          <span className={styles.brand}>© {year} {settings.siteName}</span>
          <nav className={styles.links} aria-label="Юридическая информация">
            <Link href="/privacy">Политика конфиденциальности</Link>
            <Link href="/terms">Пользовательское соглашение</Link>
          </nav>
        </div>

        <p className={styles.notice}>
          Материалы сайта носят информационный характер. При использовании
          материалов ссылка на «{settings.siteName}» обязательна.
        </p>
      </div>
    </footer>
  )
}
