'use client'

import { useState, useCallback } from 'react'
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
import type { SiteConfig, LinkItem } from '@/lib/config'
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react'

interface LinksEditorProps {
  config: SiteConfig
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

interface SortableLinkRowProps {
  link: LinkItem
  onEdit: (link: LinkItem) => void
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

      <DynamicIcon name={link.icon} className="h-5 w-5 shrink-0 text-muted-foreground" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{link.title || 'Untitled'}</p>
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
  link: LinkItem | null
  open: boolean
  onClose: () => void
  onSave: (link: LinkItem) => void
}

function EditDialog({ link, open, onClose, onSave }: EditDialogProps) {
  const [title, setTitle] = useState(link?.title ?? '')
  const [url, setUrl] = useState(link?.url ?? '')
  const [icon, setIcon] = useState(link?.icon ?? 'Link')

  const reset = useCallback((l: LinkItem | null) => {
    setTitle(l?.title ?? '')
    setUrl(l?.url ?? '')
    setIcon(l?.icon ?? 'Link')
  }, [])

  function handleOpenChange(o: boolean) {
    if (!o) { onClose(); return }
    reset(link)
  }

  function handleSave() {
    if (!link) return
    onSave({ ...link, title, url, icon })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{link && links_isNew(link) ? 'Add Link' : 'Edit Link'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
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
function links_isNew(link: LinkItem) { return !link.title && !link.url }

export function LinksEditor({ config }: LinksEditorProps) {
  const [links, setLinks] = useState<LinkItem[]>(
    [...config.links].sort((a, b) => a.order - b.order)
  )
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
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

  function handleEdit(link: LinkItem) {
    setEditingLink({ ...link })
    setDialogOpen(true)
  }

  function handleAddNew() {
    setEditingLink({ id: generateId(), title: '', url: '', icon: 'Link', enabled: true, order: links.length })
    setDialogOpen(true)
  }

  function handleDialogSave(updated: LinkItem) {
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
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links }),
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
