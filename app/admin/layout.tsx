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
    // `dark` only redefines the CSS variables; without `text-foreground` here
    // every element that doesn't set its own color inherits the light-theme
    // color from <body>, giving dark text on a dark background.
    <div className="dark flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
      <Toaster richColors position="top-right" theme="dark" />
    </div>
  )
}
