'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface AdvancedPanelProps {
  title?: string
  description?: string
  defaultOpen?: boolean
  children: ReactNode
}

// Progressive disclosure: keeps rarely-used controls out of the way without
// hiding them. Used to separate everyday settings from advanced ones.
export function AdvancedPanel({
  title = 'Advanced',
  description,
  defaultOpen = false,
  children,
}: AdvancedPanelProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-accent/50 transition-colors rounded-xl"
      >
        <div>
          <p className="text-sm font-medium">{title}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="border-t border-border p-4 space-y-6">{children}</div>}
    </div>
  )
}
