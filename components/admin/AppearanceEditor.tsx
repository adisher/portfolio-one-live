'use client'

import { useState } from 'react'
import {
  SiteConfig, ThemeName,
  type LinkLayout, type ButtonShape, type ButtonFill, type BackgroundType,
} from '@/lib/config'
import { THEMES } from '@/lib/themes'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SaveButton } from '@/components/admin/SaveButton'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Check } from 'lucide-react'

interface AppearanceEditorProps {
  config: SiteConfig
}

const FONT_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Playfair Display',
]

export function AppearanceEditor({ config }: AppearanceEditorProps) {
  const [theme, setTheme] = useState<ThemeName>(config.theme)
  const [accentColor, setAccentColor] = useState(config.accentColor || '#6366f1')
  const [fontFamily, setFontFamily] = useState(config.fontFamily || 'Inter')
  const [linkLayout, setLinkLayout] = useState<LinkLayout>(config.linkLayout || 'list')
  const [buttonShape, setButtonShape] = useState<ButtonShape>(config.buttonShape || 'rounded')
  const [buttonFill, setButtonFill] = useState<ButtonFill>(config.buttonFill || 'solid')
  const [backgroundType, setBackgroundType] = useState<BackgroundType>(config.backgroundType || 'theme')
  const [backgroundUrl, setBackgroundUrl] = useState(config.backgroundUrl || '')
  const [backgroundOverlay, setBackgroundOverlay] = useState(config.backgroundOverlay || 0)
  const [customCss, setCustomCss] = useState(config.customCss || '')

  async function save() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme, accentColor, fontFamily,
        linkLayout, buttonShape, buttonFill,
        backgroundType, backgroundUrl, backgroundOverlay,
        customCss,
      }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  return (
    <div className="space-y-6">
      {/* Theme Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {THEMES.map(t => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                  theme === t.name
                    ? 'border-primary shadow-lg scale-[1.02]'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                {/* Mini preview */}
                <div
                  className="h-20 w-full p-3 flex flex-col gap-1.5"
                  style={{ background: t.preview.bg }}
                >
                  <div
                    className="h-3 w-1/2 rounded-full"
                    style={{ background: t.preview.text, opacity: 0.9 }}
                  />
                  <div
                    className="h-7 rounded-lg w-full"
                    style={{
                      background: t.preview.card,
                      border: `1px solid ${t.preview.text}22`,
                    }}
                  />
                  <div
                    className="h-7 rounded-lg w-full"
                    style={{
                      background: t.preview.card,
                      border: `1px solid ${t.preview.text}22`,
                    }}
                  />
                </div>
                {/* Label */}
                <div className="px-3 py-2 bg-background border-t border-border">
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                {/* Selected indicator */}
                {theme === t.name && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accent Color & Font */}
      <Card>
        <CardHeader>
          <CardTitle>Accent Color &amp; Font</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="accentColor"
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="h-10 w-16 rounded-md border border-input cursor-pointer p-1"
                />
                <span className="text-sm font-mono text-muted-foreground">{accentColor}</span>
              </div>
              <p className="text-xs text-muted-foreground">Used for CTA button and interactive elements</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font">Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger id="font" className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map(f => (
                  <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      {/* Layout & Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Layout &amp; Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Link layout</Label>
            <Select value={linkLayout} onValueChange={v => setLinkLayout(v as LinkLayout)}>
              <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List — full-width rows</SelectItem>
                <SelectItem value="grid">Grid — 2-column tiles</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Featured links, videos, music and embeds always span full width.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="space-y-2">
              <Label>Button shape</Label>
              <Select value={buttonShape} onValueChange={v => setButtonShape(v as ButtonShape)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="pill">Pill</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Button fill</Label>
              <Select value={buttonFill} onValueChange={v => setButtonFill(v as ButtonFill)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background */}
      <Card>
        <CardHeader>
          <CardTitle>Background</CardTitle>
          <CardDescription>Override the theme background with an image or video.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={backgroundType} onValueChange={v => setBackgroundType(v as BackgroundType)}>
              <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="theme">Theme default</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {backgroundType === 'image' && (
            <div className="space-y-2">
              <Label>Background image</Label>
              <ImageUpload value={backgroundUrl} onChange={v => setBackgroundUrl(v ?? '')} crop="none" maxDim={1280} />
              <p className="text-xs text-muted-foreground">Upload or paste an image URL. Covers the full screen.</p>
            </div>
          )}

          {backgroundType === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="bg-video">Video URL (.mp4)</Label>
              <Input id="bg-video" placeholder="https://…/background.mp4" value={backgroundUrl} onChange={e => setBackgroundUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">A direct .mp4 link. It autoplays muted and loops.</p>
            </div>
          )}

          {backgroundType !== 'theme' && (
            <div className="space-y-2">
              <Label>Darken overlay — {backgroundOverlay}%</Label>
              <input
                type="range" min={0} max={80} value={backgroundOverlay}
                onChange={e => setBackgroundOverlay(Number(e.target.value))}
                className="w-full max-w-md accent-primary"
              />
              <p className="text-xs text-muted-foreground">Adds a dark scrim so text stays readable over busy media.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom CSS */}
      <Card>
        <CardHeader>
          <CardTitle>Custom CSS</CardTitle>
          <CardDescription>Advanced — inject your own CSS. Applies to your public page only.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customCss}
            onChange={e => setCustomCss(e.target.value)}
            rows={6}
            spellCheck={false}
            placeholder={'.bio-link-card { letter-spacing: 0.02em; }'}
            className="font-mono text-xs"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SaveButton onSave={save} />
      </div>
    </div>
  )
}
