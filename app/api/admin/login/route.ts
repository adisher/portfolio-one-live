import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPasswordHash } from '@/lib/redis'
import { createSession, SESSION_COOKIE, SESSION_DURATION } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    if (!password) {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 })
    }

    const hash = await getPasswordHash()
    if (!hash) {
      return NextResponse.json({ error: 'Not set up yet. Please visit /admin-setup.' }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, hash)
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    const token = await createSession()
    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
