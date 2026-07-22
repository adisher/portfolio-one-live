'use client'

import { useState } from 'react'
import { SiteConfig } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SaveButton } from '@/components/admin/SaveButton'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface ProfileEditorProps {
  config: SiteConfig
}

export function ProfileEditor({ config }: ProfileEditorProps) {
  const [name, setName] = useState(config.name)
  const [tagline, setTagline] = useState(config.tagline)
  const [bio, setBio] = useState(config.bio)
  const [avatarUrl, setAvatarUrl] = useState(config.avatarUrl)
  const [bgEnabled, setBgEnabled] = useState(!!config.avatarBgColor)
  const [bgColor, setBgColor] = useState(config.avatarBgColor || '#ffffff')
  const [borderEnabled, setBorderEnabled] = useState(!!config.avatarBorderColor)
  const [borderColor, setBorderColor] = useState(config.avatarBorderColor || config.accentColor || '#6366f1')
  const [borderWidth, setBorderWidth] = useState(config.avatarBorderWidth || 4)
  const [padding, setPadding] = useState(config.avatarPadding || 6)

  const framed = bgEnabled || borderEnabled
  const previewBg = bgEnabled ? bgColor : undefined
  const previewBorder = borderEnabled ? `${borderWidth}px solid ${borderColor}` : undefined
  const previewPadding = framed ? padding : undefined

  async function save() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, tagline, bio, avatarUrl,
        avatarBgColor: bgEnabled ? bgColor : '',
        avatarBorderColor: borderEnabled ? borderColor : '',
        avatarBorderWidth: borderWidth,
        avatarPadding: framed ? padding : 0,
      }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="space-y-2">
          <Label>Avatar</Label>
          <ImageUpload
            value={avatarUrl}
            onChange={v => setAvatarUrl(v ?? '')}
            shape="circle"
            crop="square"
            maxDim={400}
            previewBg={previewBg}
            previewBorder={previewBorder}
            previewPadding={previewPadding}
          />
          <p className="text-xs text-muted-foreground">
            Upload a photo or paste any image URL (GitHub avatar, Gravatar, CDN link…). Transparent PNGs keep their transparency.
          </p>

          {/* Background & border options */}
          <div className="mt-3 space-y-3 rounded-lg border border-border p-3">
            {/* Background */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Background</p>
                <p className="text-xs text-muted-foreground">Fill behind the image (useful for transparent logos).</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {bgEnabled && (
                  <input
                    type="color"
                    aria-label="Background color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="h-9 w-12 rounded-md border border-input cursor-pointer p-1"
                  />
                )}
                <Switch checked={bgEnabled} onCheckedChange={setBgEnabled} />
              </div>
            </div>

            {/* Border */}
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <div>
                <p className="text-sm font-medium">Border</p>
                <p className="text-xs text-muted-foreground">Ring around the avatar.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {borderEnabled && (
                  <>
                    <input
                      type="color"
                      aria-label="Border color"
                      value={borderColor}
                      onChange={e => setBorderColor(e.target.value)}
                      className="h-9 w-12 rounded-md border border-input cursor-pointer p-1"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={1}
                        max={16}
                        aria-label="Border width"
                        value={borderWidth}
                        onChange={e => setBorderWidth(Math.max(1, Math.min(16, Number(e.target.value) || 1)))}
                        className="h-9 w-16"
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                  </>
                )}
                <Switch checked={borderEnabled} onCheckedChange={setBorderEnabled} />
              </div>
            </div>

            {/* Padding — breathing room between image and frame */}
            {framed && (
              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <div>
                  <p className="text-sm font-medium">Image padding</p>
                  <p className="text-xs text-muted-foreground">Inset so the background/border shows around the image.</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Input
                    type="number"
                    min={0}
                    max={24}
                    aria-label="Image padding"
                    value={padding}
                    onChange={e => setPadding(Math.max(0, Math.min(24, Number(e.target.value) || 0)))}
                    className="h-9 w-16"
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="Designer · Developer · Creator"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="A short bio about yourself…"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <SaveButton onSave={save} />
        </div>
      </CardContent>
    </Card>
  )
}
