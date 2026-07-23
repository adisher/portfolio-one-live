export interface LinkItem {
  id: string
  title: string
  url: string
  icon: string
  enabled: boolean
  order: number
}

// ─── Unified content model (G1) ──────────────────────────────────────────────
// The page body is a single ordered list of typed blocks. In G1 only 'link'
// blocks exist; G2 adds header/video/music/embed. Legacy `links` are read as
// link blocks via deriveContent() for backward compatibility.
export type BlockType = 'link' | 'header' | 'video' | 'music' | 'embed'

export interface ContentBlock {
  id: string
  type: BlockType
  order: number
  enabled: boolean
  // link fields
  title?: string
  url?: string
  icon?: string
  thumbnailUrl?: string
  thumbBgColor?: string      // fill behind the thumbnail; '' / undefined = none
  thumbBorderColor?: string  // thumbnail border color; '' / undefined = none
  thumbBorderWidth?: number  // thumbnail border width in px
  thumbPadding?: number      // inset between the image and the frame; px
  featured?: boolean
  startAt?: string // ISO datetime — block hidden before this
  endAt?: string   // ISO datetime — block hidden after this
  ageGate?: boolean
  // header field
  text?: string
  // video / music / embed field
  embedUrl?: string
}

export interface SocialLinks {
  github: string
  twitter: string
  linkedin: string
  instagram: string
  youtube: string
  email: string
}

export interface SocialVisibility {
  github: boolean
  twitter: boolean
  linkedin: boolean
  instagram: boolean
  youtube: boolean
  email: boolean
}

export type ThemeName =
  | 'dark-gradient'
  | 'minimal-light'
  | 'glassmorphism'
  | 'neon-dark'
  | 'warm-gradient'
  | 'midnight'
  | 'forest'
  | 'rose-quartz'
  | 'mono-dark'
  | 'custom'

export interface CustomTheme {
  pageColor: string
  pageColor2: string   // second gradient stop; if same as pageColor → solid
  cardColor: string
  cardBorder: string
  textColor: string
  textMuted: string
}

export const DEFAULT_CUSTOM_THEME: CustomTheme = {
  pageColor: '#0f0c29',
  pageColor2: '#302b63',
  cardColor: '#1c1830',
  cardBorder: '#38325c',
  textColor: '#ffffff',
  textMuted: '#b8b3d9',
}

export type LinkLayout = 'list' | 'grid'
export type ButtonShape = 'rounded' | 'pill' | 'square'
export type ButtonFill = 'solid' | 'outline'
export type BackgroundType = 'theme' | 'image' | 'video'
// How a background video is displayed:
//  'auto'    — detect orientation from the video's metadata
//  'cover'   — fill the full page, reveal on scroll (best for vertical)
//  'natural' — keep aspect ratio, travel up with the scroll (best for landscape)
export type BackgroundVideoFit = 'auto' | 'cover' | 'natural'

export interface SiteConfig {
  name: string
  tagline: string
  bio: string
  avatarUrl: string
  avatarBgColor: string      // fill behind the avatar (shows through transparency); '' = none
  avatarBorderColor: string  // border ring color; '' = none
  avatarBorderWidth: number  // border width in px
  avatarPadding: number      // inset between the image and the frame (reveals background); px
  links: LinkItem[]
  content: ContentBlock[]
  socials: SocialLinks
  socialVisibility: SocialVisibility
  theme: ThemeName
  customTheme: CustomTheme
  accentColor: string
  fontFamily: string
  customCss: string
  backgroundType: BackgroundType
  backgroundUrl: string
  backgroundOverlay: number // 0–80: dark scrim over image/video for readability
  backgroundVideoFit: BackgroundVideoFit
  linkLayout: LinkLayout
  buttonShape: ButtonShape
  buttonFill: ButtonFill
  showLinks: boolean
  showSocials: boolean
  showVideo: boolean
  videoUrl: string
  showCTA: boolean
  ctaBadgeText: string
  ctaTitle: string
  ctaButtonText: string
  ctaButtonUrl: string
  seoTitle: string
  seoDescription: string
  ogImageUrl: string
}

export const DEFAULT_CONFIG: SiteConfig = {
  name: 'Your Name',
  tagline: 'Your Tagline Here',
  bio: 'Write a short bio about yourself here.',
  avatarUrl: '',
  avatarBgColor: '',
  avatarBorderColor: '',
  avatarBorderWidth: 4,
  avatarPadding: 0,
  links: [],
  content: [],
  socials: {
    github: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    email: '',
  },
  socialVisibility: {
    github: true,
    twitter: true,
    linkedin: true,
    instagram: true,
    youtube: true,
    email: true,
  },
  theme: 'dark-gradient',
  customTheme: DEFAULT_CUSTOM_THEME,
  accentColor: '#6366f1',
  fontFamily: 'Inter',
  customCss: '',
  backgroundType: 'theme',
  backgroundUrl: '',
  backgroundOverlay: 0,
  backgroundVideoFit: 'auto',
  linkLayout: 'list',
  buttonShape: 'rounded',
  buttonFill: 'solid',
  showLinks: true,
  showSocials: true,
  showVideo: false,
  videoUrl: '',
  showCTA: false,
  ctaBadgeText: '🎉 Special Offer',
  ctaTitle: 'Get Started Today',
  ctaButtonText: 'Learn More',
  ctaButtonUrl: '',
  seoTitle: 'Your Name',
  seoDescription: 'Check out my links and connect with me.',
  ogImageUrl: '',
}

// Source of truth for the page body. Once the content editor has saved, use
// `content`; otherwise derive link blocks from the legacy `links` array so
// existing sites keep working with zero migration.
export function deriveContent(config: SiteConfig): ContentBlock[] {
  if (config.content && config.content.length > 0) {
    return [...config.content].sort((a, b) => a.order - b.order)
  }
  return [...(config.links ?? [])]
    .sort((a, b) => a.order - b.order)
    .map(l => ({
      id: l.id,
      type: 'link' as const,
      order: l.order,
      enabled: l.enabled,
      title: l.title,
      url: l.url,
      icon: l.icon,
    }))
}

// True when a scheduled block should be visible right now.
export function isBlockLive(block: ContentBlock, now: number = Date.now()): boolean {
  if (block.startAt && now < new Date(block.startAt).getTime()) return false
  if (block.endAt && now > new Date(block.endAt).getTime()) return false
  return true
}

export const REDIS_KEYS = {
  config: 'site:config',
  passwordHash: 'site:password_hash',
  adminEmail: 'site:admin_email',
  resetToken: 'site:reset_token',
  analyticsViews: 'analytics:views',
  analyticsCountries: 'analytics:countries',
  analyticsReferrers: 'analytics:referrers',
  analyticsLinkClicks: 'analytics:link_clicks',
  requests: 'site:requests',
} as const
