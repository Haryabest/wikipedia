import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { createSlug } from '../lib/slug'

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
    { name: 'Персонажи', slug: 'personazhi', sortOrder: 0 },
    { name: 'Места', slug: 'mesta', sortOrder: 1 },
    { name: 'События', slug: 'sobytiya', sortOrder: 2 },
    { name: 'Артефакты', slug: 'artefakty', sortOrder: 3 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  const charactersCategory = await prisma.category.findUnique({ where: { slug: 'personazhi' } })

  const heracles = await prisma.article.upsert({
    where: { slug: 'gerakl' },
    update: {},
    create: {
      title: 'Геракл',
      slug: 'gerakl',
      summary: 'Древнегреческий герой, сын Зевса и смертной женщины Алкмены.',
      metaDescription: 'Геракл — легендарный герой древнегреческой мифологии, известный двенадцатью подвигами.',
      published: true,
      categoryId: charactersCategory?.id,
      infoboxImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Hercules_Farnese_3637104088_9c95d7fe7c_b.jpg/440px-Hercules_Farnese_3637104088_9c95d7fe7c_b.jpg',
      infoboxCaption: 'Геракл Фarnese, мраморная статуя',
      content: JSON.stringify([
        {
          id: 'history',
          title: 'История',
          content: '<p><strong>Геракл</strong> (лат. <em>Hercules</em>) — один из самых известных героев [[Греческая мифология|греческой мифологии]]. Сын [[Зевс|Зевса]] и смертной [[Алkmena|Алкмены]].</p><p>Его подвиги стали символом силы, мужества и преодоления трудностей.</p>',
        },
        {
          id: 'birth',
          title: 'Рождение',
          content: '<p>Геракл родился в [[Фивы|Фивах]]. С самого детства проявлял необычайную силу.</p>',
        },
        {
          id: 'labors',
          title: 'Двенадцать подвигов',
          content: '<p>За свои подвиги Геракл получил бессмертие и был принят на Олимп.</p><ul><li>Немейский лев</li><li>Лернейская гидра</li><li>Керинейская лань</li></ul>',
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
    update: {},
    create: {
      title: 'Зевс',
      slug: createSlug('Зевс'),
      summary: 'Верховный бог греческого пантеона.',
      metaDescription: 'Зевс — верховный бог древнегреческой мифологии, повелитель неба и грома.',
      published: true,
      categoryId: charactersCategory?.id,
      content: JSON.stringify([
        {
          id: 'overview',
          title: 'Описание',
          content: '<p><strong>Зевс</strong> — верховный бог греческого пантеона, отец [[Геракл|Геракла]].</p>',
        },
      ]),
      infoboxRows: {
        create: [{ label: 'Сфера', value: 'Небо, гром', sortOrder: 0 }],
      },
    },
  })

  await prisma.carouselSlide.deleteMany()

  await prisma.carouselSlide.createMany({
    data: [
      {
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Hercules_Farnese_3637104088_9c95d7fe7c_b.jpg/800px-Hercules_Farnese_3637104088_9c95d7fe7c_b.jpg',
        caption: 'Геракл — символ силы и доблести',
        linkUrl: '/wiki/gerakl',
        articleId: heracles.id,
        sortOrder: 0,
      },
      {
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Jupiter_Smyrna_Louvre_Ma13.jpg/800px-Jupiter_Smyrna_Louvre_Ma13.jpg',
        caption: 'Зевс — владыка Олимпа',
        linkUrl: '/wiki/zevs',
        articleId: zeus.id,
        sortOrder: 1,
      },
    ],
  })

  console.log('Seed complete. Sample article:', heracles.slug)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
