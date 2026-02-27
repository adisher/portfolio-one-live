import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPasswordHash, setPasswordHash } from '@/lib/redis'
import { isAuthenticated } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authed = await isAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Both fields are required.' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
    }

    const hash = await getPasswordHash()
    if (!hash) {
      return NextResponse.json({ error: 'No password set.' }, { status: 400 })
    }

    const valid = await bcrypt.compare(currentPassword, hash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await setPasswordHash(newHash)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to change password.' }, { status: 500 })
  }
}
