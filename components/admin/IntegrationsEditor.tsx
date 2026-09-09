'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { SiteConfig } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SaveButton } from '@/components/admin/SaveButton'
import { toast } from 'sonner'
import { BarChart3, QrCode, Copy, Check, Download } from 'lucide-react'

interface IntegrationsEditorProps {
  config: SiteConfig
}

export function IntegrationsEditor({ config }: IntegrationsEditorProps) {
  const [ga, setGa] = useState(config.gaMeasurementId || '')
  const [meta, setMeta] = useState(config.metaPixelId || '')
  const [tiktok, setTiktok] = useState(config.tiktokPixelId || '')

  const [siteUrl, setSiteUrl] = useState('')
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const url = window.location.origin
    setSiteUrl(url)
    QRCode.toDataURL(url, { width: 512, margin: 1, errorCorrectionLevel: 'M' })
      .then(setQr)
      .catch(() => {})
  }, [])

  async function saveAnalytics() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gaMeasurementId: ga.trim(),
        metaPixelId: meta.trim(),
        tiktokPixelId: tiktok.trim(),
      }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  async function copyLink() {
    await navigator.clipboard.writeText(siteUrl)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadQr() {
    if (!qr) return
    const a = document.createElement('a')
    a.href = qr
    a.download = 'bio-link-qr.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      {/* Analytics & pixels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics &amp; Pixels
          </CardTitle>
          <CardDescription>
            Connect your own tracking. These load on your public page only — data goes straight to your accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="ga">Google Analytics 4 — Measurement ID</Label>
            <Input id="ga" placeholder="G-XXXXXXXXXX" value={ga} onChange={e => setGa(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="meta">Meta (Facebook) Pixel ID</Label>
            <Input id="meta" placeholder="1234567890123456" value={meta} onChange={e => setMeta(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tiktok">TikTok Pixel ID</Label>
            <Input id="tiktok" placeholder="CXXXXXXXXXXXXXXXXX" value={tiktok} onChange={e => setTiktok(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            Leave a field blank to disable that tracker. Pixels are commonly a paid feature elsewhere — here they’re included.
          </p>
          <div className="flex justify-end">
            <SaveButton onSave={saveAnalytics} />
          </div>
        </CardContent>
      </Card>

      {/* Share / QR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Share Your Page
          </CardTitle>
          <CardDescription>QR code and link to your public page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="rounded-xl border border-border bg-white p-3 shrink-0">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="Page QR code" className="h-40 w-40" />
              ) : (
                <div className="h-40 w-40 animate-pulse bg-muted rounded" />
              )}
            </div>
            <div className="flex-1 w-full space-y-3">
              <div className="space-y-1">
                <Label>Public URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value={siteUrl} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy link">
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button variant="outline" onClick={downloadQr} disabled={!qr} className="gap-2">
                <Download className="h-4 w-4" /> Download QR (PNG)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
