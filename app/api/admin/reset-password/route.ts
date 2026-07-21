import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getResetToken, deleteResetToken, setPasswordHash } from '@/lib/redis'
import { createSession, SESSION_COOKIE, SESSION_DURATION } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const storedToken = await getResetToken()
    if (!storedToken || storedToken !== token) {
      return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 401 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await setPasswordHash(passwordHash)
    await deleteResetToken()

    const sessionToken = await createSession()
    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Reset failed. Please try again.' }, { status: 500 })
  }
}
