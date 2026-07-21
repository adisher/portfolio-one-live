'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setSent(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              If <strong>{email}</strong> matches your admin account, a reset link
              has been sent. It expires in 1 hour.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Didn&apos;t get it? Check your spam folder or try again.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              Try again
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
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter the email address you set up your admin account with and
            we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
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
              Send Reset Link
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
