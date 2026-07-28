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
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { SaveButton } from '@/components/admin/SaveButton'
import { IconPicker, DynamicIcon } from '@/components/admin/IconPicker'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { type SiteConfig, type ContentBlock, type BlockType, deriveContent } from '@/lib/config'
import {
  GripVertical, Pencil, Trash2, Star, Clock, ShieldAlert,
  Link2, Heading, Video, Music, Code2, ShoppingBag, Coffee,
} from 'lucide-react'

interface LinksEditorProps {
  config: SiteConfig
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: 'link', label: 'Link', icon: Link2 },
  { type: 'header', label: 'Header', icon: Heading },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'music', label: 'Music', icon: Music },
  { type: 'embed', label: 'Embed', icon: Code2 },
  { type: 'product', label: 'Product', icon: ShoppingBag },
  { type: 'tip', label: 'Tip jar', icon: Coffee },
]
const BLOCK_LABEL: Record<BlockType, string> = {
  link: 'Link', header: 'Header', video: 'Video', music: 'Music', embed: 'Embed',
  product: 'Product', tip: 'Tip jar',
}
const BLOCK_ICON: Record<BlockType, React.ElementType> = {
  link: Link2, header: Heading, video: Video, music: Music, embed: Code2,
  product: ShoppingBag, tip: Coffee,
}

// Creative default section headings, picked at random when a new section
// starts. Users can edit the text or switch the header off.
const HEADER_IDEAS: Record<BlockType, string[]> = {
  link: ['🔗 Explore My Links', '🌟 Where to Find Me', '👉 Start Here', '✨ My Corner of the Web'],
  video: ['🎬 Watch This', '📺 On Screen', '🍿 Press Play', '🎥 Featured Video'],
  music: ['🎵 Now Playing', '🎧 On Repeat', '🔊 Listen In', '🎶 My Soundtrack'],
  embed: ['✨ Take a Look', '📌 Check This Out', '👇 Right This Way', '🗓️ Let’s Connect'],
  product: ['🛍️ Shop My Work', '💎 Featured Product', '🧾 Grab Yours', '🚀 Get It Now'],
  tip: ['☕ Support My Work', '💛 Buy Me a Coffee', '🙏 Show Some Love', '✨ Tip Jar'],
  header: [''],
}
function creativeHeader(type: BlockType): string {
  const ideas = HEADER_IDEAS[type]
  return ideas[Math.floor(Math.random() * ideas.length)]
}

function rowSummary(b: ContentBlock): { primary: string; secondary: string } {
  switch (b.type) {
    case 'header': return { primary: b.text || 'Section header', secondary: 'Header' }
    case 'video': return { primary: b.embedUrl || 'No URL', secondary: 'Video' }
    case 'music': return { primary: b.embedUrl || 'No URL', secondary: 'Music embed' }
    case 'embed': return { primary: b.embedUrl || 'No URL', secondary: 'Embed' }
    case 'product': return { primary: b.title || 'Product', secondary: b.price ? `Product · ${b.price}` : 'Product' }
    case 'tip': return { primary: b.title || 'Tip jar', secondary: 'Tip jar' }
    default: return { primary: b.title || 'Untitled', secondary: b.url || 'No URL' }
  }
}

// A section = an optional leading header plus the blocks that follow it until
// the next header. The leading run of blocks before any header is the "__lead__"
// section. Sections are the unit that drags as a whole.
interface Section {
  id: string
  header: ContentBlock | null
  items: ContentBlock[]
}

function toSections(blocks: ContentBlock[]): Section[] {
  const sections: Section[] = []
  let cur: Section = { id: '__lead__', header: null, items: [] }
  for (const b of blocks) {
    if (b.type === 'header') {
      if (cur.header || cur.items.length) sections.push(cur)
      cur = { id: b.id, header: b, items: [] }
    } else {
      cur.items.push(b)
    }
  }
  if (cur.header || cur.items.length) sections.push(cur)
  return sections
}

function fromSections(sections: Section[]): ContentBlock[] {
  const out: ContentBlock[] = []
  for (const s of sections) {
    if (s.header) out.push(s.header)
    out.push(...s.items)
  }
  return out.map((b, i) => ({ ...b, order: i }))
}

interface SortableRowProps {
  block: ContentBlock
  onEdit: (b: ContentBlock) => void
  onDelete: (id: string) => void
  onToggle: (id: string, enabled: boolean) => void
}

