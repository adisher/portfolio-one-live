'use client'

import { useState, useMemo } from 'react'
import * as Icons from 'lucide-react'
// We cast through unknown here because lucide-react's namespace also exports
// non-component helpers (createLucideIcon, etc.) that don't match our icon type.
// Using unknown as an intermediate avoids the TypeScript overlap error.
type AnyIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>
const IconMap = Icons as unknown as Record<string, AnyIcon>
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search } from 'lucide-react'

// Curated list of commonly useful icons for bio links
const ICON_NAMES = [
  'Link', 'Globe', 'Mail', 'Phone', 'MapPin', 'Calendar', 'Clock',
  'Star', 'Heart', 'Bookmark', 'Tag', 'Award', 'Zap', 'Flame',
  'Code', 'Terminal', 'Cpu', 'Database', 'Server', 'Cloud',
  'Youtube', 'Twitter', 'Instagram', 'Github', 'Linkedin', 'Facebook',
  'Music', 'Headphones', 'Mic', 'Video', 'Camera', 'Image', 'Film',
  'ShoppingCart', 'Store', 'Package', 'Gift', 'CreditCard',
  'BookOpen', 'FileText', 'Newspaper', 'Rss', 'MessageCircle', 'MessageSquare',
  'Users', 'User', 'Briefcase', 'Building', 'Home', 'Coffee', 'Utensils',
  'Gamepad2', 'Joystick', 'Trophy', 'Medal', 'Rocket', 'Sparkles',
  'Download', 'ExternalLink', 'Share2', 'Send', 'Bell', 'Info',
]

interface IconPickerProps {
  value: string
  onChange: (iconName: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return ICON_NAMES
    return ICON_NAMES.filter(n => n.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const CurrentIcon = (value && IconMap[value] ? IconMap[value] : Icons.Link) as AnyIcon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="text-sm">{value || 'Pick icon'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose an Icon</DialogTitle>
        </DialogHeader>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search icons…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
          {filtered.map(name => {
            const Icon = IconMap[name]
            if (!Icon) return null
            return (
              <button
                key={name}
                title={name}
                onClick={() => { onChange(name); setOpen(false) }}
                className={`flex flex-col items-center gap-1 p-2 rounded-md hover:bg-accent transition-colors text-xs ${value === name ? 'bg-primary/10 ring-1 ring-primary' : ''}`}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate w-full text-center text-[10px] text-muted-foreground">{name}</span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper: render a lucide icon by name string
export function DynamicIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = IconMap[name]
  if (!Icon) return <Icons.Link className={className} style={style} />
  return <Icon className={className} style={style} />
}
