export interface LinkItem {
  id: string
  title: string
  url: string
  icon: string
  enabled: boolean
  order: number
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

export interface SiteConfig {
  name: string
  tagline: string
  bio: string
  avatarUrl: string
  links: LinkItem[]
  socials: SocialLinks
  socialVisibility: SocialVisibility
  theme: ThemeName
  accentColor: string
  fontFamily: string
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
  links: [],
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
  accentColor: '#6366f1',
  fontFamily: 'Inter',
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

export const REDIS_KEYS = {
  config: 'site:config',
  passwordHash: 'site:password_hash',
  analyticsViews: 'analytics:views',
  analyticsCountries: 'analytics:countries',
  analyticsReferrers: 'analytics:referrers',
  analyticsLinkClicks: 'analytics:link_clicks',
} as const
