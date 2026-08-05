import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { createSlug } from '../lib/slug'
import { IMAGES, CAROUSEL_SLIDES } from '../lib/images'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD ?? 'admin123'

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: 'Admin',
    },
  })

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Wiki',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
  })

  const categories = [
    { name: 'Персонажи', slug: 'personazhi', sortOrder: 0, imageUrl: IMAGES.hercules },
    { name: 'Места', slug: 'mesta', sortOrder: 1, imageUrl: IMAGES.parthenon },
    { name: 'События', slug: 'sobytiya', sortOrder: 2, imageUrl: IMAGES.achilles },
    { name: 'Артефакты', slug: 'artefakty', sortOrder: 3, imageUrl: IMAGES.mask },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { imageUrl: cat.imageUrl, name: cat.name },
      create: cat,
    })
  }

  const charactersCategory = await prisma.category.findUnique({ where: { slug: 'personazhi' } })

  const subcategories = [
    { name: 'Герои', slug: 'geroi', parentId: charactersCategory?.id, sortOrder: 0, imageUrl: IMAGES.hercules },
    { name: 'Боги', slug: 'bogi', parentId: charactersCategory?.id, sortOrder: 1, imageUrl: IMAGES.zeus },
    { name: 'Мифические существа', slug: 'mificheskie-sushchestva', parentId: charactersCategory?.id, sortOrder: 2, imageUrl: IMAGES.medusa },
  ]

  for (const sub of subcategories) {
    if (!sub.parentId) continue
    await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { imageUrl: sub.imageUrl, name: sub.name, parentId: sub.parentId },
      create: sub,
    })
  }

  const heroesCategory = await prisma.category.findUnique({ where: { slug: 'geroi' } })
  const godsCategory = await prisma.category.findUnique({ where: { slug: 'bogi' } })

  const heracles = await prisma.article.upsert({
    where: { slug: 'gerakl' },
    update: {
      categoryId: heroesCategory?.id,
      infoboxImageUrl: IMAGES.hercules,
      infoboxCaption: 'Геракл Farnese, мраморная статуя, II век н.э.',
      content: JSON.stringify([
        {
          id: 'history',
          title: 'История',
          content: `<p><strong>Геракл</strong> (лат. <em>Hercules</em>) — один из самых известных героев [[Греческая мифология|греческой мифологии]]. Сын [[Зевс|Зевса]] и смертной [[Алkmena|Алкмены]].</p><p><img src="${IMAGES.laocoon}" alt="Древние руины" /></p><p>Его подвиги стали символом силы, мужества и преодоления трудностей.</p>`,
        },
        {
          id: 'birth',
          title: 'Рождение',
          content: '<p>Геракл родился в [[Фивы|Фивах]]. С самого детства проявлял необычайную силу.</p>',
        },
        {
          id: 'labors',
          title: 'Двенадцать подвигов',
          content: `<p>За свои подвиги Геракл получил бессмертие и был принят на Олимп.</p><ul><li>Немейский лев</li><li>Лернейская гидра</li><li>Керинейская лань</li></ul><p><img src="${IMAGES.discobolus}" alt="Классическое искусство" /></p>`,
        },
        {
          id: 'death',
          title: 'Смерть',
          content: '<p>Геракл умер от отравленной рубашки, но был вознесён на Олимп как бог.</p>',
        },
      ]),
    },
    create: {
      title: 'Геракл',
      slug: 'gerakl',
      summary: 'Древнегреческий герой, сын Зевса и смертной женщины Алкмены.',
      metaDescription: 'Геракл — легендарный герой древнегреческой мифологии, известный двенадцатью подвигами.',
      published: true,
      categoryId: heroesCategory?.id,
      infoboxImageUrl: IMAGES.hercules,
      infoboxCaption: 'Геракл Farnese, мраморная статуя, II век н.э.',
      content: JSON.stringify([
        {
          id: 'history',
          title: 'История',
          content: `<p><strong>Геракл</strong> (лат. <em>Hercules</em>) — один из самых известных героев [[Греческая мифология|греческой мифологии]]. Сын [[Зевс|Зевса]] и смертной [[Алkmena|Алкмены]].</p><p><img src="${IMAGES.laocoon}" alt="Лаокoon" /></p><p>Его подвиги стали символом силы, мужества и преодоления трудностей.</p>`,
        },
        {
          id: 'birth',
          title: 'Рождение',
          content: '<p>Геракл родился в [[Фивы|Фивах]]. С самого детства проявлял необычайную силу.</p>',
        },
        {
          id: 'labors',
          title: 'Двенадцать подвигов',
          content: `<p>За свои подвиги Геракл получил бессмертие и был принят на Олимп.</p><ul><li>Немейский лев</li><li>Лернейская гидра</li><li>Керинейская лань</li></ul><p><img src="${IMAGES.discobolus}" alt="Дискобол" /></p>`,
        },
        {
          id: 'death',
          title: 'Смерть',
          content: '<p>Геракл умер от отравленной рубашки, но был вознесён на Олимп как бог.</p>',
        },
      ]),
      infoboxRows: {
        create: [
          { label: 'Дата рождения', value: '≈ XIII век до н.э.', sortOrder: 0 },
          { label: 'Отец', value: 'Зевс', sortOrder: 1 },
          { label: 'Мать', value: 'Алкмена', sortOrder: 2 },
          { label: 'Символ', value: 'Дубина, львиная шкура', sortOrder: 3 },
        ],
      },
    },
  })

  const zeus = await prisma.article.upsert({
    where: { slug: createSlug('Зевс') },
    update: {
      categoryId: godsCategory?.id,
      infoboxImageUrl: IMAGES.zeus,
      infoboxCaption: 'Зевс (Юпитер), мрамор, Лувр',
      content: JSON.stringify([
        {
          id: 'overview',
          title: 'Описание',
          content: `<p><strong>Зевс</strong> — верховный бог греческого пантеона, отец [[Геракл|Геракла]].</p><p><img src="${IMAGES.parthenon}" alt="Парфенon" /></p>`,
        },
      ]),
    },
    create: {
      title: 'Зевс',
      slug: createSlug('Зевс'),
      summary: 'Верховный бог греческого пантеона.',
      metaDescription: 'Зевс — верховный бог древнегреческой мифологии, повелитель неба и грома.',
      published: true,
      categoryId: godsCategory?.id,
      infoboxCaption: 'Зевс (Юпитер), мрамор, Лувр',
      content: JSON.stringify([
        {
          id: 'overview',
          title: 'Описание',
          content: `<p><strong>Зевс</strong> — верховный бог греческого пантеона, отец [[Геракл|Геракла]].</p><p><img src="${IMAGES.parthenon}" alt="Парфенон" /></p>`,
        },
      ]),
      infoboxRows: {
        create: [{ label: 'Сфера', value: 'Небо, гром', sortOrder: 0 }],
      },
    },
  })

  const slugMap: Record<string, string> = {
    gerakl: heracles.id,
    zevs: zeus.id,
  }

  await prisma.carouselSlide.deleteMany()

  await prisma.carouselSlide.createMany({
    data: CAROUSEL_SLIDES.map((slide, i) => ({
      imageUrl: slide.image,
      caption: slide.caption,
      linkUrl: slide.slug ? `/wiki/${slide.slug}` : null,
      articleId: slide.slug ? slugMap[slide.slug] ?? null : null,
      sortOrder: i,
      active: true,
    })),
  })

  console.log(`Seed complete: ${CAROUSEL_SLIDES.length} carousel slides, articles: gerakl, zevs`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
