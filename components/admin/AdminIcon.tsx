import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  GalleryHorizontal,
  LayoutDashboard,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react'

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

const ICONS: Record<AdminIconName, LucideIcon> = {
  plus: Plus,
  save: Save,
  trash: Trash2,
  edit: Pencil,
  upload: Upload,
  eye: Eye,
  eyeOff: EyeOff,
  logout: LogOut,
  check: Check,
  x: X,
  login: LogIn,
  article: FileText,
  category: FolderTree,
  carousel: GalleryHorizontal,
  settings: Settings,
  external: ExternalLink,
  home: LayoutDashboard,
}

interface AdminIconProps {
  name: AdminIconName
  size?: number
  className?: string
}

export function AdminIcon({ name, size = 16, className }: AdminIconProps) {
  const Icon = ICONS[name]
  return (
    <Icon
      size={size}
      strokeWidth={2}
      className={className}
      aria-hidden
    />
  )
}
