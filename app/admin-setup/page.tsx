'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, Lock } from 'lucide-react'

type Mode = 'loading' | 'setup' | 'login' | 'error'

export default function AdminSetupPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [redisError, setRedisError] = useState(false)

  useEffect(() => {
    fetch('/api/admin/setup')
      .then(r => r.json())
      .then(data => {
        if (data.redisError) {
          setRedisError(true)
          setMode('error')
        } else {
          setMode(data.needsSetup ? 'setup' : 'login')
        }
      })
      .catch(() => { setMode('error'); setRedisError(true) })
  }, [])

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setSubmitting(true)
    const res = await fetch('/api/admin/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (data.success) {
      router.push('/admin')
      router.refresh()
    } else {
      setError(data.error || 'Setup failed.')
      setSubmitting(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (data.success) {
      router.push('/admin')
      router.refresh()
    } else {
      setError(data.error || 'Login failed.')
      setSubmitting(false)
    }
  }

  if (mode === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (mode === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Redis Connection Error</CardTitle>
            </div>
            <CardDescription>
              Could not connect to Upstash Redis. Please check that{' '}
              <code className="bg-muted px-1 rounded text-xs">UPSTASH_REDIS_REST_URL</code> and{' '}
              <code className="bg-muted px-1 rounded text-xs">UPSTASH_REDIS_REST_TOKEN</code>{' '}
              environment variables are set correctly in your Vercel project settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you deployed via the one-click button, the Upstash integration should have auto-injected these.
              Visit your Vercel project → Settings → Environment Variables to verify.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'setup' ? 'Set Up Your Admin Password' : 'Admin Login'}
          </CardTitle>
          <CardDescription>
            {mode === 'setup'
              ? 'Create a password to protect your admin panel. You only do this once.'
              : 'Enter your admin password to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'setup' ? handleSetup : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'setup' ? 'At least 8 characters' : 'Your admin password'}
                autoFocus
                required
              />
            </div>
            {mode === 'setup' && (
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                />
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'setup' ? 'Create Password & Enter' : 'Log In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
