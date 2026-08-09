import type { ImgHTMLAttributes } from 'react'
import { normalizeMediaUrl } from '@/lib/media-url'

type WikiImageProps = ImgHTMLAttributes<HTMLImageElement>

/** Wikimedia блокирует hotlink с referer — no-referrer обязателен */
export function WikiImage({ alt = '', referrerPolicy = 'no-referrer', src, ...props }: WikiImageProps) {
  const normalizedSrc = typeof src === 'string' ? normalizeMediaUrl(src) : src
  return <img alt={alt} referrerPolicy={referrerPolicy} src={normalizedSrc} {...props} />
}
