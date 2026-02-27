import { getConfig } from '@/lib/redis'
import { SeoEditor } from '@/components/admin/SeoEditor'

export const dynamic = 'force-dynamic'

export default async function SeoPage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SEO</h1>
        <p className="text-muted-foreground mt-1">Control how your page appears in search results and social shares.</p>
      </div>
      <SeoEditor config={config} />
    </div>
  )
}
