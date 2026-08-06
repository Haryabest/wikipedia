import { getSession } from '@/lib/auth'
import { AdminModalProvider } from '@/components/admin/AdminModalProvider'
import { AdminShell } from './AdminShell'
import './admin.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    return <AdminModalProvider>{children}</AdminModalProvider>
  }

  return <AdminShell>{children}</AdminShell>
}
