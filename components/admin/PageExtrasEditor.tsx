'use client'

import { useState } from 'react'
import { SiteConfig } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { SaveButton } from '@/components/admin/SaveButton'
import { AdvancedPanel } from '@/components/admin/AdvancedPanel'

interface PageExtrasEditorProps {
  config: SiteConfig
}

// The leftovers from the old "Sections" page, tucked behind Advanced on the
// Content page: the master content toggle, the CTA banner, and the legacy
// single video (only surfaced if it's still switched on — Video blocks
// replace it).
export function PageExtrasEditor({ config }: PageExtrasEditorProps) {
  const [showLinks, setShowLinks] = useState(config.showLinks)
  const [showCTA, setShowCTA] = useState(config.showCTA)
  const [ctaBadgeText, setCtaBadgeText] = useState(config.ctaBadgeText)
  const [ctaTitle, setCtaTitle] = useState(config.ctaTitle)
  const [ctaButtonText, setCtaButtonText] = useState(config.ctaButtonText)
  const [ctaButtonUrl, setCtaButtonUrl] = useState(config.ctaButtonUrl)
  const [showVideo, setShowVideo] = useState(config.showVideo)

  const hasLegacyVideo = config.showVideo && !!config.videoUrl

  async function save() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        showLinks, showCTA, ctaBadgeText, ctaTitle, ctaButtonText, ctaButtonUrl,
        ...(hasLegacyVideo ? { showVideo } : {}),
      }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  return (
    <AdvancedPanel title="Advanced" description="Content visibility and the call-to-action banner.">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Show content section</p>
          <p className="text-xs text-muted-foreground">Master switch for every block above.</p>
        </div>
        <Switch checked={showLinks} onCheckedChange={setShowLinks} />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">CTA banner</p>
            <p className="text-xs text-muted-foreground">A call-to-action block at the bottom of your page.</p>
          </div>
          <Switch checked={showCTA} onCheckedChange={setShowCTA} />
        </div>
        {showCTA && (
          <div className="space-y-4 pl-1">
            <div className="space-y-1">
              <Label htmlFor="ctaBadge">Badge text</Label>
              <Input id="ctaBadge" value={ctaBadgeText} onChange={e => setCtaBadgeText(e.target.value)} placeholder="🎉 Special Offer" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ctaTitle">Heading</Label>
              <Input id="ctaTitle" value={ctaTitle} onChange={e => setCtaTitle(e.target.value)} placeholder="Get Started Today" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ctaBtnText">Button text</Label>
                <Input id="ctaBtnText" value={ctaButtonText} onChange={e => setCtaButtonText(e.target.value)} placeholder="Learn More" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ctaBtnUrl">Button URL</Label>
                <Input id="ctaBtnUrl" value={ctaButtonUrl} onChange={e => setCtaButtonUrl(e.target.value)} placeholder="https://…" />
              </div>
            </div>
          </div>
        )}
      </div>

      {hasLegacyVideo && (
        <>
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Legacy video embed</p>
              <p className="text-xs text-muted-foreground">
                Replaced by Video blocks — switch this off and add a Video block instead.
              </p>
            </div>
            <Switch checked={showVideo} onCheckedChange={setShowVideo} />
          </div>
        </>
      )}

      <div className="flex justify-end">
        <SaveButton onSave={save} />
      </div>
    </AdvancedPanel>
  )
}
