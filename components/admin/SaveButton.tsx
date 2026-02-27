'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SaveButtonProps {
  onSave: () => Promise<void>
  label?: string
}

export function SaveButton({ onSave, label = 'Save Changes' }: SaveButtonProps) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle')

  async function handleSave() {
    setState('saving')
    try {
      await onSave()
      setState('saved')
      toast.success('Changes saved successfully!')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('idle')
      toast.error('Failed to save. Please try again.')
    }
  }

  return (
    <Button onClick={handleSave} disabled={state === 'saving'} className="min-w-[140px]">
      {state === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {state === 'saved' && <Check className="mr-2 h-4 w-4" />}
      {state === 'idle' ? label : state === 'saving' ? 'Saving…' : 'Saved!'}
    </Button>
  )
}
