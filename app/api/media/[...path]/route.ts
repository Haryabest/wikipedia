import { getMinioObject } from '@/lib/minio'

interface RouteContext {
  params: Promise<{ path: string[] }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params
  const key = path.join('/')

  if (!key.startsWith('uploads/') || key.includes('..')) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const object = await getMinioObject(key)
    if (!object) {
      return new Response('Not found', { status: 404 })
    }

    return new Response(object.data, {
      headers: {
        'Content-Type': object.contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
