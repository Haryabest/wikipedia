import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createSlug, ensureUniqueSlug } from '@/lib/slug'
import { stringifySections } from '@/lib/wiki'
import { autoMetaDescription } from '@/lib/seo'

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
  const baseSlug = data.slug || createSlug(data.title)
  const slug = await ensureUniqueSlug(baseSlug, async (s) => {
    const existing = await prisma.article.findUnique({ where: { slug: s } })
    return !!existing
  })

  const metaDescription =
    data.metaDescription ||
    autoMetaDescription(data.summary ?? '', content, data.title)

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
}
