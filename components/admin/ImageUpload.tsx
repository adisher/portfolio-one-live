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
  /** Also offer a "paste image URL" field alongside upload. Default true. */
  allowUrl?: boolean
}

// Resize + compress in the browser so we can store the image inline in the
// config (a data URI) — no external storage service, which keeps the
// self-host / auto-deploy model intact.
async function fileToResizedDataUrl(file: File, maxDim: number, quality = 0.82): Promise<string> {
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

  let { width, height } = img
  if (width >= height && width > maxDim) {
    height = Math.round((height * maxDim) / width)
    width = maxDim
  } else if (height > width && height > maxDim) {
    width = Math.round((width * maxDim) / height)
    height = maxDim
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return src
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

export function ImageUpload({ value, onChange, maxDim = 256, shape = 'square', allowUrl = true }: ImageUploadProps) {
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
      const dataUrl = await fileToResizedDataUrl(file, maxDim)
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
          className={`h-14 w-14 shrink-0 overflow-hidden border border-border bg-muted flex items-center justify-center ${rounded}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
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
