import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isSafeRelativePath, sanitizeMediaUrl } from '@/lib/safe-url'

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

  const data: z.infer<typeof updateSchema> & { linkUrl?: string | null } = { ...parsed.data }

  if (parsed.data.imageUrl !== undefined) {
    const safeImage = sanitizeMediaUrl(parsed.data.imageUrl)
    if (!safeImage) {
      return NextResponse.json({ error: 'Некорректный URL изображения' }, { status: 400 })
    }
    data.imageUrl = safeImage
  }

  if (parsed.data.linkUrl !== undefined && parsed.data.linkUrl?.trim() && !parsed.data.articleId) {
    const trimmed = parsed.data.linkUrl.trim()
    if (!isSafeRelativePath(trimmed) || !trimmed.startsWith('/wiki/')) {
      return NextResponse.json({ error: 'Ссылка слайда должна вести на статью (/wiki/...)' }, { status: 400 })
    }
    data.linkUrl = trimmed
  }

  if (parsed.data.articleId !== undefined) {
    if (parsed.data.articleId) {
      const article = await prisma.article.findUnique({ where: { id: parsed.data.articleId } })
      if (!article) return NextResponse.json({ error: 'Статья не найдена' }, { status: 400 })
      data.linkUrl = `/wiki/${article.slug}`
    } else {
      data.linkUrl = null
      data.articleId = null
    }
  }

  const slide = await prisma.carouselSlide.update({
    where: { id },
    data,
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
