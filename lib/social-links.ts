export interface SocialLinkItem {
  imageUrl: string
  url: string
  label?: string
  iconFile?: string | null
}

export const MAX_SOCIAL_LINKS = 10
export const CUSTOM_SOCIAL_LABEL = 'Другое'

const SOCIAL_ICON_LABELS: Record<string, string> = {
  'AdobeIllustrator.svg': 'Adobe Illustrator',
  'AdobePhotoshop.svg': 'Adobe Photoshop',
  'AdobeXD.svg': 'Adobe XD',
  'Aim.svg': 'AOL Instant Messenger',
  'Airbnb.svg': 'Airbnb',
  'Amazon.svg': 'Amazon',
  'Android.svg': 'Android',
  'Apple.svg': 'Apple',
  'Atlassian.svg': 'Atlassian',
  'Badoo.svg': 'Badoo',
  'Basecamp.svg': 'Basecamp',
  'Behance.svg': 'Behance',
  'Bing.svg': 'Bing',
  'Bitbucket.svg': 'Bitbucket',
  'Bitcoin.svg': 'Bitcoin',
  'Bittorrent.svg': 'BitTorrent',
  'Blogger.svg': 'Blogger',
  'Buffer.svg': 'Buffer',
  'BuzzFeed.svg': 'BuzzFeed',
  'Codeopen.svg': 'CodePen',
  'Confluence.svg': 'Confluence',
  'Coub.svg': 'Coub',
  'Creativemarket.svg': 'Creative Market',
  'Dailymotion.svg': 'Dailymotion',
  'Digg.svg': 'Digg',
  'Discord.svg': 'Discord',
  'Dribbble.svg': 'Dribbble',
  'Dropbox.svg': 'Dropbox',
  'Drupal.svg': 'Drupal',
  'DuckDuckGo.svg': 'DuckDuckGo',
  'Edge.svg': 'Microsoft Edge',
  'Epic Games.svg': 'Epic Games',
  'Ethereum.svg': 'Ethereum',
  'Evernote.svg': 'Evernote',
  'Facebook.svg': 'Facebook',
  'Fancy.svg': 'Fancy',
  'Figma.svg': 'Figma',
  'Firefox.svg': 'Firefox',
  'Flickr.svg': 'Flickr',
  'Folio.svg': 'Folio',
  'Foursquare.svg': 'Foursquare',
  'Framer.svg': 'Framer',
  'Github.svg': 'GitHub',
  'Gmail.svg': 'Gmail',
  'Google.svg': 'Google',
  'GooglePlay.svg': 'Google Play',
  'HTML5.svg': 'HTML5',
  'Hola.svg': 'Hola',
  'Iconjar.svg': 'Iconjar',
  'Instagram.svg': 'Instagram',
  'Intercom.svg': 'Intercom',
  'Invision.svg': 'InVision',
  'Jira.svg': 'Jira',
  'Kaixin001.svg': 'Kaixin001',
  'KakaoTalk.svg': 'KakaoTalk',
  'Kickstarter.svg': 'Kickstarter',
  'Line.svg': 'LINE',
  'LinkedIN.svg': 'LinkedIn',
  'MailChimp.svg': 'Mailchimp',
  'Mail_ru.svg': 'Mail.ru',
  'Marvel.svg': 'Marvel',
  'Mastercard.svg': 'Mastercard',
  'Medium.svg': 'Medium',
  'Messenger.svg': 'Messenger',
  'Mi.svg': 'Xiaomi',
  'Microsoft.svg': 'Microsoft',
  'Miliao.svg': 'Miliao',
  'Netflix.svg': 'Netflix',
  'Nintendo.svg': 'Nintendo',
  'Notion.svg': 'Notion',
  'OK.svg': 'Одноклассники',
  'Opera.svg': 'Opera',
  'Outlook.svg': 'Outlook',
  'Patreon.svg': 'Patreon',
  'PayPal.svg': 'PayPal',
  'Periscope.svg': 'Periscope',
  'Pinterest.svg': 'Pinterest',
  'Playstation.svg': 'PlayStation',
  'Pocket.svg': 'Pocket',
  'ProductHunt.svg': 'Product Hunt',
  'QQ.svg': 'QQ',
  'Quora.svg': 'Quora',
  'RSS.svg': 'RSS',
  'Reddit.svg': 'Reddit',
  'Renren.svg': 'Renren',
  'Safari.svg': 'Safari',
  'Shopify.svg': 'Shopify',
  'Shutterstock.svg': 'Shutterstock',
  'Sketch.svg': 'Sketch',
  'Skype.svg': 'Skype',
  'Slack.svg': 'Slack',
  'Snapchat.svg': 'Snapchat',
  'Spotify.svg': 'Spotify',
  'Stackoverflow.svg': 'Stack Overflow',
  'Steam.svg': 'Steam',
  'Strava.svg': 'Strava',
  'StumbleUpon.svg': 'StumbleUpon',
  'Taobao.svg': 'Taobao',
  'TeamViewer.svg': 'TeamViewer',
  'Telegram.svg': 'Telegram',
  'Tidal.svg': 'Tidal',
  'Tik Tok.svg': 'TikTok',
  'Tilda.svg': 'Tilda',
  'Tinder.svg': 'Tinder',
  'Tor.svg': 'Tor',
  'Treehouse.svg': 'Treehouse',
  'Trello.svg': 'Trello',
  'Tripadvisor.svg': 'TripAdvisor',
  'Tumblr.svg': 'Tumblr',
  'Twitch.svg': 'Twitch',
  'Twitter.svg': 'Twitter / X',
  'Ubuntu.svg': 'Ubuntu',
  'Uplabs.svg': 'UpLabs',
  'Utorrent.svg': 'uTorrent',
  'VK.svg': 'VK',
  'Viadeo.svg': 'Viadeo',
  'Viber.svg': 'Viber',
  'Vimeo.svg': 'Vimeo',
  'Vine.svg': 'Vine',
  'Visa.svg': 'Visa',
  'WWW.svg': 'Сайт',
  'Wechat.svg': 'WeChat',
  'Weibo.svg': 'Weibo',
  'WhatsApp.svg': 'WhatsApp',
  'Windows.svg': 'Windows',
  'Wordpress.svg': 'WordPress',
  'Xbox.svg': 'Xbox',
  'YandexBrowser.svg': 'Яндекс',
  'Yelp.svg': 'Yelp',
  'Youtube.svg': 'YouTube',
  'Zendesk.svg': 'Zendesk',
  'Zerpply.svg': 'Zerply',
  'Zoom.svg': 'Zoom',
  'ui8.svg': 'UI8',
}

