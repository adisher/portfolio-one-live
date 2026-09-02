import { getConfig } from '@/lib/redis'
import { SettingsEditor } from '@/components/admin/SettingsEditor'
import { SeoEditor } from '@/components/admin/SeoEditor'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Search appearance, account and backups.</p>
      </div>
      <SeoEditor config={config} />
      <SettingsEditor />
    </div>
  )
}
