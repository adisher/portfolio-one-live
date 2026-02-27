import { Redis } from '@upstash/redis'
import { SiteConfig, DEFAULT_CONFIG, REDIS_KEYS } from './config'

let redis: Redis | null = null

function getRedis(): Redis {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set')
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

export async function getConfig(): Promise<SiteConfig> {
  try {
    const r = getRedis()
    const data = await r.get<SiteConfig>(REDIS_KEYS.config)
    if (!data) return DEFAULT_CONFIG
    // Merge with defaults so new fields are always present
    return { ...DEFAULT_CONFIG, ...data }
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function setConfig(config: SiteConfig): Promise<void> {
  const r = getRedis()
  await r.set(REDIS_KEYS.config, config)
}

export async function getPasswordHash(): Promise<string | null> {
  try {
    const r = getRedis()
    return await r.get<string>(REDIS_KEYS.passwordHash)
  } catch {
    return null
  }
}

export async function setPasswordHash(hash: string): Promise<void> {
  const r = getRedis()
  await r.set(REDIS_KEYS.passwordHash, hash)
}

export async function isRedisConfigured(): Promise<boolean> {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

// Analytics helpers

export async function trackPageView(country: string, referrer: string): Promise<void> {
  try {
    const r = getRedis()
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const pipeline = r.pipeline()
    pipeline.hincrby(REDIS_KEYS.analyticsViews, today, 1)
    if (country && country !== 'XX') {
      pipeline.zincrby(REDIS_KEYS.analyticsCountries, 1, country)
    }
    if (referrer) {
      pipeline.zincrby(REDIS_KEYS.analyticsReferrers, 1, referrer)
    }
    await pipeline.exec()
  } catch {
    // Analytics failure is silent
  }
}

export async function trackLinkClick(linkId: string): Promise<void> {
  try {
    const r = getRedis()
    await r.zincrby(REDIS_KEYS.analyticsLinkClicks, 1, linkId)
  } catch {
    // Silent
  }
}

export interface AnalyticsData {
  dailyViews: { date: string; views: number }[]
  totalViews: number
  topCountries: { country: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
  topLinks: { linkId: string; count: number }[]
}

export async function getAnalytics(): Promise<AnalyticsData> {
  try {
    const r = getRedis()

    // Get daily views for last 30 days
    const viewsHash = await r.hgetall(REDIS_KEYS.analyticsViews) as Record<string, number> | null
    const dailyViews: { date: string; views: number }[] = []
    let totalViews = 0
    if (viewsHash) {
      const sorted = Object.entries(viewsHash)
        .map(([date, views]) => ({ date, views: Number(views) }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30)
      dailyViews.push(...sorted)
      totalViews = sorted.reduce((sum, d) => sum + d.views, 0)
    }

    // Pad last 30 days so chart always shows full range
    const fullRange: { date: string; views: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const existing = dailyViews.find(v => v.date === dateStr)
      fullRange.push({ date: dateStr, views: existing?.views ?? 0 })
    }

    // Top countries
    const countriesRaw = await r.zrange(REDIS_KEYS.analyticsCountries, 0, -1, { withScores: true, rev: true })
    const topCountries: { country: string; count: number }[] = []
    for (let i = 0; i < countriesRaw.length; i += 2) {
      topCountries.push({ country: String(countriesRaw[i]), count: Number(countriesRaw[i + 1]) })
    }

    // Top referrers
    const referrersRaw = await r.zrange(REDIS_KEYS.analyticsReferrers, 0, -1, { withScores: true, rev: true })
    const topReferrers: { referrer: string; count: number }[] = []
    for (let i = 0; i < referrersRaw.length; i += 2) {
      topReferrers.push({ referrer: String(referrersRaw[i]), count: Number(referrersRaw[i + 1]) })
    }

    // Top link clicks
    const linksRaw = await r.zrange(REDIS_KEYS.analyticsLinkClicks, 0, -1, { withScores: true, rev: true })
    const topLinks: { linkId: string; count: number }[] = []
    for (let i = 0; i < linksRaw.length; i += 2) {
      topLinks.push({ linkId: String(linksRaw[i]), count: Number(linksRaw[i + 1]) })
    }

    return {
      dailyViews: fullRange,
      totalViews,
      topCountries: topCountries.slice(0, 10),
      topReferrers: topReferrers.slice(0, 10),
      topLinks: topLinks.slice(0, 10),
    }
  } catch {
    return {
      dailyViews: [],
      totalViews: 0,
      topCountries: [],
      topReferrers: [],
      topLinks: [],
    }
  }
}
