import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getDefaultSiteSettings } from '@/lib/data'
import { sanitizeExternalUrl, sanitizeMediaUrl } from '@/lib/safe-url'

const socialLinkSchema = z.object({
  imageUrl: z.string(),
  url: z.string(),
  label: z.string().optional(),
  iconFile: z.string().nullable().optional(),
})

const settingsSchema = z.object({
  siteName: z.string().optional(),
  logoUrl: z.string().optional().nullable(),
  emblemUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  siteSubtitle: z.string().optional().nullable(),
  siteUrl: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).max(10).optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } })
  return NextResponse.json(settings ?? getDefaultSiteSettings())
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

  const data = { ...parsed.data }
  if (data.siteName !== undefined) {
    data.siteName = data.siteName.trim()
    if (!data.siteName) delete data.siteName
  }
  if (data.siteSubtitle !== undefined) {
    data.siteSubtitle = data.siteSubtitle?.trim() || null
  }
  if (data.siteUrl !== undefined) {
    data.siteUrl = data.siteUrl.trim()
    if (!data.siteUrl) {
      delete data.siteUrl
    } else {
      try {
        new URL(data.siteUrl)
      } catch {
        return NextResponse.json({ error: 'Некорректный URL сайта' }, { status: 400 })
      }
    }
  }
  for (const key of ['logoUrl', 'emblemUrl', 'faviconUrl'] as const) {
    const value = data[key]
    if (typeof value === 'string' && !value.trim()) {
      data[key] = null
    } else if (typeof value === 'string') {
      const safe = sanitizeMediaUrl(value)
      if (!safe) {
        return NextResponse.json({ error: `Некорректный URL: ${key}` }, { status: 400 })
      }
      data[key] = safe
    }
  }

  if (data.socialLinks) {
    for (const link of data.socialLinks) {
      const safeUrl = sanitizeExternalUrl(link.url)
      if (!safeUrl) {
        return NextResponse.json({ error: 'Некорректная ссылка в шапке' }, { status: 400 })
      }
      link.url = safeUrl
      if (link.imageUrl.trim()) {
        const safeImg = sanitizeMediaUrl(link.imageUrl) ?? (link.imageUrl.startsWith('/images/') ? link.imageUrl : null)
        if (!safeImg) {
          return NextResponse.json({ error: 'Некорректная иконка ссылки' }, { status: 400 })
        }
        link.imageUrl = safeImg
      }
    }
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: { ...getDefaultSiteSettings(), ...data, id: 'default' },
  })
  return NextResponse.json(settings)
}
