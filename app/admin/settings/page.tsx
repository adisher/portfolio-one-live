import { SettingsEditor } from '@/components/admin/SettingsEditor'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Change password, export or import your configuration.</p>
      </div>
      <SettingsEditor />
    </div>
  )
}
