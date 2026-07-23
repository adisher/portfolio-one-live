import type { ElementType } from 'react'
import { Github, Twitter, Linkedin, Instagram, Youtube, Mail, Facebook, Twitch } from 'lucide-react'
import { TikTokIcon, ThreadsIcon, DiscordIcon, WhatsAppIcon } from './BrandIcons'
import type { SocialLinks } from '@/lib/config'

export interface SocialMeta {
  key: keyof SocialLinks
  label: string
  icon: ElementType
  placeholder: string
}

// Single source of truth for the social networks — used by the admin editor
// and the public page so icons/labels/order stay in sync.
export const SOCIAL_META: SocialMeta[] = [
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@channel' },
  { key: 'tiktok', label: 'TikTok', icon: TikTokIcon, placeholder: 'https://tiktok.com/@username' },
  { key: 'threads', label: 'Threads', icon: ThreadsIcon, placeholder: 'https://threads.net/@username' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { key: 'discord', label: 'Discord', icon: DiscordIcon, placeholder: 'https://discord.gg/invite' },
  { key: 'twitch', label: 'Twitch', icon: Twitch, placeholder: 'https://twitch.tv/username' },
  { key: 'whatsapp', label: 'WhatsApp', icon: WhatsAppIcon, placeholder: 'https://wa.me/15551234567' },
  { key: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com' },
]

export function socialHref(key: keyof SocialLinks, value: string): string {
  return key === 'email' ? `mailto:${value}` : value
}
