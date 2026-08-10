import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { uploadToMinio } from '@/lib/minio'
import { detectImageMime, extensionForMime } from '@/lib/image-bytes'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_SIZE = 10 * 1024 * 1024

function shouldPreferLocalUpload(): boolean {
  const base = process.env.MINIO_PUBLIC_URL ?? process.env.MINIO_ENDPOINT ?? ''
  return !base || /localhost|127\.0\.0\.1|minio/i.test(base)
}

async function uploadLocal(buffer: Buffer, filename: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)
  return `/uploads/${filename}`
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = getClientIp(request)
  const { allowed } = rateLimit(`upload:${ip}`, 30, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Слишком много загрузок' }, { status: 429 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Некорректная форма загрузки' }, { status: 400 })
  }
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Файл слишком большой (макс. 10 МБ)' }, { status: 400 })
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
  } catch {
    return NextResponse.json({ error: 'Не удалось прочитать файл' }, { status: 400 })
  }

  const detectedMime = detectImageMime(buffer)
  if (!detectedMime) {
    return NextResponse.json({ error: 'Недопустимый тип файла (только JPEG, PNG, GIF, WebP)' }, { status: 400 })
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensionForMime(detectedMime)}`

  if (shouldPreferLocalUpload()) {
    try {
      const url = await uploadLocal(buffer, filename)
      return NextResponse.json({ url })
    } catch {
      const url = await uploadToMinio(buffer, filename, detectedMime)
      return NextResponse.json({ url })
    }
  }

  try {
    const url = await uploadToMinio(buffer, filename, detectedMime)
    return NextResponse.json({ url })
  } catch {
    const url = await uploadLocal(buffer, filename)
    return NextResponse.json({ url })
  }
}
