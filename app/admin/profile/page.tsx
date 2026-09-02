import { getConfig } from '@/lib/redis'
import { ProfileEditor } from '@/components/admin/ProfileEditor'
import { SocialEditor } from '@/components/admin/SocialEditor'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const config = await getConfig()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Your name, bio, avatar and social profiles.</p>
      </div>
      <ProfileEditor config={config} />
      <SocialEditor config={config} />
    </div>
  )
}
