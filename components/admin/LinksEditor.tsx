'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { SaveButton } from '@/components/admin/SaveButton'
import { IconPicker, DynamicIcon } from '@/components/admin/IconPicker'
import { type SiteConfig, type ContentBlock, deriveContent } from '@/lib/config'
import { GripVertical, Pencil, Trash2, Plus, Star, Clock, ShieldAlert } from 'lucide-react'

interface LinksEditorProps {
  config: SiteConfig
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface SortableLinkRowProps {
  link: ContentBlock
  onEdit: (link: ContentBlock) => void
  onDelete: (id: string) => void
  onToggle: (id: string, enabled: boolean) => void
}

function SortableLinkRow({ link, onEdit, onDelete, onToggle }: SortableLinkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {link.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={link.thumbnailUrl} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
      ) : (
        <DynamicIcon name={link.icon || 'Link'} className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate flex items-center gap-1.5">
          {link.title || 'Untitled'}
          {link.featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
          {(link.startAt || link.endAt) && <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          {link.ageGate && <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        </p>
        <p className="text-xs text-muted-foreground truncate">{link.url || 'No URL'}</p>
      </div>

      <Switch
        checked={link.enabled}
        onCheckedChange={checked => onToggle(link.id, checked)}
        aria-label={`Toggle ${link.title}`}
      />
      <Button variant="ghost" size="icon" onClick={() => onEdit(link)} aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost" size="icon"
        onClick={() => onDelete(link.id)}
        className="text-destructive hover:text-destructive"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface EditDialogProps {
  link: ContentBlock | null
  open: boolean
  onClose: () => void
  onSave: (link: ContentBlock) => void
}

// datetime-local wants "YYYY-MM-DDTHH:mm"; ISO strings include seconds/zone.
function toLocalInput(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function fromLocalInput(v: string): string | undefined {
  if (!v) return undefined
  const d = new Date(v)
  return isNaN(d.getTime()) ? undefined : d.toISOString()
}

function EditDialog({ link, open, onClose, onSave }: EditDialogProps) {
  const [title, setTitle] = useState(link?.title ?? '')
  const [url, setUrl] = useState(link?.url ?? '')
  const [icon, setIcon] = useState(link?.icon ?? 'Link')
  const [thumbnailUrl, setThumbnailUrl] = useState(link?.thumbnailUrl ?? '')
  const [featured, setFeatured] = useState(!!link?.featured)
  const [startAt, setStartAt] = useState(toLocalInput(link?.startAt))
  const [endAt, setEndAt] = useState(toLocalInput(link?.endAt))
  const [ageGate, setAgeGate] = useState(!!link?.ageGate)

  const reset = useCallback((l: ContentBlock | null) => {
    setTitle(l?.title ?? '')
    setUrl(l?.url ?? '')
    setIcon(l?.icon ?? 'Link')
    setThumbnailUrl(l?.thumbnailUrl ?? '')
    setFeatured(!!l?.featured)
    setStartAt(toLocalInput(l?.startAt))
    setEndAt(toLocalInput(l?.endAt))
    setAgeGate(!!l?.ageGate)
  }, [])

  // Sync fields whenever the dialog opens (programmatic open doesn't fire
  // Radix's onOpenChange, so we can't rely on that to seed the form).
  useEffect(() => {
    if (open) reset(link)
  }, [open, link, reset])

  function handleOpenChange(o: boolean) {
    if (!o) onClose()
  }

  function handleSave() {
    if (!link) return
    onSave({
      ...link,
      title,
      url,
      icon,
      thumbnailUrl: thumbnailUrl || undefined,
      featured: featured || undefined,
      startAt: fromLocalInput(startAt),
      endAt: fromLocalInput(endAt),
      ageGate: ageGate || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{link && links_isNew(link) ? 'Add Link' : 'Edit Link'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1">
            <Label htmlFor="link-title">Title</Label>
            <Input id="link-title" placeholder="My Website" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-url">URL</Label>
            <Input id="link-url" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="link-thumb">Thumbnail image URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="link-thumb" placeholder="https://…/image.jpg" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
            <p className="text-xs text-muted-foreground">Shown instead of the icon on the button.</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className="text-xs text-muted-foreground">Highlight as a hero button.</p>
              </div>
            </div>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Age gate (18+)</p>
                <p className="text-xs text-muted-foreground">Ask for confirmation before opening.</p>
              </div>
            </div>
            <Switch checked={ageGate} onCheckedChange={setAgeGate} />
          </div>

          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Schedule <span className="text-muted-foreground font-normal">(optional)</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="link-start" className="text-xs">Show from</Label>
                <Input id="link-start" type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="link-end" className="text-xs">Hide after</Label>
                <Input id="link-end" type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper to check if a link is brand-new (not yet in the list)
function links_isNew(link: ContentBlock) { return !link.title && !link.url }

export function LinksEditor({ config }: LinksEditorProps) {
  // Seed from the unified content model (falls back to legacy links).
  const [links, setLinks] = useState<ContentBlock[]>(
    deriveContent(config).filter(b => b.type === 'link')
  )
  const [editingLink, setEditingLink] = useState<ContentBlock | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLinks(prev => {
        const oldIndex = prev.findIndex(l => l.id === active.id)
        const newIndex = prev.findIndex(l => l.id === over.id)
        return arrayMove(prev, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }))
      })
    }
  }

  function handleEdit(link: ContentBlock) {
    setEditingLink({ ...link })
    setDialogOpen(true)
  }

  function handleAddNew() {
    setEditingLink({ id: generateId(), type: 'link', title: '', url: '', icon: 'Link', enabled: true, order: links.length })
    setDialogOpen(true)
  }

  function handleDialogSave(updated: ContentBlock) {
    setLinks(prev => {
      const exists = prev.find(l => l.id === updated.id)
      return exists
        ? prev.map(l => l.id === updated.id ? updated : l)
        : [...prev, updated]
    })
    setDialogOpen(false)
    setEditingLink(null)
  }

  function handleDelete(id: string) {
    setLinks(prev => prev.filter(l => l.id !== id).map((l, i) => ({ ...l, order: i })))
  }

  function handleToggle(id: string, enabled: boolean) {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, enabled } : l))
  }

  async function handleSave() {
    // Persist to the unified content array (source of truth going forward) and
    // clear the legacy `links` so deriveContent never resurrects deleted links.
    const content: ContentBlock[] = links.map((l, i) => ({ ...l, type: 'link', order: i }))
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, links: [] }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links</CardTitle>
        <CardDescription>Add, edit, reorder and toggle your bio links. Drag to reorder.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
            {links.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No links yet. Click &quot;Add Link&quot; to get started.
              </p>
            )}
            {links.map(link => (
              <SortableLinkRow
                key={link.id}
                link={link}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </SortableContext>
        </DndContext>

        <Button variant="outline" className="w-full gap-2 mt-2" onClick={handleAddNew}>
          <Plus className="h-4 w-4" />
          Add Link
        </Button>

        <div className="flex justify-end pt-2">
          <SaveButton onSave={handleSave} />
        </div>
      </CardContent>

      <EditDialog
        link={editingLink}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingLink(null) }}
        onSave={handleDialogSave}
      />
    </Card>
  )
}
