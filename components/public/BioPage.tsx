'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SiteConfig, ContentBlock, deriveContent, isBlockLive } from '@/lib/config'
import { fontStack } from '@/lib/fonts'
import { DynamicIcon } from '@/components/admin/IconPicker'
import {
  Github, Twitter, Linkedin, Instagram, Youtube, Mail,
  ExternalLink,
} from 'lucide-react'

interface BioPageProps {
  config: SiteConfig
  themeClass: string
}

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return ''
  // Handle youtu.be short links
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  // Handle youtube.com/watch?v=
  const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`
  // Assume already an embed URL
  return url
}

// Video blocks: YouTube + Vimeo.
function getVideoEmbedUrl(url: string): string {
  if (!url) return ''
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return getYouTubeEmbedUrl(url)
}

// Music blocks: Spotify + Apple Music → embed URL + a sensible frame height.
function getMusicEmbed(url: string): { src: string; height: number } {
  if (!url) return { src: '', height: 152 }
  const sp = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show|artist)\/([a-zA-Z0-9]+)/)
  if (sp) {
    const compact = sp[1] === 'track' || sp[1] === 'episode'
    return { src: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}`, height: compact ? 152 : 352 }
  }
  if (url.includes('music.apple.com')) {
    const isSong = /[?&]i=\d+/.test(url) || /\/song\//.test(url)
    return { src: url.replace('music.apple.com', 'embed.music.apple.com'), height: isSong ? 175 : 450 }
  }
  return { src: url, height: 152 }
}

function trackPageView() {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'pageview' }),
  }).catch(() => {})
}

function trackLinkClick(linkId: string) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'linkclick', linkId }),
  }).catch(() => {})
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const socialIconMap: Record<string, React.ElementType> = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  email: Mail,
}

