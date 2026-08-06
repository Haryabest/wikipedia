import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const updateSchema = z.object({
  imageUrl: z.string().optional(),
  caption: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  articleId: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  active: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const existing = await prisma.carouselSlide.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  let linkUrl = parsed.data.linkUrl
  if (parsed.data.articleId) {
    const article = await prisma.article.findUnique({ where: { id: parsed.data.articleId } })
    if (!article) return NextResponse.json({ error: 'Статья не найдена' }, { status: 400 })
    linkUrl = `/wiki/${article.slug}`
  }

  const slide = await prisma.carouselSlide.update({
    where: { id },
    data: { ...parsed.data, linkUrl },
  })
  return NextResponse.json(slide)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const existing = await prisma.carouselSlide.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.carouselSlide.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