export interface SocialNetworkOption {
  label: string
  iconFile: string
}

export const SOCIAL_NETWORK_OPTIONS: SocialNetworkOption[] = Object.entries(SOCIAL_ICON_LABELS)
  .map(([iconFile, label]) => ({ label, iconFile }))
  .sort((a, b) => a.label.localeCompare(b.label, 'ru'))

const labelToIconFile = new Map(SOCIAL_NETWORK_OPTIONS.map((option) => [option.label, option.iconFile]))

export function socialIconUrl(iconFile: string): string {
  return `/images/social/${encodeURIComponent(iconFile)}`
}

export function getIconFileForLabel(label: string | undefined): string | null {
  if (!label || label === CUSTOM_SOCIAL_LABEL) return null
  return labelToIconFile.get(label) ?? null
}

export function createSocialLinkFromOption(option: SocialNetworkOption, url: string): SocialLinkItem {
  return {
    label: option.label,
    iconFile: option.iconFile,
    imageUrl: socialIconUrl(option.iconFile),
    url,
  }
}

export function normalizeSocialLink(link: SocialLinkItem): SocialLinkItem {
  const label = link.label?.trim() || ''
  const iconFile = link.iconFile ?? getIconFileForLabel(label)

  if (!iconFile || label === CUSTOM_SOCIAL_LABEL) {
    return { ...link, label, iconFile: null }
  }

  return {
    ...link,
    label,
    iconFile,
    imageUrl: socialIconUrl(iconFile),
  }
}

export function parseSocialLinks(raw: unknown): SocialLinkItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is SocialLinkItem => {
      if (!item || typeof item !== 'object') return false
      const link = item as SocialLinkItem
      return (
        typeof link.url === 'string' &&
        (typeof link.imageUrl === 'string' || typeof link.iconFile === 'string')
      )
    })
    .map(normalizeSocialLink)
    .filter((link) => link.url.trim())
    .slice(0, MAX_SOCIAL_LINKS)
}

export function isSocialLinkComplete(link: SocialLinkItem): boolean {
  if (!link.url.trim() || !link.label?.trim()) return false
  if (link.iconFile) return true
  if (isCustomSocialIcon(link.label)) {
    return Boolean(link.imageUrl.trim())
  }
  return Boolean(getIconFileForLabel(link.label))
}

export function isCustomSocialIcon(label: string | undefined): boolean {
  return !label || label === CUSTOM_SOCIAL_LABEL || !labelToIconFile.has(label)
}
