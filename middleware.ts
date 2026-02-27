import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'biolink_session'

function getSecret() {
  // Must mirror lib/auth.ts — derive from UPSTASH_REDIS_REST_TOKEN (always auto-injected).
  const base = process.env.UPSTASH_REDIS_REST_TOKEN ?? 'dev-only-fallback-not-for-production'
  return new TextEncoder().encode(`biolink_sessions:${base}`)
}

async function isValidSession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (not /admin-setup, /api/*, or public page)
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (!token || !(await isValidSession(token))) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin-setup'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
