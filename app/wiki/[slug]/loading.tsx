import { SiteHeaderWithSettings } from '@/components/SiteHeaderWithSettings'
import { ArticleSkeleton } from '@/components/ArticleSkeleton'

export default function WikiLoading() {
  return (
    <>
      <SiteHeaderWithSettings />
      <main className="container">
        <ArticleSkeleton />
      </main>
    </>
  )
}
