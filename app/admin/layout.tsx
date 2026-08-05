import { getSession } from '@/lib/auth'
import { AdminShell } from './AdminShell'
import './admin.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    return <>{children}</>
  }

  return <AdminShell>{children}</AdminShell>
}
