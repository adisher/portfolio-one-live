import { NextRequest, NextResponse } from 'next/server'
import { trackPageView, trackLinkClick } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, linkId } = body

    if (type === 'pageview') {
      const country = request.headers.get('x-vercel-ip-country') || 'XX'
      const refHeader = request.headers.get('referer') || ''
      let referrer = ''
      if (refHeader) {
        try {
          const url = new URL(refHeader)
          referrer = url.hostname
        } catch {
          referrer = refHeader.slice(0, 100)
        }
      }
      await trackPageView(country, referrer)
    } else if (type === 'linkclick' && linkId) {
      await trackLinkClick(String(linkId))
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
