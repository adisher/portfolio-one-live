'use client'

import { useState } from 'react'
import { SiteConfig } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SaveButton } from '@/components/admin/SaveButton'

interface SectionsEditorProps {
  config: SiteConfig
}

export function SectionsEditor({ config }: SectionsEditorProps) {
  const [showLinks, setShowLinks] = useState(config.showLinks)
  const [showSocials, setShowSocials] = useState(config.showSocials)
  const [showVideo, setShowVideo] = useState(config.showVideo)
  const [videoUrl, setVideoUrl] = useState(config.videoUrl)
  const [showCTA, setShowCTA] = useState(config.showCTA)
  const [ctaBadgeText, setCtaBadgeText] = useState(config.ctaBadgeText)
  const [ctaTitle, setCtaTitle] = useState(config.ctaTitle)
  const [ctaButtonText, setCtaButtonText] = useState(config.ctaButtonText)
  const [ctaButtonUrl, setCtaButtonUrl] = useState(config.ctaButtonUrl)

  async function save() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        showLinks, showSocials, showVideo, videoUrl,
        showCTA, ctaBadgeText, ctaTitle, ctaButtonText, ctaButtonUrl,
      }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Sections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Links toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Links Section</p>
            <p className="text-xs text-muted-foreground">Show your link cards on the public page</p>
          </div>
          <Switch checked={showLinks} onCheckedChange={setShowLinks} />
        </div>

        <Separator />

        {/* Socials toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Social Icons</p>
            <p className="text-xs text-muted-foreground">Show social media icon row</p>
          </div>
          <Switch checked={showSocials} onCheckedChange={setShowSocials} />
        </div>

        <Separator />

        {/* Video toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Video Embed</p>
              <p className="text-xs text-muted-foreground">Embed a YouTube video below your links</p>
            </div>
            <Switch checked={showVideo} onCheckedChange={setShowVideo} />
          </div>
          {showVideo && (
            <div className="space-y-2 pl-1">
              <Label htmlFor="videoUrl">YouTube URL</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          )}
        </div>

        <Separator />

        {/* CTA toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">CTA Banner</p>
              <p className="text-xs text-muted-foreground">Show a call-to-action section at the bottom</p>
            </div>
            <Switch checked={showCTA} onCheckedChange={setShowCTA} />
          </div>
          {showCTA && (
            <div className="space-y-4 pl-1">
              <div className="space-y-2">
                <Label htmlFor="ctaBadge">Badge Text</Label>
                <Input
                  id="ctaBadge"
                  value={ctaBadgeText}
                  onChange={e => setCtaBadgeText(e.target.value)}
                  placeholder="🎉 Special Offer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaTitle">Heading</Label>
                <Input
                  id="ctaTitle"
                  value={ctaTitle}
                  onChange={e => setCtaTitle(e.target.value)}
                  placeholder="Get Started Today"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ctaBtnText">Button Text</Label>
                  <Input
                    id="ctaBtnText"
                    value={ctaButtonText}
                    onChange={e => setCtaButtonText(e.target.value)}
                    placeholder="Learn More"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaBtnUrl">Button URL</Label>
                  <Input
                    id="ctaBtnUrl"
                    value={ctaButtonUrl}
                    onChange={e => setCtaButtonUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <SaveButton onSave={save} />
        </div>
      </CardContent>
    </Card>
  )
}
