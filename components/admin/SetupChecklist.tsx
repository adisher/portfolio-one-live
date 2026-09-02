'use client'

import Link from 'next/link'
import { DEFAULT_CONFIG, deriveContent, type SiteConfig } from '@/lib/config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check, ArrowRight } from 'lucide-react'

interface SetupChecklistProps {
  config: SiteConfig
}

// Permanent, non-linear guidance: shows what's left to set up and deep-links
// straight to the right panel. Disappears once everything is done.
export function SetupChecklist({ config }: SetupChecklistProps) {
  const blocks = deriveContent(config)

  const items = [
    {
      label: 'Add your name and tagline',
      href: '/admin/profile',
      done: !!config.name && config.name !== DEFAULT_CONFIG.name
        && !!config.tagline && config.tagline !== DEFAULT_CONFIG.tagline,
    },
    {
      label: 'Upload a profile photo',
      href: '/admin/profile',
      done: !!config.avatarUrl,
    },
    {
      label: 'Write a short bio',
      href: '/admin/profile',
      done: !!config.bio && config.bio !== DEFAULT_CONFIG.bio,
    },
    {
      label: 'Add your first link',
      href: '/admin/links',
      done: blocks.some(b => b.type === 'link' && !!b.url),
    },
    {
      label: 'Connect a social profile',
      href: '/admin/profile',
      done: Object.values(config.socials).some(v => !!v),
    },
    {
      label: 'Choose your look',
      href: '/admin/appearance',
      done: config.theme !== DEFAULT_CONFIG.theme
        || config.accentColor !== DEFAULT_CONFIG.accentColor
        || config.fontFamily !== DEFAULT_CONFIG.fontFamily,
    },
    {
      label: 'Set your page title for search',
      href: '/admin/settings',
      done: !!config.seoTitle && config.seoTitle !== DEFAULT_CONFIG.seoTitle,
    },
  ]

  const doneCount = items.filter(i => i.done).length
  const total = items.length

  // Nothing left to nag about — get out of the way for good.
  if (doneCount === total) return null

  const pending = items.filter(i => !i.done)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Finish setting up your page</CardTitle>
        <CardDescription>{doneCount} of {total} done</CardDescription>
        <div className="h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {pending.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 hover:bg-accent transition-colors"
          >
            <span className="text-sm">{item.label}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
        {doneCount > 0 && (
          <div className="pt-2 space-y-1">
            {items.filter(i => i.done).map(item => (
              <div key={item.label} className="flex items-center gap-2 px-3 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="line-through">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
