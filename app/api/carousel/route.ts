import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const slideSchema = z.object({
  imageUrl: z.string().min(1),
  caption: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  articleId: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  active: z.boolean().optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const slides = await prisma.carouselSlide.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { article: { select: { title: true, slug: true } } },
  })
  return NextResponse.json(slides)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const count = await prisma.carouselSlide.count()
  if (count >= 10) {
    return NextResponse.json({ error: 'Максимум 10 слайдов' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = slideSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  let linkUrl = parsed.data.linkUrl
  if (parsed.data.articleId) {
    const article = await prisma.article.findUnique({ where: { id: parsed.data.articleId } })
    if (!article) return NextResponse.json({ error: 'Статья не найдена' }, { status: 400 })
    linkUrl = `/wiki/${article.slug}`
  }

  const slide = await prisma.carouselSlide.create({
    data: { ...parsed.data, linkUrl },
  })
  return NextResponse.json(slide, { status: 201 })
}