function SortableRow({ block, onEdit, onDelete, onToggle }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const { primary, secondary } = rowSummary(block)
  const TypeIcon = BLOCK_ICON[block.type]

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

      {block.type === 'link' && block.thumbnailUrl ? (
        <div
          className="h-8 w-8 rounded overflow-hidden shrink-0"
          style={{
            background: block.thumbBgColor || undefined,
            border: block.thumbBorderColor
              ? `${block.thumbBorderWidth || 2}px solid ${block.thumbBorderColor}`
              : undefined,
            padding: (block.thumbBgColor || block.thumbBorderColor) ? (block.thumbPadding ?? 0) : 0,
            boxSizing: 'border-box',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.thumbnailUrl} alt="" className="h-full w-full object-cover rounded-sm" />
        </div>
      ) : block.type === 'link' ? (
        <DynamicIcon name={block.icon || 'Link'} className="h-5 w-5 shrink-0 text-muted-foreground" />
      ) : (
        <TypeIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate flex items-center gap-1.5">
          {primary}
          {block.featured && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
          {(block.startAt || block.endAt) && <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          {block.ageGate && <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
        </p>
        <p className="text-xs text-muted-foreground truncate">{secondary}</p>
      </div>

      <Switch
        checked={block.enabled}
        onCheckedChange={checked => onToggle(block.id, checked)}
        aria-label="Toggle visibility"
      />
      <Button variant="ghost" size="icon" onClick={() => onEdit(block)} aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost" size="icon"
        onClick={() => onDelete(block.id)}
        className="text-destructive hover:text-destructive"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface SortableSectionProps {
  section: Section
  sensors: ReturnType<typeof useSensors>
  onEdit: (b: ContentBlock) => void
  onDelete: (id: string) => void
  onToggle: (id: string, enabled: boolean) => void
  onItemsReorder: (sectionId: string, items: ContentBlock[]) => void
}

// One draggable group: the header + its sub-cards move together as a unit. The
// sub-cards reorder among themselves via a nested drag context.
function SortableSection({ section, sensors, onEdit, onDelete, onToggle, onItemsReorder }: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.55 : 1 }
  const header = section.header

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border bg-muted/40 p-2 space-y-2"
    >
      {/* Section bar — grip drags the whole group */}
      <div className="flex items-center gap-2 px-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          aria-label="Drag whole section"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        {header ? (
          <>
            <Heading className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="flex-1 min-w-0 text-sm font-semibold truncate">{header.text || 'Section header'}</p>
            <Switch checked={header.enabled} onCheckedChange={c => onToggle(header.id, c)} aria-label="Toggle header" />
            <Button variant="ghost" size="icon" onClick={() => onEdit(header)} aria-label="Edit header">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={() => onDelete(header.id)}
              className="text-destructive hover:text-destructive"
              aria-label="Delete header"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <p className="flex-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Ungrouped</p>
        )}
      </div>

      {/* Sub-cards — nested sortable, reorder within this section only */}
      {section.items.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={e => {
            const { active, over } = e
            if (over && active.id !== over.id) {
              const oldI = section.items.findIndex(i => i.id === active.id)
              const newI = section.items.findIndex(i => i.id === over.id)
              if (oldI >= 0 && newI >= 0) onItemsReorder(section.id, arrayMove(section.items, oldI, newI))
            }
          }}
        >
          <SortableContext items={section.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 pl-2">
              {section.items.map(item => (
                <SortableRow key={item.id} block={item} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

interface EditDialogProps {
  block: ContentBlock | null
  isNew: boolean
  open: boolean
  onClose: () => void
  onSave: (b: ContentBlock) => void
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

const EMBED_HELP: Partial<Record<BlockType, { placeholder: string; help: string }>> = {
  video: { placeholder: 'https://youtube.com/watch?v=… or vimeo.com/…', help: 'Paste a YouTube or Vimeo link.' },
  music: { placeholder: 'https://open.spotify.com/… or music.apple.com/…', help: 'Paste a Spotify or Apple Music link (track, album or playlist).' },
  embed: { placeholder: 'https://calendly.com/… , Typeform, etc.', help: 'Paste any embeddable URL. It renders in a sandboxed frame.' },
}

function EditDialog({ block, isNew, open, onClose, onSave }: EditDialogProps) {
  const type: BlockType = block?.type ?? 'link'

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('Link')
  const [text, setText] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [thumbBgEnabled, setThumbBgEnabled] = useState(false)
  const [thumbBgColor, setThumbBgColor] = useState('#ffffff')
  const [thumbBorderEnabled, setThumbBorderEnabled] = useState(false)
  const [thumbBorderColor, setThumbBorderColor] = useState('#6366f1')
  const [thumbBorderWidth, setThumbBorderWidth] = useState(2)
  const [thumbPadding, setThumbPadding] = useState(4)
  const [featured, setFeatured] = useState(false)
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [ageGate, setAgeGate] = useState(false)
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [buttonText, setButtonText] = useState('')

  const reset = useCallback((b: ContentBlock | null) => {
    setTitle(b?.title ?? '')
    setUrl(b?.url ?? '')
    setIcon(b?.icon ?? 'Link')
    setText(b?.text ?? '')
    setEmbedUrl(b?.embedUrl ?? '')
    setThumbnailUrl(b?.thumbnailUrl ?? '')
    setThumbBgEnabled(!!b?.thumbBgColor)
    setThumbBgColor(b?.thumbBgColor || '#ffffff')
    setThumbBorderEnabled(!!b?.thumbBorderColor)
    setThumbBorderColor(b?.thumbBorderColor || '#6366f1')
    setThumbBorderWidth(b?.thumbBorderWidth || 2)
    setThumbPadding(b?.thumbPadding ?? 4)
    setFeatured(!!b?.featured)
    setStartAt(toLocalInput(b?.startAt))
    setEndAt(toLocalInput(b?.endAt))
    setAgeGate(!!b?.ageGate)
    setPrice(b?.price ?? '')
    setDescription(b?.description ?? '')
    setButtonText(b?.buttonText ?? '')
  }, [])

  useEffect(() => {
    if (open) reset(block)
  }, [open, block, reset])

  function handleOpenChange(o: boolean) {
    if (!o) onClose()
  }

  function handleSave() {
    if (!block) return
    if (type === 'header') {
      onSave({ ...block, text })
    } else if (type === 'video' || type === 'music' || type === 'embed') {
      onSave({ ...block, embedUrl })
    } else if (type === 'product') {
      onSave({
        ...block,
        title, url, price, description,
        buttonText: buttonText || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        thumbBgColor: thumbBgEnabled ? thumbBgColor : undefined,
        thumbBorderColor: thumbBorderEnabled ? thumbBorderColor : undefined,
        thumbBorderWidth,
        thumbPadding: (thumbBgEnabled || thumbBorderEnabled) ? thumbPadding : undefined,
      })
    } else if (type === 'tip') {
      onSave({ ...block, title, icon, url, description, buttonText: buttonText || undefined })
    } else {
      onSave({
        ...block,
        title, url, icon,
        thumbnailUrl: thumbnailUrl || undefined,
        thumbBgColor: thumbBgEnabled ? thumbBgColor : undefined,
        thumbBorderColor: thumbBorderEnabled ? thumbBorderColor : undefined,
        thumbBorderWidth,
        thumbPadding: (thumbBgEnabled || thumbBorderEnabled) ? thumbPadding : undefined,
        featured: featured || undefined,
        startAt: fromLocalInput(startAt),
        endAt: fromLocalInput(endAt),
        ageGate: ageGate || undefined,
      })
    }
  }

  const thumbFramed = thumbBgEnabled || thumbBorderEnabled
  const thumbPreviewBg = thumbBgEnabled ? thumbBgColor : undefined
  const thumbPreviewBorder = thumbBorderEnabled ? `${thumbBorderWidth}px solid ${thumbBorderColor}` : undefined
  const thumbPreviewPadding = thumbFramed ? thumbPadding : undefined
  const embedHelp = EMBED_HELP[type]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add' : 'Edit'} {BLOCK_LABEL[type]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">

          {/* Header block */}
          {type === 'header' && (
            <div className="space-y-1">
              <Label htmlFor="hdr-text">Heading text</Label>
              <Input id="hdr-text" placeholder="e.g. My Music" value={text} onChange={e => setText(e.target.value)} />
              <p className="text-xs text-muted-foreground">A section title shown between blocks.</p>
            </div>
          )}

          {/* Video / music / embed blocks */}
          {(type === 'video' || type === 'music' || type === 'embed') && embedHelp && (
            <div className="space-y-1">
              <Label htmlFor="embed-url">URL</Label>
              <Input id="embed-url" placeholder={embedHelp.placeholder} value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">{embedHelp.help}</p>
            </div>
          )}

          {/* Product block */}
          {type === 'product' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="prod-title">Title</Label>
                <Input id="prod-title" placeholder="My E-book" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="prod-price">Price</Label>
                  <Input id="prod-price" placeholder="$29" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="prod-btn">Button text</Label>
                  <Input id="prod-btn" placeholder="Buy Now" value={buttonText} onChange={e => setButtonText(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="prod-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea id="prod-desc" rows={2} placeholder="What the buyer gets…" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="prod-url">Checkout link</Label>
                <Input id="prod-url" placeholder="Stripe / Gumroad / Lemon Squeezy URL" value={url} onChange={e => setUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground">Paste a hosted checkout link — the payment happens securely on their site, no setup here.</p>
              </div>
              <div className="space-y-1">
                <Label>Product image <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <ImageUpload value={thumbnailUrl} onChange={v => setThumbnailUrl(v ?? '')} crop="none" maxDim={640} shape="square" />
              </div>
            </>
          )}

          {/* Tip jar block */}
          {type === 'tip' && (
            <>
              <div className="space-y-1">
                <Label>Icon</Label>
                <IconPicker value={icon} onChange={setIcon} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tip-title">Title</Label>
                <Input id="tip-title" placeholder="Buy me a coffee" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tip-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea id="tip-desc" rows={2} placeholder="Support my work…" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="tip-btn">Button text</Label>
                  <Input id="tip-btn" placeholder="Support" value={buttonText} onChange={e => setButtonText(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="tip-url">Tip link</Label>
                <Input id="tip-url" placeholder="Ko-fi / Buy Me a Coffee / PayPal.me URL" value={url} onChange={e => setUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground">Paste your tipping/donation link — supporters pay on that provider.</p>
              </div>
            </>
          )}

          {/* Link block */}
          {type === 'link' && (
            <>
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
                <Label>Thumbnail image <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <ImageUpload
                  value={thumbnailUrl}
                  onChange={v => setThumbnailUrl(v ?? '')}
                  maxDim={256}
                  previewBg={thumbPreviewBg}
                  previewBorder={thumbPreviewBorder}
                  previewPadding={thumbPreviewPadding}
                />
                <p className="text-xs text-muted-foreground">Shown instead of the icon on the button.</p>

                <div className="mt-2 space-y-3 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Background</p>
                      <p className="text-xs text-muted-foreground">Fill behind transparent images.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {thumbBgEnabled && (
                        <input
                          type="color"
                          aria-label="Thumbnail background color"
                          value={thumbBgColor}
                          onChange={e => setThumbBgColor(e.target.value)}
                          className="h-9 w-12 rounded-md border border-input cursor-pointer p-1"
                        />
                      )}
                      <Switch checked={thumbBgEnabled} onCheckedChange={setThumbBgEnabled} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <div>
                      <p className="text-sm font-medium">Border</p>
                      <p className="text-xs text-muted-foreground">Ring around the thumbnail.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {thumbBorderEnabled && (
                        <>
                          <input
                            type="color"
                            aria-label="Thumbnail border color"
                            value={thumbBorderColor}
                            onChange={e => setThumbBorderColor(e.target.value)}
                            className="h-9 w-12 rounded-md border border-input cursor-pointer p-1"
                          />
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={1}
                              max={12}
                              aria-label="Thumbnail border width"
                              value={thumbBorderWidth}
                              onChange={e => setThumbBorderWidth(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                              className="h-9 w-16"
                            />
                            <span className="text-xs text-muted-foreground">px</span>
                          </div>
                        </>
                      )}
                      <Switch checked={thumbBorderEnabled} onCheckedChange={setThumbBorderEnabled} />
                    </div>
                  </div>

                  {thumbFramed && (
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                      <div>
                        <p className="text-sm font-medium">Image padding</p>
                        <p className="text-xs text-muted-foreground">Inset so the background/border shows around the image.</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          max={16}
                          aria-label="Thumbnail image padding"
                          value={thumbPadding}
                          onChange={e => setThumbPadding(Math.max(0, Math.min(16, Number(e.target.value) || 0)))}
                          className="h-9 w-16"
                        />
                        <span className="text-xs text-muted-foreground">px</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Featured</p>
                    <p className="text-xs text-muted-foreground">Highlight as a hero button (floats to top).</p>
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
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save {BLOCK_LABEL[type]}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LinksEditor({ config }: LinksEditorProps) {
  // Seed from the unified content model (falls back to legacy links).
  const [blocks, setBlocks] = useState<ContentBlock[]>(deriveContent(config))
  const [editing, setEditing] = useState<ContentBlock | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Reorder whole sections (header + its sub-cards move as one unit).
  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setBlocks(prev => {
      const secs = toSections(prev)
      const oldI = secs.findIndex(s => s.id === active.id)
      const newI = secs.findIndex(s => s.id === over.id)
      if (oldI < 0 || newI < 0) return prev
      return fromSections(arrayMove(secs, oldI, newI))
    })
  }

  // Reorder sub-cards within a single section.
  function handleItemsReorder(sectionId: string, items: ContentBlock[]) {
    setBlocks(prev => {
      const secs = toSections(prev).map(s => (s.id === sectionId ? { ...s, items } : s))
      return fromSections(secs)
    })
  }

  function handleEdit(block: ContentBlock) {
    setEditing({ ...block })
    setIsAdding(false)
    setDialogOpen(true)
  }

  function handleAdd(type: BlockType) {
    const base = { id: generateId(), type, enabled: true, order: blocks.length }
    let block: ContentBlock = base
    if (type === 'link') block = { ...base, title: '', url: '', icon: 'Link' }
    else if (type === 'tip') block = { ...base, icon: 'Coffee', buttonText: 'Support' }
    else if (type === 'product') block = { ...base, buttonText: 'Buy Now' }
    setEditing(block)
    setIsAdding(true)
    setDialogOpen(true)
  }

  function handleDialogSave(updated: ContentBlock) {
    setBlocks(prev => {
      const exists = prev.find(l => l.id === updated.id)
      if (exists) return prev.map(l => l.id === updated.id ? updated : l)

      // New block: when it starts a new section (list empty, or the previous
      // block is a different, non-header type), auto-insert a creative header
      // above it. The user can edit the text or switch it off.
      const last = prev[prev.length - 1]
      const needsHeader =
        updated.type !== 'header' &&
        (!last || (last.type !== 'header' && last.type !== updated.type))

      if (needsHeader) {
        const header: ContentBlock = {
          id: generateId(),
          type: 'header',
          enabled: true,
          order: prev.length,
          text: creativeHeader(updated.type),
        }
        return [...prev, header, updated]
      }
      return [...prev, updated]
    })
    setDialogOpen(false)
    setEditing(null)
  }

  function handleDelete(id: string) {
    setBlocks(prev => prev.filter(l => l.id !== id).map((l, i) => ({ ...l, order: i })))
  }

  function handleToggle(id: string, enabled: boolean) {
    setBlocks(prev => prev.map(l => l.id === id ? { ...l, enabled } : l))
  }

  async function handleSave() {
    // Persist to the unified content array (source of truth) and clear the
    // legacy `links` so deriveContent never resurrects deleted items.
    const content: ContentBlock[] = blocks.map((l, i) => ({ ...l, order: i }))
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, links: [] }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  const sections = toSections(blocks)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
        <CardDescription>Drag a group by its top handle to move it as a whole; drag a card inside to reorder within the group.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {blocks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nothing here yet. Add a block below to get started.
          </p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sections.map(section => (
                <SortableSection
                  key={section.id}
                  section={section}
                  sensors={sensors}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onItemsReorder={handleItemsReorder}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add-block toolbar */}
        <div className="pt-3 border-t border-border">
          <p className="text-sm font-medium">Add a block</p>
          <p className="text-xs text-muted-foreground mb-2">
            Use the buttons below to add links, headers, videos, music or embeds. A creative
            section heading is added automatically — edit its text or switch it off anytime.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {BLOCK_TYPES.map(t => (
              <Button key={t.type} variant="outline" size="sm" className="gap-1.5" onClick={() => handleAdd(t.type)}>
                <t.icon className="h-4 w-4" /> {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <SaveButton onSave={handleSave} />
        </div>
      </CardContent>

      <EditDialog
        block={editing}
        isNew={isAdding}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        onSave={handleDialogSave}
      />
    </Card>
  )
}
