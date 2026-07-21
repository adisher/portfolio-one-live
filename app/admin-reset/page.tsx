'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, KeyRound, ShieldCheck, Copy, Check } from 'lucide-react'

export default function AdminResetPage() {
  const router = useRouter()
  const [recoveryCode, setRecoveryCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [newRecoveryCode, setNewRecoveryCode] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    if (!recoveryCode.trim()) { setError('Recovery code is required.'); return }

    setSubmitting(true)
    const res = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recoveryCode: recoveryCode.trim(), newPassword }),
    })
    const data = await res.json()
    if (data.success) {
      setNewRecoveryCode(data.newRecoveryCode)
    } else {
      setError(data.error || 'Reset failed.')
      setSubmitting(false)
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(newRecoveryCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (newRecoveryCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Password Reset</CardTitle>
            <CardDescription>
              Your password has been updated. A <strong>new</strong> recovery code has been
              generated — your old code is now invalid. Save this one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
              <code className="flex-1 text-sm font-mono break-all select-all">{newRecoveryCode}</code>
              <Button variant="ghost" size="icon" onClick={copyCode} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Treat this like a password. Anyone with this code can reset your admin access.
            </p>
            <Button
              className="w-full"
              onClick={() => { router.push('/admin'); router.refresh() }}
            >
              I&apos;ve saved it — Go to Dashboard
            </Button>
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
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Reset Admin Password</CardTitle>
          <CardDescription>
            Enter the recovery code you saved when you first set up your admin password,
            then choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recoveryCode">Recovery Code</Label>
              <Input
                id="recoveryCode"
                type="text"
                value={recoveryCode}
                onChange={e => setRecoveryCode(e.target.value)}
                placeholder="32-character hex code"
                autoFocus
                required
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <a href="/admin-setup" className="text-primary underline-offset-4 hover:underline">
                Back to login
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
