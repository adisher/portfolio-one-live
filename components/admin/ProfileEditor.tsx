'use client'

import { useState } from 'react'
import Image from 'next/image'
import { SiteConfig } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SaveButton } from '@/components/admin/SaveButton'

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
        {/* Avatar preview */}
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar preview" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {name.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
            />
            <p className="text-xs text-muted-foreground">Paste any image URL — GitHub avatar, Gravatar, CDN link, etc.</p>
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
