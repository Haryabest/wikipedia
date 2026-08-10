import { getSession } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminModalProvider } from '@/components/admin/AdminModalProvider'
import { AdminShell } from './AdminShell'
import './admin.css'

function isLoginPath(pathname: string): boolean {
  return pathname === '/admin/login' || pathname === '/login' || pathname.endsWith('/admin/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? ''
  const loginPage = isLoginPath(pathname)
  const session = await getSession()

  if (loginPage) {
    if (session) redirect('/admin')
    return <AdminModalProvider>{children}</AdminModalProvider>
  }

  if (!session) {
    redirect('/admin/login')
  }

  return <AdminShell>{children}</AdminShell>
}
