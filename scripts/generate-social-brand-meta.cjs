const fs = require('fs')
const path = require('path')
const icons = require(path.join(__dirname, '../node_modules/simple-icons/data/simple-icons.json'))
const pack = require(path.join(__dirname, '../node_modules/simple-icons'))

const overrides = {
  'OK.svg': 'odnoklassniki',
  'Mail_ru.svg': 'maildotru',
  'Tik Tok.svg': 'tiktok',
  'LinkedIN.svg': 'linkedin',
  'Youtube.svg': 'youtube',
  'Twitter.svg': 'x',
  'YandexBrowser.svg': 'yandex',
  'Github.svg': 'github',
  'Stackoverflow.svg': 'stackoverflow',
  'Codeopen.svg': 'codepen',
  'GooglePlay.svg': 'googleplay',
  'Epic Games.svg': 'epicgames',
  'ProductHunt.svg': 'producthunt',
  'Tripadvisor.svg': 'tripadvisor',
  'StumbleUpon.svg': 'stumbleupon',
  'Utorrent.svg': 'utorrent',
  'Zerpply.svg': 'zerply',
  'WWW.svg': 'linktree',
  'Mi.svg': 'xiaomi',
  'Miliao.svg': 'xiaomi',
  'HTML5.svg': 'html5',
  'Tor.svg': 'torproject',
  'Hola.svg': 'hola',
  'Fancy.svg': 'fancy',
  'Folio.svg': 'folio',
  'Marvel.svg': 'marvelapp',
  'Treehouse.svg': 'teamtreehouse',
  'Outlook.svg': 'microsoftoutlook',
  'Edge.svg': 'microsoftedge',
  'Aim.svg': 'aol',
  'Atlassian.svg': 'atlassian',
  'AdobeIllustrator.svg': 'adobeillustrator',
  'AdobePhotoshop.svg': 'adobephotoshop',
  'AdobeXD.svg': 'adobexd',
  'Kaixin001.svg': 'sinaweibo',
  'Renren.svg': 'sinaweibo',
  'Creativemarket.svg': 'creativemarket',
  'LinkedIN.svg': 'linkedin',
  'Microsoft.svg': 'microsoft',
  'Nintendo.svg': 'nintendo',
  'Opera.svg': 'opera',
  'Skype.svg': 'skype',
  'Slack.svg': 'slack',
  'Weibo.svg': 'sinaweibo',
  'Windows.svg': 'windows11',
  'Xbox.svg': 'xbox',
  'YandexBrowser.svg': 'yandex',
  'AdobeIllustrator.svg': 'adobeillustrator',
  'AdobePhotoshop.svg': 'adobephotoshop',
  'AdobeXD.svg': 'adobexd',
  'Bing.svg': 'bing',
  'Amazon.svg': 'amazon',
  'Coub.svg': 'coub',
  'Invision.svg': 'invision',
  'Periscope.svg': 'periscope',
  'Pocket.svg': 'pocket',
  'Shutterstock.svg': 'shutterstock',
  'StumbleUpon.svg': 'stumbleupon',
  'Tilda.svg': 'tilda',
  'Vine.svg': 'vine',
  'Zerpply.svg': 'zerply',
  'ui8.svg': 'ui8',
}

const iconsBySlug = Object.fromEntries(icons.map((icon) => [icon.slug, icon]))
const pathsBySlug = {}
for (const value of Object.values(pack)) {
  if (value && typeof value === 'object' && value.slug && value.path) {
    pathsBySlug[value.slug] = value.path
  }
}

const labels = fs.readFileSync(path.join(__dirname, '../lib/social-links.ts'), 'utf8')
const files = [...labels.matchAll(/'([^']+\.svg)':/g)].map((match) => match[1])
const out = {}
const missing = []

for (const file of files) {
  const candidates = [
    overrides[file],
    file.replace('.svg', '').replace(/\s+/g, '').replace(/_/g, '').toLowerCase(),
    file.replace('.svg', '').replace(/\s+/g, '').toLowerCase(),
    file.replace('.svg', '').replace(/_/g, '').toLowerCase(),
  ].filter(Boolean)

  let icon = null
  for (const slug of candidates) {
    if (iconsBySlug[slug]) {
      icon = iconsBySlug[slug]
      break
    }
  }

  if (icon && pathsBySlug[icon.slug]) {
    out[file] = {
      slug: icon.slug,
      hex: icon.hex,
      title: icon.title,
      path: pathsBySlug[icon.slug],
    }
  } else {
    missing.push(file)
  }
}

fs.writeFileSync(path.join(__dirname, '../lib/social-brand-meta.json'), `${JSON.stringify(out, null, 2)}\n`)
console.log(`mapped ${Object.keys(out).length} of ${files.length}`)
if (missing.length) console.log('missing:', missing.join(', '))
