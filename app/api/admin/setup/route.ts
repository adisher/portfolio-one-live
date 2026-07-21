import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getPasswordHash, setPasswordHash, setRecoveryCodeHash } from '@/lib/redis'
import { createSession, SESSION_COOKIE, SESSION_DURATION } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // If password already exists, setup is not allowed
    const existing = await getPasswordHash()
    if (existing) {
      return NextResponse.json({ error: 'Already set up. Use login instead.' }, { status: 403 })
    }

    const { password } = await request.json()
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 12)
    await setPasswordHash(hash)

    // Generate a one-time recovery code and store only its hash
    const recoveryCode = crypto.randomBytes(16).toString('hex')
    const recoveryHash = await bcrypt.hash(recoveryCode, 10)
    await setRecoveryCodeHash(recoveryHash)

    const token = await createSession()
    const response = NextResponse.json({ success: true, recoveryCode })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Setup error:', err)
    return NextResponse.json({ error: 'Setup failed. Check Redis connection.' }, { status: 500 })
  }
}

// Check if setup is needed
export async function GET() {
  try {
    const existing = await getPasswordHash()
    return NextResponse.json({ needsSetup: !existing })
  } catch {
    return NextResponse.json({ needsSetup: true, redisError: true })
  }
}
