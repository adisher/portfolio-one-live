import { NextRequest, NextResponse } from 'next/server'
import { getConfig, setConfig } from '@/lib/redis'
import { isAuthenticated } from '@/lib/auth'
import { DEFAULT_CONFIG, SiteConfig } from '@/lib/config'

export async function GET() {
  try {
    const config = await getConfig()
    return NextResponse.json(config)
  } catch {
    return NextResponse.json(DEFAULT_CONFIG)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as Partial<SiteConfig>
    const current = await getConfig()
    const updated: SiteConfig = { ...current, ...body }
    await setConfig(updated)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Config save error:', err)
    return NextResponse.json({ error: 'Failed to save config.' }, { status: 500 })
  }
}
