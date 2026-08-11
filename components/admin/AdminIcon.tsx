import type { LucideIcon } from 'lucide-react'
import {
  BarChart2,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Folder,
  Home,
  Images,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Save,
  ScanEye,
  Settings,
  Trash2,
  Upload,
  X,
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
  | 'preview'
  | 'dashboard'

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
  category: Folder,
  carousel: Images,
  settings: Settings,
  external: ExternalLink,
  home: Home,
  preview: ScanEye,
  dashboard: BarChart2,
}

interface AdminIconProps {
  name: AdminIconName
  size?: number
  className?: string
  strokeWidth?: number
}

export function AdminIcon({ name, size = 16, className, strokeWidth = 2 }: AdminIconProps) {
  const Icon = ICONS[name]
  return <Icon size={size} className={className} strokeWidth={strokeWidth} aria-hidden />
}
