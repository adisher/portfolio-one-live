import { getConfig } from '@/lib/redis'
import { LinksEditor } from '@/components/admin/LinksEditor'
import { PageExtrasEditor } from '@/components/admin/PageExtrasEditor'

export const dynamic = 'force-dynamic'

export default async function LinksPage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content</h1>
        <p className="text-muted-foreground mt-1">Everything that appears on your page, in order.</p>
      </div>
      <LinksEditor config={config} />
      <PageExtrasEditor config={config} />
    </div>
  )
}
