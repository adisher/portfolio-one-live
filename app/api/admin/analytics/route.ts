import { NextResponse } from 'next/server'
import { getAnalytics } from '@/lib/redis'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await getAnalytics()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to load analytics.' }, { status: 500 })
  }
}
