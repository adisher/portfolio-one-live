'use client'

import { useState } from 'react'
import { SiteConfig } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

  async function save() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, tagline, bio, avatarUrl }),
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
          />
          <p className="text-xs text-muted-foreground">
            Upload a photo or paste any image URL (GitHub avatar, Gravatar, CDN link…). Transparent PNGs keep their transparency.
          </p>
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
