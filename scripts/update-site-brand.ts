import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

await prisma.siteSettings.upsert({
  where: { id: 'default' },
  update: {
    siteName: 'Эфитека',
    siteSubtitle: 'Эфирия: мир в деталях — путеводитель по вселенной',
  },
  create: {
    id: 'default',
    siteName: 'Эфитека',
    siteSubtitle: 'Эфирия: мир в деталях — путеводитель по вселенной',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    socialLinks: [],
  },
})

console.log('Site settings updated')
await prisma.$disconnect()
