import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getRecoveryCodeHash, setPasswordHash, setRecoveryCodeHash } from '@/lib/redis'
import { createSession, SESSION_COOKIE, SESSION_DURATION } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { recoveryCode, newPassword } = await request.json()

    if (!recoveryCode || !newPassword) {
      return NextResponse.json({ error: 'Recovery code and new password are required.' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const storedHash = await getRecoveryCodeHash()
    if (!storedHash) {
      return NextResponse.json(
        { error: 'No recovery code on file. Delete site:password_hash from your Redis dashboard to fully reset.' },
        { status: 404 }
      )
    }

    const valid = await bcrypt.compare(recoveryCode, storedHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid recovery code.' }, { status: 401 })
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await setPasswordHash(passwordHash)

    // Rotate recovery code so the old one can never be reused
    const newRecoveryCode = crypto.randomBytes(16).toString('hex')
    const newRecoveryHash = await bcrypt.hash(newRecoveryCode, 10)
    await setRecoveryCodeHash(newRecoveryHash)

    // Auto-login after successful reset
    const token = await createSession()
    const response = NextResponse.json({ success: true, newRecoveryCode })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Reset error:', err)
    return NextResponse.json({ error: 'Reset failed.' }, { status: 500 })
  }
}
