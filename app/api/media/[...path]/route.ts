import { readFile } from 'fs/promises'
import path from 'path'
import { getMinioObject } from '@/lib/minio'

interface RouteContext {
  params: Promise<{ path: string[] }>
}

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

function guessMime(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  return MIME[ext] ?? 'application/octet-stream'
}

function isSafeUploadKey(key: string): boolean {
  if (!key.startsWith('uploads/')) return false
  if (key.includes('\\') || key.includes('..') || key.includes('%')) return false
  const normalized = path.posix.normalize(key.replace(/\\/g, '/'))
  return normalized.startsWith('uploads/') && !normalized.includes('..')
}

export async function GET(_request: Request, context: RouteContext) {
  const { path: segments } = await context.params
  const key = segments.join('/')

  if (!isSafeUploadKey(key)) {
    return new Response('Not found', { status: 404 })
  }

  const localFile = path.join(process.cwd(), 'public', key)
  try {
    const buffer = await readFile(localFile)
    return new Response(buffer, {
      headers: {
        'Content-Type': guessMime(key),
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    // try MinIO
  }

  try {
    const object = await getMinioObject(key)
    if (!object) {
      return new Response('Not found', { status: 404 })
    }

    return new Response(Buffer.from(object.data), {
      headers: {
        'Content-Type': object.contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
