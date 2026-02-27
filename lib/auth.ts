import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'biolink_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days in seconds

function getSecret(): Uint8Array {
  // Derive the JWT signing key from the Upstash Redis token, which is always
  // auto-injected by the Vercel marketplace integration — no extra env var needed.
  // The prefix makes this key purpose-specific to session signing.
  const base = process.env.UPSTASH_REDIS_REST_TOKEN ?? 'dev-only-fallback-not-for-production'
  return new TextEncoder().encode(`biolink_sessions:${base}`)
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
  return token
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionToken()
  if (!token) return false
  return verifySession(token)
}

export { SESSION_COOKIE, SESSION_DURATION }
