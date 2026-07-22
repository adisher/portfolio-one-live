import { getConfig } from '@/lib/redis'
import { LinksEditor } from '@/components/admin/LinksEditor'

export const dynamic = 'force-dynamic'

export default async function LinksPage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content</h1>
        <p className="text-muted-foreground mt-1">Links, headers, videos, music and embeds — drag to reorder.</p>
      </div>
      <LinksEditor config={config} />
    </div>
  )
}
