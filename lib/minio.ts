import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

let client: S3Client | null = null

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

export function getPublicUrl(key: string): string {
  const base = (process.env.MINIO_PUBLIC_URL ?? process.env.MINIO_ENDPOINT ?? 'http://localhost:9000').replace(/\/$/, '')
  const bucket = process.env.MINIO_BUCKET ?? 'wiki-images'
  return `${base}/${bucket}/${key}`
}

export async function uploadToMinio(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const bucket = process.env.MINIO_BUCKET ?? 'wiki-images'
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
