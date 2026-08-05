import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createSlug, ensureUniqueSlug } from '@/lib/slug'

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  hidden: z.boolean().optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { articles: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const baseSlug = data.slug || createSlug(data.name)
  const slug = await ensureUniqueSlug(baseSlug, async (s) => {
    return !!(await prisma.category.findUnique({ where: { slug: s } }))
  })

  const category = await prisma.category.create({
    data: { ...data, slug },
  })
  return NextResponse.json(category, { status: 201 })
}
