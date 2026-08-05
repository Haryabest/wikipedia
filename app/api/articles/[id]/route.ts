import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createSlug, ensureUniqueSlug } from '@/lib/slug'
import { stringifySections } from '@/lib/wiki'
import { autoMetaDescription } from '@/lib/seo'

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

  const content = normalizeContent(data.content)

  if (data.infoboxRows) {
    await prisma.infoboxRow.deleteMany({ where: { articleId: id } })
    const rows = data.infoboxRows.filter((r) => r.label.trim())
    if (rows.length) {
      await prisma.infoboxRow.createMany({
        data: rows.map((r, i) => ({
          articleId: id,
          label: r.label,
          value: r.value,
          sortOrder: r.sortOrder ?? i,
        })),
      })
    }
  }

  const metaDescription =
    data.metaDescription ||
    (content !== undefined
      ? autoMetaDescription(data.summary ?? existing.summary ?? '', content, data.title ?? existing.title)
      : undefined)

  const article = await prisma.article.update({
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

  return NextResponse.json(article)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  await prisma.article.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
