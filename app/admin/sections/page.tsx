import { getConfig } from '@/lib/redis'
import { SectionsEditor } from '@/components/admin/SectionsEditor'

export const dynamic = 'force-dynamic'

export default async function SectionsPage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sections</h1>
        <p className="text-muted-foreground mt-1">Toggle which sections appear on your public page.</p>
      </div>
      <SectionsEditor config={config} />
    </div>
  )
}
