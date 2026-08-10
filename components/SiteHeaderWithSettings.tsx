import { getSiteSettings } from '@/lib/data'
import { parseSocialLinks } from '@/lib/social-links'
import { SiteHeader } from './SiteHeader'

interface SiteHeaderWithSettingsProps {
  showSearch?: boolean
}

export async function SiteHeaderWithSettings({ showSearch = true }: SiteHeaderWithSettingsProps) {
  const settings = await getSiteSettings()

  return (
    <SiteHeader
      siteName={settings.siteName}
      siteSubtitle={settings.siteSubtitle}
      socialLinks={parseSocialLinks(settings.socialLinks)}
      showSearch={showSearch}
    />
  )
}
