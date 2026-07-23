'use client'

import { useState } from 'react'
import {
  SiteConfig, ThemeName,
  type LinkLayout, type ButtonShape, type ButtonFill, type BackgroundType,
  type BackgroundVideoFit, type OverlayColor, type CustomTheme, DEFAULT_CUSTOM_THEME,
} from '@/lib/config'
import { THEMES } from '@/lib/themes'
import { FONTS } from '@/lib/fonts'
import { Paintbrush } from 'lucide-react'
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

const CUSTOM_FIELDS: { key: keyof CustomTheme; label: string; hint?: string }[] = [
  { key: 'pageColor', label: 'Page background' },
  { key: 'pageColor2', label: 'Gradient end', hint: 'Match the page background for a solid color' },
  { key: 'cardColor', label: 'Card background' },
  { key: 'cardBorder', label: 'Card border' },
  { key: 'textColor', label: 'Text' },
  { key: 'textMuted', label: 'Muted text' },
]

export function AppearanceEditor({ config }: AppearanceEditorProps) {
  const [theme, setTheme] = useState<ThemeName>(config.theme)
  const [customTheme, setCustomTheme] = useState<CustomTheme>(config.customTheme || DEFAULT_CUSTOM_THEME)
  const [accentColor, setAccentColor] = useState(config.accentColor || '#6366f1')
  const [fontFamily, setFontFamily] = useState(config.fontFamily || 'Inter')

  function setCt<K extends keyof CustomTheme>(key: K, value: CustomTheme[K]) {
    setCustomTheme(prev => ({ ...prev, [key]: value }))
  }
  const [linkLayout, setLinkLayout] = useState<LinkLayout>(config.linkLayout || 'list')
  const [buttonShape, setButtonShape] = useState<ButtonShape>(config.buttonShape || 'rounded')
  const [buttonFill, setButtonFill] = useState<ButtonFill>(config.buttonFill || 'solid')
  const [backgroundType, setBackgroundType] = useState<BackgroundType>(config.backgroundType || 'theme')
  const [backgroundUrl, setBackgroundUrl] = useState(config.backgroundUrl || '')
  const [backgroundOverlay, setBackgroundOverlay] = useState(config.backgroundOverlay || 0)
  const [backgroundOverlayColor, setBackgroundOverlayColor] = useState<OverlayColor>(config.backgroundOverlayColor || 'auto')
  const [backgroundVideoFit, setBackgroundVideoFit] = useState<BackgroundVideoFit>(config.backgroundVideoFit || 'auto')
  const [customCss, setCustomCss] = useState(config.customCss || '')

  async function save() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme, customTheme, accentColor, fontFamily,
        linkLayout, buttonShape, buttonFill,
        backgroundType, backgroundUrl, backgroundOverlay, backgroundOverlayColor, backgroundVideoFit,
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

            {/* Build your own */}
            <button
              onClick={() => setTheme('custom')}
              className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                theme === 'custom' ? 'border-primary shadow-lg scale-[1.02]' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div
                className="h-20 w-full p-3 flex items-center justify-center"
                style={{
                  background: customTheme.pageColor2 && customTheme.pageColor2 !== customTheme.pageColor
                    ? `linear-gradient(160deg, ${customTheme.pageColor}, ${customTheme.pageColor2})`
                    : customTheme.pageColor,
                }}
              >
                <Paintbrush className="h-6 w-6" style={{ color: customTheme.textColor }} />
              </div>
              <div className="px-3 py-2 bg-background border-t border-border">
                <p className="text-sm font-medium">Build your own</p>
                <p className="text-xs text-muted-foreground">Custom colors</p>
              </div>
              {theme === 'custom' && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </button>
          </div>

          {/* Custom theme color pickers */}
          {theme === 'custom' && (
            <div className="mt-4 rounded-lg border border-border p-4 space-y-3">
              <p className="text-sm font-medium">Custom theme colors</p>
              {CUSTOM_FIELDS.map(f => (
                <div key={f.key} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm">{f.label}</p>
                    {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-muted-foreground">{customTheme[f.key]}</span>
                    <input
                      type="color"
                      aria-label={f.label}
                      value={customTheme[f.key]}
                      onChange={e => setCt(f.key, e.target.value)}
                      className="h-9 w-12 rounded-md border border-input cursor-pointer p-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
              <SelectContent className="max-h-72">
                {(['Sans', 'Serif', 'Display'] as const).map(cat => (
                  <div key={cat}>
                    <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{cat}</p>
                    {FONTS.filter(f => f.category === cat).map(f => (
                      <SelectItem key={f.name} value={f.name} style={{ fontFamily: f.stack }}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </div>
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
            <>
              <div className="space-y-2">
                <Label htmlFor="bg-video">Video URL (.mp4)</Label>
                <Input id="bg-video" placeholder="https://…/background.mp4" value={backgroundUrl} onChange={e => setBackgroundUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground">A direct .mp4 link. It autoplays muted and loops.</p>
              </div>
              <div className="space-y-2">
                <Label>Video display</Label>
                <Select value={backgroundVideoFit} onValueChange={v => setBackgroundVideoFit(v as BackgroundVideoFit)}>
                  <SelectTrigger className="w-full max-w-md"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto — detect orientation</SelectItem>
                    <SelectItem value="cover">Fill &amp; reveal on scroll — best for vertical</SelectItem>
                    <SelectItem value="natural">Fit width &amp; scroll — best for landscape</SelectItem>
                    <SelectItem value="pinned">Pinned — video stays, content scrolls over it</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  If a landscape video looks cropped into a vertical strip, choose “Fit width &amp; scroll”.
                </p>
              </div>
            </>
          )}

          {backgroundType !== 'theme' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Readability overlay</Label>
                <Select value={backgroundOverlayColor} onValueChange={v => setBackgroundOverlayColor(v as OverlayColor)}>
                  <SelectTrigger className="w-full max-w-md"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto — match the theme (recommended)</SelectItem>
                    <SelectItem value="dark">Dark scrim</SelectItem>
                    <SelectItem value="light">Light scrim</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Auto tints the media opposite to your theme’s text — dark scrim for light text, light
                  scrim for dark text — so content stays readable on any image or video.
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  Overlay strength — {backgroundOverlay}%
                  {backgroundOverlayColor === 'auto' && backgroundOverlay < 25 && (
                    <span className="text-muted-foreground font-normal"> (Auto keeps a 25% minimum)</span>
                  )}
                </Label>
                <input
                  type="range" min={0} max={80} value={backgroundOverlay}
                  onChange={e => setBackgroundOverlay(Number(e.target.value))}
                  className="w-full max-w-md accent-primary"
                />
              </div>
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
