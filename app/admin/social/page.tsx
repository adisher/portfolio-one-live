import { getConfig } from '@/lib/redis'
import { SocialEditor } from '@/components/admin/SocialEditor'

export const dynamic = 'force-dynamic'

export default async function SocialPage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social Profiles</h1>
        <p className="text-muted-foreground mt-1">Manage your social media links and visibility.</p>
      </div>
      <SocialEditor config={config} />
    </div>
  )
}
