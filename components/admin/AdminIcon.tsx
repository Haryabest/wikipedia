import type { ReactNode } from 'react'

export type AdminIconName =
  | 'plus'
  | 'save'
  | 'trash'
  | 'edit'
  | 'upload'
  | 'eye'
  | 'eyeOff'
  | 'logout'
  | 'check'
  | 'x'
  | 'login'
  | 'article'
  | 'category'
  | 'carousel'
  | 'settings'
  | 'external'
  | 'home'

interface AdminIconProps {
  name: AdminIconName
  size?: number
  className?: string
}

const ICONS: Record<AdminIconName, ReactNode> = {
  plus: (
    <>
      <path d="M8 3.5v9M3.5 8h9" />
    </>
  ),
  save: (
    <>
      <path d="M11.5 13.5h-7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1H9l1.5 2h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1Z" />
      <path d="M5.5 11.5h5" />
    </>
  ),
  trash: (
    <>
      <path d="M4 5.5h8" />
      <path d="M6.25 5.5V4.75a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 .75.75V5.5" />
      <path d="M5.5 5.5l.45 6.35a.75.75 0 0 0 .75.69h2.6a.75.75 0 0 0 .75-.69L10.5 5.5" />
    </>
  ),
  edit: (
    <>
      <path d="M10.2 3.8 12.2 5.8 6.1 11.9 4.1 12.1 4.3 10.1 10.2 3.8Z" />
      <path d="M3.5 12.5v1h1" />
    </>
  ),
  upload: (
    <>
      <path d="M8 10.5V4.5" />
      <path d="M5.5 7 8 4.5 10.5 7" />
      <path d="M4 12.5h8" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 8s2-3.5 5.5-3.5S13.5 8 13.5 8s-2 3.5-5.5 3.5S2.5 8 2.5 8Z" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3.5 13 12.5" />
      <path d="M5.2 6.1C4.3 6.8 3.7 7.7 3.3 8c1.2 2 3.2 3.5 4.7 3.5.7 0 1.5-.3 2.2-.7" />
      <path d="M8 4.5c2.8 0 4.8 1.8 5.7 3.5-.4.7-1.1 1.6-2 2.3" />
    </>
  ),
  logout: (
    <>
      <path d="M5.5 4.5v7" />
      <path d="M8.5 8H3.5" />
      <path d="M10.5 5.5 12.5 8l-2 2.5" />
    </>
  ),
  check: (
    <path d="M4 8.2 6.8 11 12 5.5" />
  ),
  x: (
    <>
      <path d="M5 5l6 6" />
      <path d="M11 5 5 11" />
    </>
  ),
  login: (
    <>
      <path d="M10.5 4.5v7" />
      <path d="M7.5 8h5" />
      <path d="M3.5 5.5 5.5 8l-2 2.5" />
    </>
  ),
  article: (
    <>
      <path d="M4.5 3.5h5l2.5 2.5v8a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1Z" />
      <path d="M9.5 3.5V6h2.5" />
      <path d="M6 9h4M6 11h4" />
    </>
  ),
  category: (
    <>
      <path d="M3.5 5.5a1.5 1.5 0 0 1 3 0v6.5h-3V5.5Z" />
      <path d="M6.5 5.5h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6V5.5Z" />
    </>
  ),
  carousel: (
    <>
      <rect x="2.5" y="4.5" width="11" height="7" rx="1" />
      <path d="M2.5 10.5h11" />
      <path d="M5 12.5h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="8" cy="8" r="1.75" />
      <path d="M8 2.5v1.2M8 12.3v1.2M2.5 8h1.2M12.3 8h1.2M4.3 4.3l.85.85M10.85 10.85l.85.85M11.7 4.3l-.85.85M4.3 11.7l.85-.85" />
    </>
  ),
  external: (
    <>
      <path d="M5.5 5.5h5v5" />
      <path d="M10 6 6 10" />
      <path d="M6.5 4.5h5v5" />
    </>
  ),
  home: (
    <>
      <path d="M3 7.5 8 3.5l5 4" />
      <path d="M4.5 7v5.5h7V7" />
    </>
  ),
}

export function AdminIcon({ name, size = 16, className }: AdminIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  )
}
