import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Toaster } from 'sonner'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated()
  if (!authed) {
    redirect('/admin-setup')
  }

  return (
    <div className="dark flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
