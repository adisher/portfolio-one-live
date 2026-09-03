'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  type SiteConfig, type ContentBlock, type ThemeName, type SocialLinks,
  deriveContent,
} from '@/lib/config'
import { THEMES, getThemeClass } from '@/lib/themes'
import { FONTS } from '@/lib/fonts'
import { SOCIAL_META } from '@/components/public/socialConfig'
import { BioPage } from '@/components/public/BioPage'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ArrowLeft, ArrowRight, Loader2, PartyPopper, Plus, Trash2 } from 'lucide-react'

interface SetupWizardProps {
  config: SiteConfig
}

const STEPS = [
  { title: 'Who are you?', subtitle: 'The basics people see first.' },
  { title: 'Add your links', subtitle: 'The places you want to send people.' },
  { title: 'Your socials', subtitle: 'Shown as icons under your name.' },
  { title: 'Pick a look', subtitle: 'You can fine-tune this later.' },
  { title: "You're live!", subtitle: 'Your page is ready to share.' },
]

// Only the most common networks here — the rest live in Profile.
const WIZARD_SOCIALS = SOCIAL_META.filter(s =>
  ['instagram', 'twitter', 'youtube', 'tiktok', 'linkedin', 'github'].includes(s.key),
)

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

// `id` ties a row back to the block it came from, so re-running the wizard on
// an existing site edits those blocks in place instead of recreating them.
interface LinkRow { id?: string; title: string; url: string }

