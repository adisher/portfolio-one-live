import { getAnalytics } from '@/lib/redis'
import { getConfig } from '@/lib/redis'
import { DashboardClient } from '@/components/admin/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [analytics, config] = await Promise.all([getAnalytics(), getConfig()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your page analytics at a glance.</p>
      </div>
      <DashboardClient analytics={analytics} config={config} />
    </div>
  )
}
