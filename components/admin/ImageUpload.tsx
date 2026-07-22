'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (dataUrl: string | undefined) => void
  /** Longest edge the image is resized down to before storing. */
  maxDim?: number
  shape?: 'square' | 'circle'
  /** How to fit the source: 'square' centre-crops to 1:1; 'none' keeps aspect. */
  crop?: 'square' | 'none'
  /** Also offer a "paste image URL" field alongside upload. Default true. */
  allowUrl?: boolean
  /** Reflect a chosen background fill on the preview swatch. */
  previewBg?: string
  /** Reflect a chosen border (CSS border shorthand) on the preview swatch. */
  previewBorder?: string
  /** Reflect a chosen inner padding (px) on the preview swatch. */
  previewPadding?: number
}

// Resize + compress in the browser so we can store the image inline in the
// config (a data URI) — no external storage service, which keeps the
// self-host / auto-deploy model intact.
//
// Robust to any input: preserves transparency by exporting WebP (never JPEG,
// which would flatten transparent areas to black), centre-crops to a square
// for fixed-shape slots so any aspect ratio fits cleanly, and only ever
// downscales so small images are never upscaled into blur.
async function processImage(
  file: File,
  { maxDim, square, quality = 0.85 }: { maxDim: number; square: boolean; quality?: number },
): Promise<string> {
  const readAsDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('read failed'))
      reader.readAsDataURL(f)
    })

  const src = await readAsDataUrl(file)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('decode failed'))
    image.src = src
  })

  const sw = img.naturalWidth || img.width
  const sh = img.naturalHeight || img.height
  if (!sw || !sh) return src // e.g. an SVG with no intrinsic size — store as-is

  // Source rectangle: centre-crop to a square for fixed-shape slots.
  let sx = 0, sy = 0, scw = sw, sch = sh
  if (square) {
    const side = Math.min(sw, sh)
    sx = Math.round((sw - side) / 2)
    sy = Math.round((sh - side) / 2)
    scw = side
    sch = side
  }

  // Destination size: downscale only (longest edge capped at maxDim).
  let dw = scw, dh = sch
  const longest = Math.max(scw, sch)
  if (longest > maxDim) {
    const scale = maxDim / longest
    dw = Math.round(scw * scale)
    dh = Math.round(sch * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = dw
  canvas.height = dh
  const ctx = canvas.getContext('2d')
  if (!ctx) return src
  ctx.imageSmoothingQuality = 'high'
  // Canvas starts fully transparent; we never fill it, so alpha is preserved.
  ctx.drawImage(img, sx, sy, scw, sch, 0, 0, dw, dh)

  // WebP keeps the alpha channel and compresses well. If a browser can't
  // encode WebP it returns a PNG data URL instead (also alpha-safe).
  return canvas.toDataURL('image/webp', quality)
}

export function ImageUpload({ value, onChange, maxDim = 256, shape = 'square', crop = 'square', allowUrl = true, previewBg, previewBorder, previewPadding }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Show the URL field's text only when the value is an external URL, not an
  // uploaded data URI (which would be a huge unreadable string in the input).
  const urlFieldValue = value && !value.startsWith('data:') ? value : ''

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Image is too large (max 10MB).'); return }

    setBusy(true)
    setError('')
    try {
      const dataUrl = await processImage(file, { maxDim, square: crop === 'square' })
      onChange(dataUrl)
    } catch {
      setError('Could not process that image.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-lg'

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div
          className={`h-14 w-14 shrink-0 overflow-hidden flex items-center justify-center ${rounded} ${
            previewBorder ? '' : 'border border-border'
          } ${previewBg ? '' : 'bg-muted'}`}
          style={{ background: previewBg || undefined, border: previewBorder || undefined, padding: previewPadding || undefined, boxSizing: 'border-box' }}
        >
          {value ? (
            <div className={`h-full w-full overflow-hidden ${rounded}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {value ? 'Replace' : 'Upload'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)} disabled={busy}>
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {allowUrl && (
        <Input
          type="url"
          placeholder="…or paste an image URL"
          value={urlFieldValue}
          onChange={e => { setError(''); onChange(e.target.value || undefined) }}
        />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
