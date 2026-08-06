import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createSlug, ensureUniqueSlug } from '@/lib/slug'
import { stringifySections } from '@/lib/wiki'
import { validateForPublish } from '@/lib/article-validation'

const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
})

const articleUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  metaDescription: z.string().optional(),
  infoboxImageUrl: z.string().optional().nullable(),
  infoboxCaption: z.string().optional().nullable(),
  content: z.union([z.string(), z.array(sectionSchema)]).optional(),
  categoryId: z.string().optional().nullable(),
  published: z.boolean().optional(),
  hidden: z.boolean().optional(),
  infoboxRows: z.array(z.object({
    label: z.string(),
    value: z.string(),
    sortOrder: z.number().optional(),
  })).optional(),
})

function normalizeContent(content: string | z.infer<typeof sectionSchema>[] | undefined): string | undefined {
  if (content === undefined) return undefined
  if (typeof content === 'string') return content
  return stringifySections(content)
}

async function validatePublishPayload(data: {
  title: string
  summary?: string | null
  content: string
  categoryId?: string | null
  infoboxImageUrl?: string | null
  published?: boolean
}) {
  if (!data.published) return null

  const category = data.categoryId
    ? await prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true, parentId: true } })
    : null

  const mainCategoryId = category?.parentId ?? category?.id ?? ''
  const subcategoryId = category?.parentId ? category.id : ''

  const hasSubcategories = mainCategoryId
    ? (await prisma.category.count({ where: { parentId: mainCategoryId } })) > 0
    : false

  const errors = validateForPublish({
    title: data.title,
    summary: data.summary ?? '',
    content: data.content,
    mainCategoryId,
    subcategoryId,
    infoboxImageUrl: data.infoboxImageUrl ?? '',
    hasSubcategories,
  })

  if (Object.keys(errors).length === 0) return null
  return errors
}

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      infoboxRows: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(article)
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const existing = await prisma.article.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = articleUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  let slug = existing.slug

  if (data.slug || data.title) {
    const baseSlug = data.slug || createSlug(data.title ?? existing.title)
    slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const found = await prisma.article.findUnique({ where: { slug: s } })
      return !!found && found.id !== id
    })
  }

  const content = normalizeContent(data.content) ?? existing.content

  const publishErrors = await validatePublishPayload({
    title: data.title ?? existing.title,
    summary: data.summary ?? existing.summary,
    content,
    categoryId: data.categoryId !== undefined ? data.categoryId : existing.categoryId,
    infoboxImageUrl: data.infoboxImageUrl !== undefined ? data.infoboxImageUrl : existing.infoboxImageUrl,
    published: data.published !== undefined ? data.published : existing.published,
  })

  if (publishErrors) {
    return NextResponse.json(
      { error: 'Заполните все обязательные поля для публикации', fields: publishErrors },
      { status: 422 }
    )
  }

  const rows = data.infoboxRows?.filter((r) => r.label.trim())
  const metaDescription = data.metaDescription ?? existing.metaDescription

  const article = await prisma.$transaction(async (tx) => {
    if (rows) {
      await tx.infoboxRow.deleteMany({ where: { articleId: id } })
      if (rows.length) {
        await tx.infoboxRow.createMany({
          data: rows.map((r, i) => ({
            articleId: id,
            label: r.label,
            value: r.value,
            sortOrder: r.sortOrder ?? i,
          })),
        })
      }
    }

    return tx.article.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        metaDescription,
        infoboxImageUrl: data.infoboxImageUrl,
        infoboxCaption: data.infoboxCaption,
        content,
        categoryId: data.categoryId,
        published: data.published,
        hidden: data.hidden,
      },
      include: { infoboxRows: { orderBy: { sortOrder: 'asc' } }, category: true },
    })
  })

  return NextResponse.json(article)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true, slug: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.$transaction([
    prisma.carouselSlide.updateMany({
      where: { OR: [{ articleId: id }, { linkUrl: `/wiki/${existing.slug}` }] },
      data: { articleId: null, linkUrl: null },
    }),
    prisma.article.delete({ where: { id } }),
  ])
  return NextResponse.json({ ok: true })
}
