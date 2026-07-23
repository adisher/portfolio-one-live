import { getConfig } from '@/lib/redis'
import { IntegrationsEditor } from '@/components/admin/IntegrationsEditor'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1">Analytics, tracking pixels, and sharing.</p>
      </div>
      <IntegrationsEditor config={config} />
    </div>
  )
}
