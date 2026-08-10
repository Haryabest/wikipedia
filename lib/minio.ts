import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getPublicMediaUrl } from '@/lib/media-url'

let client: S3Client | null = null

export function getBucket(): string {
  return process.env.MINIO_BUCKET ?? 'wiki-images'
}

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
      },
      forcePathStyle: true,
    })
  }
  return client
}

export function getMinioClient(): S3Client {
  return getClient()
}

export function getPublicUrl(key: string): string {
  return getPublicMediaUrl(key)
}

export async function uploadToMinio(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const bucket = getBucket()
  const key = `uploads/${filename}`

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return getPublicUrl(key)
}

export async function getMinioObject(key: string) {
  const response = await getClient().send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  )

  const body = response.Body
  if (!body) return null

  const data = await body.transformToByteArray()
  return {
    data,
    contentType: response.ContentType ?? 'application/octet-stream',
  }
}
