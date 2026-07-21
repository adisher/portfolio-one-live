import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAdminEmail, setResetToken } from '@/lib/redis'
import { sendPasswordResetEmail } from '@/lib/email'

function getSiteUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `${request.nextUrl.protocol}//${request.nextUrl.host}`
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const storedEmail = await getAdminEmail()

    // Always return success to avoid leaking whether an email is registered
    if (!storedEmail || !email || email.toLowerCase().trim() !== storedEmail) {
      return NextResponse.json({ success: true })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email sending is not configured. Add RESEND_API_KEY to your environment variables.' },
        { status: 503 }
      )
    }

    const token = crypto.randomBytes(32).toString('hex')
    await setResetToken(token)

    const resetUrl = `${getSiteUrl(request)}/admin-reset-password?token=${token}`
    await sendPasswordResetEmail(storedEmail, resetUrl)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Failed to send reset email. Please try again.' }, { status: 500 })
  }
}
