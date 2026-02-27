'use client'

import { useState } from 'react'
import { SiteConfig } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SaveButton } from '@/components/admin/SaveButton'
import { Info } from 'lucide-react'

interface SeoEditorProps {
  config: SiteConfig
}

export function SeoEditor({ config }: SeoEditorProps) {
  const [seoTitle, setSeoTitle] = useState(config.seoTitle)
  const [seoDescription, setSeoDescription] = useState(config.seoDescription)
  const [ogImageUrl, setOgImageUrl] = useState(config.ogImageUrl)

  async function save() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seoTitle, seoDescription, ogImageUrl }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
        <CardDescription>
          Control how your page appears in Google and when shared on social media.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="seoTitle">Page Title</Label>
          <Input
            id="seoTitle"
            value={seoTitle}
            onChange={e => setSeoTitle(e.target.value)}
            placeholder="Your Name"
            maxLength={70}
          />
          <p className="text-xs text-muted-foreground">{seoTitle.length}/70 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoDescription">Meta Description</Label>
          <Textarea
            id="seoDescription"
            value={seoDescription}
            onChange={e => setSeoDescription(e.target.value)}
            placeholder="A short description of your page for search engines…"
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-muted-foreground">{seoDescription.length}/160 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ogImage">OG Image URL</Label>
          <Input
            id="ogImage"
            value={ogImageUrl}
            onChange={e => setOgImageUrl(e.target.value)}
            placeholder="https://example.com/og-image.png"
          />
          <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              If left blank, an OG image will be auto-generated from your name and tagline.
              Recommended size: 1200×630 px.
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <SaveButton onSave={save} />
        </div>
      </CardContent>
    </Card>
  )
}