export function BioPage({ config, themeClass }: BioPageProps) {
  const [ageGateBlock, setAgeGateBlock] = useState<ContentBlock | null>(null)

  useEffect(() => {
    trackPageView()
  }, [])

  // Unified content list: enabled blocks within their schedule window, with
  // featured links floated to the top (stable sort preserves order otherwise).
  const blocks = deriveContent(config)
    .filter(b => b.enabled && isBlockLive(b))
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))

  const socialEntries = Object.entries(config.socials) as [keyof typeof config.socials, string][]

  const hasMediaBg = config.backgroundType !== 'theme' && !!config.backgroundUrl
  const isGrid = config.linkLayout === 'grid'

  // Custom theme → inline CSS variables that override the (empty) theme-custom
  // class. Custom properties inherit, so all children pick them up.
  const ct = config.customTheme
  const customVars = config.theme === 'custom' && ct
    ? {
        '--page-bg': ct.pageColor2 && ct.pageColor2 !== ct.pageColor
          ? `linear-gradient(160deg, ${ct.pageColor}, ${ct.pageColor2})`
          : ct.pageColor,
        '--card-bg': ct.cardColor,
        '--card-border': ct.cardBorder,
        '--card-hover-bg': ct.cardColor,
        '--card-hover-border': ct.textColor,
        '--text-primary': ct.textColor,
        '--text-secondary': ct.textMuted,
        '--social-bg': ct.cardColor,
        '--social-hover': ct.cardBorder,
        '--cta-bg': ct.cardColor,
        '--cta-border': ct.cardBorder,
      }
    : {}

  return (
    <div
      className={`bio-page ${themeClass}`}
      style={{ fontFamily: fontStack(config.fontFamily), position: 'relative', ...customVars } as React.CSSProperties}
    >
      {/* Owner-authored custom CSS */}
      {config.customCss && <style dangerouslySetInnerHTML={{ __html: config.customCss }} />}

      {/* Custom background layer (image / video) + readability scrim */}
      {hasMediaBg && config.backgroundType === 'image' && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.backgroundUrl})` }}
          aria-hidden
        />
      )}
      {hasMediaBg && config.backgroundType === 'video' && (
        <video
          className="fixed inset-0 z-0 h-full w-full object-cover"
          src={config.backgroundUrl}
          autoPlay muted loop playsInline
          aria-hidden
        />
      )}
      {hasMediaBg && config.backgroundOverlay > 0 && (
        <div
          className="fixed inset-0 z-0"
          style={{ background: `rgba(0,0,0,${Math.min(80, config.backgroundOverlay) / 100})` }}
          aria-hidden
        />
      )}

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12 sm:py-16">

        {/* Avatar */}
        <motion.div
          className="flex justify-center mb-6"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <div className="relative">
            {config.avatarUrl ? (
              <div
                className={`w-24 h-24 rounded-full overflow-hidden ${
                  config.avatarBorderColor ? '' : 'ring-4 ring-white/20'
                }`}
                style={{
                  background: config.avatarBgColor || undefined,
                  border: config.avatarBorderColor
                    ? `${config.avatarBorderWidth || 4}px solid ${config.avatarBorderColor}`
                    : undefined,
                  padding: (config.avatarBgColor || config.avatarBorderColor) ? (config.avatarPadding || 0) : 0,
                  boxSizing: 'border-box',
                }}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={config.avatarUrl}
                    alt={config.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                style={{
                  background: 'var(--card-bg)',
                  border: '2px solid var(--card-border)',
                  color: 'var(--text-primary)',
                }}
              >
                {config.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </motion.div>

        {/* Name & tagline */}
        <motion.div
          className="text-center mb-8"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {config.name}
          </h1>
          {config.tagline && (
            <p className="text-base sm:text-lg bio-text-secondary">{config.tagline}</p>
          )}
          {config.bio && (
            <p
              className="mt-3 text-sm bio-text-secondary max-w-sm mx-auto leading-relaxed"
            >
              {config.bio}
            </p>
          )}
        </motion.div>

        {/* Social icons */}
        {config.showSocials && socialEntries.some(([key, val]) => val && config.socialVisibility[key]) && (
          <motion.div
            className="flex justify-center gap-3 mb-8 flex-wrap"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            {socialEntries.map(([key, value]) => {
              if (!value || !config.socialVisibility[key]) return null
              const Icon = socialIconMap[key]
              const href = key === 'email' ? `mailto:${value}` : value
              return (
                <motion.a
                  key={key}
                  href={href}
                  target={key === 'email' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="bio-social-icon rounded-full w-10 h-10 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              )
            })}
          </motion.div>
        )}

        {/* Content blocks */}
        {config.showLinks && blocks.length > 0 && (
          <div className={isGrid ? 'grid grid-cols-2 gap-3 mb-8 items-start' : 'space-y-3 mb-8'}>
            {blocks.map((block, i) => {
              const delay = i + 3

              if (block.type === 'header') {
                return (
                  <motion.div
                    key={block.id}
                    className={`flex items-center gap-3 pt-7 pb-1 first:pt-1 ${isGrid ? 'col-span-2' : ''}`}
                    variants={fadeUp} initial="hidden" animate="visible" custom={delay}
                  >
                    <span className="h-px flex-1" style={{ background: 'var(--card-border)' }} />
                    <h2
                      className="text-xs font-bold uppercase tracking-[0.18em] whitespace-nowrap"
                      style={{ color: 'var(--text-primary)', opacity: 0.9 }}
                    >
                      {block.text}
                    </h2>
                    <span className="h-px flex-1" style={{ background: 'var(--card-border)' }} />
                  </motion.div>
                )
              }

              if (block.type === 'video') {
                const src = getVideoEmbedUrl(block.embedUrl || '')
                if (!src) return null
                return (
                  <motion.div
                    key={block.id}
                    className={`rounded-xl overflow-hidden ${isGrid ? 'col-span-2' : ''}`}
                    style={{ border: '1px solid var(--card-border)' }}
                    variants={fadeUp} initial="hidden" animate="visible" custom={delay}
                  >
                    <iframe
                      src={src}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video"
                    />
                  </motion.div>
                )
              }

              if (block.type === 'music') {
                const { src, height } = getMusicEmbed(block.embedUrl || '')
                if (!src) return null
                return (
                  <motion.div
                    key={block.id}
                    className={`rounded-xl overflow-hidden ${isGrid ? 'col-span-2' : ''}`}
                    variants={fadeUp} initial="hidden" animate="visible" custom={delay}
                  >
                    <iframe
                      src={src}
                      className="w-full"
                      style={{ height, border: 0 }}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title="Music"
                    />
                  </motion.div>
                )
              }

              if (block.type === 'embed') {
                if (!block.embedUrl) return null
                return (
                  <motion.div
                    key={block.id}
                    className={`rounded-xl overflow-hidden bg-white ${isGrid ? 'col-span-2' : ''}`}
                    style={{ border: '1px solid var(--card-border)' }}
                    variants={fadeUp} initial="hidden" animate="visible" custom={delay}
                  >
                    <iframe
                      src={block.embedUrl}
                      className="w-full"
                      style={{ height: 460 }}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                      title="Embedded content"
                    />
                  </motion.div>
                )
              }

              const featured = !!block.featured
              const gridTile = isGrid && !featured // featured links stay full-width
              const colSpan = isGrid ? (featured ? 'col-span-2' : 'col-span-1') : ''
              return (
                <motion.a
                  key={block.id}
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => {
                    if (block.ageGate) {
                      e.preventDefault()
                      setAgeGateBlock(block)
                    } else {
                      trackLinkClick(block.id)
                    }
                  }}
                  className={`bio-link-card shape-${config.buttonShape} fill-${config.buttonFill} flex w-full ${colSpan} ${
                    gridTile
                      ? 'flex-col items-center text-center gap-2 px-4 py-5'
                      : `items-center gap-4 px-5 ${featured ? 'py-5' : 'py-4'}`
                  }`}
                  style={featured ? {
                    boxShadow: `0 0 0 1.5px ${config.accentColor || '#6366f1'}, 0 10px 30px -12px ${config.accentColor || '#6366f1'}99`,
                  } : undefined}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i + 3}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {block.thumbnailUrl ? (
                    <div
                      className={`${gridTile ? 'w-14 h-14' : 'w-11 h-11'} rounded-lg overflow-hidden shrink-0`}
                      style={{
                        background: block.thumbBgColor || undefined,
                        border: block.thumbBorderColor
                          ? `${block.thumbBorderWidth || 2}px solid ${block.thumbBorderColor}`
                          : undefined,
                        padding: (block.thumbBgColor || block.thumbBorderColor) ? (block.thumbPadding ?? 0) : 0,
                        boxSizing: 'border-box',
                      }}
                    >
                      <img src={block.thumbnailUrl} alt="" className="w-full h-full object-cover rounded-md" />
                    </div>
                  ) : (
                    <span
                      className={`${gridTile ? 'w-11 h-11' : 'w-9 h-9'} rounded-lg flex items-center justify-center shrink-0`}
                      style={{ background: 'var(--social-bg)' }}
                    >
                      <DynamicIcon name={block.icon || 'Link'} className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                    </span>
                  )}
                  <span
                    className={`${gridTile ? 'text-center text-sm' : 'flex-1 text-left'} ${featured ? 'font-semibold text-lg' : 'font-medium'}`}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {block.title}
                  </span>
                  {!gridTile && <ExternalLink className="h-4 w-4 shrink-0 bio-text-secondary" />}
                </motion.a>
              )
            })}
          </div>
        )}

        {/* Video embed */}
        {config.showVideo && config.videoUrl && (
          <motion.div
            className="mb-8 rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--card-border)' }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={blocks.length + 3}
          >
            <iframe
              src={getYouTubeEmbedUrl(config.videoUrl)}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded video"
            />
          </motion.div>
        )}

        {/* CTA banner */}
        {config.showCTA && config.ctaTitle && (
          <motion.div
            className="bio-cta rounded-2xl p-6 text-center"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={blocks.length + 4}
          >
            {config.ctaBadgeText && (
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
                style={{
                  background: 'var(--social-bg)',
                  color: 'var(--text-primary)',
                }}
              >
                {config.ctaBadgeText}
              </span>
            )}
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {config.ctaTitle}
            </h2>
            {config.ctaButtonUrl && config.ctaButtonText && (
              <a
                href={config.ctaButtonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
                style={{
                  background: config.accentColor || '#6366f1',
                  color: '#ffffff',
                }}
              >
                {config.ctaButtonText}
              </a>
            )}
          </motion.div>
        )}

      </div>

      {/* Age-gate confirmation */}
      {ageGateBlock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setAgeGateBlock(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">Age Confirmation</h3>
            <p className="text-sm bio-text-secondary mb-5">
              This content is intended for adults. Are you 18 or older?
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 rounded-xl font-medium"
                style={{ background: 'var(--social-bg)', color: 'var(--text-primary)' }}
                onClick={() => setAgeGateBlock(null)}
              >
                No, exit
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl font-semibold text-white"
                style={{ background: config.accentColor || '#6366f1' }}
                onClick={() => {
                  trackLinkClick(ageGateBlock.id)
                  if (ageGateBlock.url) window.open(ageGateBlock.url, '_blank', 'noopener,noreferrer')
                  setAgeGateBlock(null)
                }}
              >
                Yes, I&apos;m 18+
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
