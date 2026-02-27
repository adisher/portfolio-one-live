'use client'

import { useState } from 'react'
import { SiteConfig, SocialLinks, SocialVisibility } from '@/lib/config'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SaveButton } from '@/components/admin/SaveButton'
import { Github, Twitter, Linkedin, Instagram, Youtube, Mail } from 'lucide-react'

interface SocialEditorProps {
  config: SiteConfig
}

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; icon: React.ElementType; placeholder: string }[] = [
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@channel' },
  { key: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com' },
]

export function SocialEditor({ config }: SocialEditorProps) {
  const [socials, setSocials] = useState<SocialLinks>({ ...config.socials })
  const [visibility, setVisibility] = useState<SocialVisibility>({ ...config.socialVisibility })

  function updateSocial(key: keyof SocialLinks, value: string) {
    setSocials(prev => ({ ...prev, [key]: value }))
  }

  function toggleVisibility(key: keyof SocialVisibility) {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function save() {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ socials, socialVisibility: visibility }),
    })
    if (!res.ok) throw new Error('Save failed')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Profiles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor={`social-${key}`} className="text-xs font-medium">{label}</Label>
              <Input
                id={`social-${key}`}
                value={socials[key]}
                onChange={e => updateSocial(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">Show</span>
              <Switch
                checked={visibility[key]}
                onCheckedChange={() => toggleVisibility(key)}
              />
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <SaveButton onSave={save} />
        </div>
      </CardContent>
    </Card>
  )
}
