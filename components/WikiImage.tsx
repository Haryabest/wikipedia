import type { ImgHTMLAttributes } from 'react'

type WikiImageProps = ImgHTMLAttributes<HTMLImageElement>

/** Wikimedia блокирует hotlink с referer — no-referrer обязателен */
export function WikiImage({ referrerPolicy = 'no-referrer', ...props }: WikiImageProps) {
  return <img referrerPolicy={referrerPolicy} {...props} />
}
