import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const socialLinkSchema = z.object({
  imageUrl: z.string(),
  url: z.string(),
  label: z.string().optional(),
})

const settingsSchema = z.object({
  siteName: z.string().optional(),
  logoUrl: z.string().optional().nullable(),
  emblemUrl: z.string().optional().nullable(),
  siteUrl: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } })
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: parsed.data,
    create: { id: 'default', ...parsed.data },
  })
  return NextResponse.json(settings)
}
