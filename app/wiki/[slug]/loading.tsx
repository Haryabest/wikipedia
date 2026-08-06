import { SiteHeaderWithSettings } from '@/components/SiteHeaderWithSettings'

export default function WikiLoading() {
  return (
    <>
      <SiteHeaderWithSettings />
      <main className="container" style={{ padding: '48px 0' }}>
        <p>Загрузка статьи...</p>
      </main>
    </>
  )
}
