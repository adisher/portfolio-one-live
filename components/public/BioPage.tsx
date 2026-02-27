'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SiteConfig } from '@/lib/config'
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
  useEffect(() => {
    trackPageView()
  }, [])

  const enabledLinks = config.links
    .filter(l => l.enabled)
    .sort((a, b) => a.order - b.order)

  const socialEntries = Object.entries(config.socials) as [keyof typeof config.socials, string][]

  const fontMap: Record<string, string> = {
    Inter: "'Inter', sans-serif",
    Poppins: "'Poppins', sans-serif",
    Roboto: "'Roboto', sans-serif",
    Montserrat: "'Montserrat', sans-serif",
    'Playfair Display': "'Playfair Display', serif",
  }

  return (
    <div
      className={`bio-page ${themeClass}`}
      style={{ fontFamily: fontMap[config.fontFamily] || "'Inter', sans-serif" }}
    >
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-16">

        {/* Avatar */}
        <motion.div
          className="flex justify-center mb-6"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <div className="relative">
            {config.avatarUrl ? (
              <Image
                src={config.avatarUrl}
                alt={config.name}
                width={96}
                height={96}
                className="rounded-full object-cover ring-4 ring-white/20"
              />
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

        {/* Links */}
        {config.showLinks && enabledLinks.length > 0 && (
          <div className="space-y-3 mb-8">
            {enabledLinks.map((link, i) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLinkClick(link.id)}
                className="bio-link-card flex items-center gap-4 px-5 py-4 rounded-xl w-full"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i + 3}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--social-bg)' }}
                >
                  <DynamicIcon name={link.icon} className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                </span>
                <span className="flex-1 font-medium text-left" style={{ color: 'var(--text-primary)' }}>
                  {link.title}
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 bio-text-secondary" />
              </motion.a>
            ))}
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
            custom={enabledLinks.length + 3}
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
            custom={enabledLinks.length + 4}
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
    </div>
  )
}
