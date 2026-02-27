import { getConfig } from '@/lib/redis'
import { LinksEditor } from '@/components/admin/LinksEditor'

export const dynamic = 'force-dynamic'

export default async function LinksPage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Links</h1>
        <p className="text-muted-foreground mt-1">Add, edit, reorder and toggle your links.</p>
      </div>
      <LinksEditor config={config} />
    </div>
  )
}
