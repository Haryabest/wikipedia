import type { ImgHTMLAttributes } from 'react'

type WikiImageProps = ImgHTMLAttributes<HTMLImageElement>

/** Wikimedia блокирует hotlink с referer — no-referrer обязателен */
export function WikiImage({ alt = '', referrerPolicy = 'no-referrer', ...props }: WikiImageProps) {
  return <img alt={alt} referrerPolicy={referrerPolicy} {...props} />
}
