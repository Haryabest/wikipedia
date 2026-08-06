import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createSlug, ensureUniqueSlug } from '@/lib/slug'
import { stringifySections } from '@/lib/wiki'
import { autoMetaDescription } from '@/lib/seo'
import { validateForPublish } from '@/lib/article-validation'

const infoboxRowSchema = z.object({
  label: z.string(),
  value: z.string(),
  sortOrder: z.number().optional(),
})

const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
})

const articleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().optional(),
  summary: z.string().optional(),
  metaDescription: z.string().optional(),
  infoboxImageUrl: z.string().optional().nullable(),
  infoboxCaption: z.string().optional().nullable(),
  content: z.union([z.string(), z.array(sectionSchema)]).optional(),
  categoryId: z.string().optional().nullable(),
  published: z.boolean().optional(),
  hidden: z.boolean().optional(),
  infoboxRows: z.array(infoboxRowSchema).optional(),
})

function normalizeContent(content: string | z.infer<typeof sectionSchema>[] | undefined): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  return stringifySections(content)
}

async function requireAuth() {
  const session = await getSession()
  if (!session) return null
  return session
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

export async function GET() {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      category: { select: { name: true } },
      infoboxRows: { orderBy: { sortOrder: 'asc' } },
    },
  })
  return NextResponse.json(articles)
}

export async function POST(request: Request) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = articleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const content = normalizeContent(data.content)

  const publishErrors = await validatePublishPayload({
    title: data.title,
    summary: data.summary,
    content,
    categoryId: data.categoryId,
    infoboxImageUrl: data.infoboxImageUrl,
    published: data.published,
  })

  if (publishErrors) {
    return NextResponse.json(
      { error: 'Заполните все обязательные поля для публикации', fields: publishErrors },
      { status: 422 }
    )
  }

  const baseSlug = data.slug || createSlug(data.title)
  const metaDescription =
    data.metaDescription ||
    autoMetaDescription(data.summary ?? '', content, data.title)

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = await ensureUniqueSlug(attempt === 0 ? baseSlug : `${baseSlug || 'article'}-${Date.now().toString(36)}`, async (s) => {
      const existing = await prisma.article.findUnique({ where: { slug: s } })
      return !!existing
    })

    try {
      const article = await prisma.article.create({
        data: {
          title: data.title,
          slug,
          summary: data.summary,
          metaDescription,
          infoboxImageUrl: data.infoboxImageUrl,
          infoboxCaption: data.infoboxCaption,
          content,
          categoryId: data.categoryId ?? null,
          published: data.published ?? false,
          hidden: data.hidden ?? false,
          infoboxRows: data.infoboxRows?.length
            ? { create: data.infoboxRows.filter((r) => r.label.trim()).map((r, i) => ({ ...r, sortOrder: r.sortOrder ?? i })) }
            : undefined,
        },
        include: { infoboxRows: true },
      })
      return NextResponse.json(article, { status: 201 })
    } catch (err: unknown) {
      const isUniqueSlugError =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        String(err.meta?.target ?? '').includes('slug')
      if (!isUniqueSlugError || attempt === 2) throw err
    }
  }

  throw new Error('Не удалось создать уникальный slug')
}
