import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createSlug, ensureUniqueSlug } from '@/lib/slug'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  hidden: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const existing = await prisma.category.findUnique({ where: { id } })
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

  const data = parsed.data
  let slug = existing.slug

  if (data.slug || data.name) {
    const baseSlug = data.slug || createSlug(data.name ?? existing.name)
    slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const found = await prisma.category.findUnique({ where: { slug: s } })
      return !!found && found.id !== id
    })
  }

  const category = await prisma.category.update({
    where: { id },
    data: { ...data, slug },
  })
  return NextResponse.json(category)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
