/** Локальные изображения — всегда доступны без внешних CDN */
export const IMAGES = {
  hercules: '/images/hercules.svg',
  zeus: '/images/zeus.svg',
  athena: '/images/athena.svg',
  parthenon: '/images/parthenon.svg',
  laocoon: '/images/laocoon.svg',
  apollo: '/images/apollo.svg',
  poseidon: '/images/poseidon.svg',
  achilles: '/images/achilles.svg',
  medusa: '/images/medusa.svg',
  discobolus: '/images/discobolus.svg',
  mask: '/images/mask.svg',
  amphora: '/images/amphora.svg',
} as const

export const CAROUSEL_SLIDES = [
  { image: IMAGES.hercules, caption: 'Геракл — символ силы и доблести', slug: 'gerakl' },
  { image: IMAGES.zeus, caption: 'Зевс — владыка Олимпа', slug: 'zevs' },
  { image: IMAGES.athena, caption: 'Афина — богиня мудрости', slug: null },
  { image: IMAGES.parthenon, caption: 'Парфенон — святыня Афины', slug: null },
  { image: IMAGES.laocoon, caption: 'Древние руины Греции', slug: null },
  { image: IMAGES.apollo, caption: 'Акрополь — сердце Афин', slug: null },
  { image: IMAGES.poseidon, caption: 'Посейдон — повелитель морей', slug: null },
  { image: IMAGES.achilles, caption: 'Греческие пейзажи и мифы', slug: null },
  { image: IMAGES.medusa, caption: 'Античная архитектура', slug: null },
  { image: IMAGES.discobolus, caption: 'Классическое искусство', slug: null },
] as const