export function SetupWizard({ config }: SetupWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<SiteConfig>(config)

  const existingLinks = deriveContent(config).filter(b => b.type === 'link')
  const [rows, setRows] = useState<LinkRow[]>(
    existingLinks.length
      ? existingLinks.map(b => ({ id: b.id, title: b.title ?? '', url: b.url ?? '' }))
      : [{ title: '', url: '' }],
  )

  function patchDraft(patch: Partial<SiteConfig>) {
    setDraft(d => ({ ...d, ...patch }))
  }

  async function persist(patch: Partial<SiteConfig>) {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  // Each step saves before advancing, so abandoning halfway still leaves a
  // better page than the default.
  async function goNext() {
    setBusy(true)
    try {
      if (step === 0) {
        await persist({
          name: draft.name, tagline: draft.tagline, bio: draft.bio, avatarUrl: draft.avatarUrl,
        })
      } else if (step === 1) {
        // Edit matched blocks in place so everything the wizard doesn't ask
        // about — thumbnails, framing, featured, scheduling, pricing — survives,
        // and headers/videos keep their position relative to the links.
        const original = deriveContent(draft)
        const filled = rows.filter(r => r.title.trim() || r.url.trim())
        const keptIds = new Set(filled.map(r => r.id).filter(Boolean))
        const originalLinkIds = new Set(
          original.filter(b => b.type === 'link').map(b => b.id),
        )

        const merged: ContentBlock[] = []
        for (const block of original) {
          if (block.type !== 'link') { merged.push(block); continue }
          if (!keptIds.has(block.id)) continue // removed in the wizard
          const row = filled.find(r => r.id === block.id)!
          merged.push({ ...block, title: row.title.trim(), url: row.url.trim() })
        }
        // Rows the user typed fresh get appended in the order they added them.
        const nextRows: LinkRow[] = filled.map(r => ({ ...r }))
        for (const row of nextRows) {
          if (row.id && originalLinkIds.has(row.id)) continue
          row.id = generateId()
          merged.push({
            id: row.id, type: 'link', order: 0, enabled: true,
            title: row.title.trim(), url: row.url.trim(), icon: 'Link',
          })
        }

        const content = merged.map((b, i) => ({ ...b, order: i }))
        setRows(nextRows.length ? nextRows : [{ title: '', url: '' }])
        patchDraft({ content, links: [] })
        await persist({ content, links: [] })
      } else if (step === 2) {
        await persist({ socials: draft.socials })
      } else if (step === 3) {
        await persist({
          theme: draft.theme, accentColor: draft.accentColor, fontFamily: draft.fontFamily,
        })
      }
      setStep(s => s + 1)
    } finally {
      setBusy(false)
    }
  }

  async function complete(destination: string) {
    setBusy(true)
    try {
      await persist({ onboardingDone: true })
      router.push(destination)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const isLast = step === STEPS.length - 1

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
      {/* ── Steps ───────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
          <h1 className="text-2xl font-bold mt-1">{STEPS[step].title}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{STEPS[step].subtitle}</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-5">
            {/* Step 1 — identity */}
            {step === 0 && (
              <>
                <div className="space-y-1">
                  <Label>Profile photo</Label>
                  <ImageUpload
                    value={draft.avatarUrl}
                    onChange={v => patchDraft({ avatarUrl: v ?? '' })}
                    shape="circle" crop="square" maxDim={400}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="w-name">Your name</Label>
                  <Input id="w-name" value={draft.name} placeholder="Adil Sher"
                    onChange={e => patchDraft({ name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="w-tagline">Tagline</Label>
                  <Input id="w-tagline" value={draft.tagline} placeholder="Full Stack Developer"
                    onChange={e => patchDraft({ tagline: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="w-bio">Short bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea id="w-bio" rows={2} value={draft.bio} placeholder="I build things for the web."
                    onChange={e => patchDraft({ bio: e.target.value })} />
                </div>
              </>
            )}

            {/* Step 2 — links */}
            {step === 1 && (
              <>
                {rows.map((row, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Title</Label>
                      <Input value={row.title} placeholder="My Portfolio"
                        onChange={e => setRows(r => r.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">URL</Label>
                      <Input value={row.url} placeholder="https://example.com"
                        onChange={e => setRows(r => r.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                    </div>
                    {rows.length > 1 && (
                      <Button variant="ghost" size="icon" aria-label="Remove link"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setRows(r => r.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {rows.length < 6 && (
                  <Button variant="outline" size="sm" className="gap-1.5"
                    onClick={() => setRows(r => [...r, { title: '', url: '' }])}>
                    <Plus className="h-4 w-4" /> Add another
                  </Button>
                )}
              </>
            )}

            {/* Step 3 — socials */}
            {step === 2 && WIZARD_SOCIALS.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`w-${key}`} className="text-xs">{label}</Label>
                  <Input
                    id={`w-${key}`}
                    value={draft.socials[key as keyof SocialLinks]}
                    placeholder={placeholder}
                    onChange={e => patchDraft({ socials: { ...draft.socials, [key]: e.target.value } })}
                  />
                </div>
              </div>
            ))}

            {/* Step 4 — look */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {THEMES.map(t => (
                      <button
                        key={t.name}
                        onClick={() => patchDraft({ theme: t.name as ThemeName })}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                          draft.theme === t.name ? 'border-primary scale-[1.02]' : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div className="h-12 w-full" style={{ background: t.preview.bg }} />
                        <p className="text-xs py-1.5 px-2 bg-background truncate">{t.label}</p>
                        {draft.theme === t.name && (
                          <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="w-accent">Accent</Label>
                    <input id="w-accent" type="color" value={draft.accentColor}
                      onChange={e => patchDraft({ accentColor: e.target.value })}
                      className="h-10 w-16 rounded-md border border-input cursor-pointer p-1" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label>Font</Label>
                    <Select value={draft.fontFamily} onValueChange={v => patchDraft({ fontFamily: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-64">
                        {FONTS.map(f => (
                          <SelectItem key={f.name} value={f.name} style={{ fontFamily: f.stack }}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Step 5 — done */}
            {step === 4 && (
              <div className="text-center py-4 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <PartyPopper className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Your page is set up. You can keep refining it any time — the dashboard
                  shows what’s left, and every option lives in the panels on the left.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nav */}
        <div className="flex items-center justify-between gap-3">
          <div>
            {step > 0 && !isLast && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={busy} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isLast && (
              <>
                <Button variant="ghost" onClick={() => complete('/admin')} disabled={busy}>
                  Skip setup
                </Button>
                <Button onClick={goNext} disabled={busy} className="gap-1.5 min-w-[110px]">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </>
            )}
            {isLast && (
              <>
                <Button variant="outline" onClick={() => complete('/admin')} disabled={busy}>
                  Go to dashboard
                </Button>
                <Button onClick={() => complete('/')} disabled={busy} className="gap-1.5">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />} View my page
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Live preview ────────────────────────────────────────── */}
      <div className="hidden lg:block sticky top-8">
        <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Live preview</p>
        <div className="bio-preview mx-auto w-[320px] h-[620px] rounded-[2rem] border-8 border-neutral-800 bg-black overflow-hidden shadow-2xl">
          <div className="h-full w-full overflow-y-auto">
            <BioPage config={draft} themeClass={getThemeClass(draft.theme)} preview />
          </div>
        </div>
      </div>
    </div>
  )
}
