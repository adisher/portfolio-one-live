import { getConfig } from '@/lib/redis'
import { AppearanceEditor } from '@/components/admin/AppearanceEditor'

export const dynamic = 'force-dynamic'

export default async function AppearancePage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appearance</h1>
        <p className="text-muted-foreground mt-1">Choose a theme, accent color and font.</p>
      </div>
      <AppearanceEditor config={config} />
    </div>
  )
}
