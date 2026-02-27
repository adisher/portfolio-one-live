import { getConfig } from '@/lib/redis'
import { ProfileEditor } from '@/components/admin/ProfileEditor'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Edit your name, tagline, bio and avatar.</p>
      </div>
      <ProfileEditor config={config} />
    </div>
  )
}
