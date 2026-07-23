import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { addRequest } from '@/lib/redis'
import { sendFeatureRequestEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { type, message } = await request.json()
  const kind: 'font' | 'feature' = type === 'font' ? 'font' : 'feature'
  if (!message || !String(message).trim()) {
    return NextResponse.json({ error: 'Please describe your request.' }, { status: 400 })
  }

  const req = {
    type: kind,
    message: String(message).trim().slice(0, 2000),
    at: new Date().toISOString(),
  }

  try {
    await addRequest(req)
  } catch (err) {
    console.error('Request save error:', err)
    return NextResponse.json({ error: 'Could not save your request. Try again.' }, { status: 500 })
  }

  // Best-effort notification to the platform inbox, if configured.
  const to = process.env.FEATURE_REQUEST_EMAIL
  if (to && process.env.RESEND_API_KEY) {
    try {
      await sendFeatureRequestEmail(to, kind, req.message)
    } catch (err) {
      console.error('Request email error (non-fatal):', err)
    }
  }

  return NextResponse.json({ success: true })
}
