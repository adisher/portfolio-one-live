import { getConfig } from '@/lib/redis'
import { SetupWizard } from '@/components/admin/SetupWizard'

export const dynamic = 'force-dynamic'

export default async function StartPage() {
  const config = await getConfig()
  return <SetupWizard config={config} />
}
