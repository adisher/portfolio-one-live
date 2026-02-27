'use client'

import { useState } from 'react'
import { SiteConfig, ThemeName } from '@/lib/config'
import { THEMES } from '@/lib/themes'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SaveButton } from '@/components/admin/SaveButton'
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

  async function save() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, accentColor, fontFamily }),
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

          <div className="flex justify-end">
            <SaveButton onSave={save} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
