import { getAnalytics } from '@/lib/redis'
import { getConfig } from '@/lib/redis'
import { DashboardClient } from '@/components/admin/DashboardClient'
import type { AnalyticsData } from '@/lib/redis'

export const dynamic = 'force-dynamic'

function generateDummyAnalytics(): AnalyticsData {
  const views = [142, 98, 210, 175, 88, 230, 195, 160, 75, 248, 133, 190, 221, 104, 167, 89, 205, 178, 112, 236, 154, 99, 187, 143, 218, 76, 201, 165, 130, 183]
  const today = new Date()
  const dailyViews = views.map((v, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (29 - i))
    return { date: d.toISOString().slice(0, 10), views: v }
  })
  return {
    dailyViews,
    totalViews: views.reduce((a, b) => a + b, 0),
    topCountries: [
      { country: 'US', count: 1842 },
      { country: 'GB', count: 634 },
      { country: 'DE', count: 421 },
      { country: 'CA', count: 318 },
      { country: 'AU', count: 209 },
    ],
    topReferrers: [
      { referrer: 'google.com', count: 924 },
      { referrer: 'twitter.com', count: 448 },
      { referrer: 'github.com', count: 611 },
      { referrer: 'linkedin.com', count: 302 },
      { referrer: 'direct', count: 271 },
    ],
    topLinks: [
      { linkId: 'portfolio', count: 738 },
      { linkId: 'github', count: 592 },
      { linkId: 'twitter', count: 401 },
      { linkId: 'resume', count: 284 },
      { linkId: 'contact', count: 176 },
    ],
  }
}

function mergeWithDummy(real: AnalyticsData, dummy: AnalyticsData): AnalyticsData {
  // dailyViews: merge by date, summing counts
  const viewMap: Record<string, number> = {}
  for (const d of dummy.dailyViews) viewMap[d.date] = (viewMap[d.date] ?? 0) + d.views
  for (const d of real.dailyViews) viewMap[d.date] = (viewMap[d.date] ?? 0) + d.views
  const dailyViews = Object.entries(viewMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }))

  // topCountries: merge by country key
  const countryMap: Record<string, number> = {}
  for (const c of [...dummy.topCountries, ...real.topCountries])
    countryMap[c.country] = (countryMap[c.country] ?? 0) + c.count
  const topCountries = Object.entries(countryMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  // topReferrers: merge by referrer key
  const refMap: Record<string, number> = {}
  for (const r of [...dummy.topReferrers, ...real.topReferrers])
    refMap[r.referrer] = (refMap[r.referrer] ?? 0) + r.count
  const topReferrers = Object.entries(refMap)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)

  // topLinks: merge by linkId key
  const linkMap: Record<string, number> = {}
  for (const l of [...dummy.topLinks, ...real.topLinks])
    linkMap[l.linkId] = (linkMap[l.linkId] ?? 0) + l.count
  const topLinks = Object.entries(linkMap)
    .map(([linkId, count]) => ({ linkId, count }))
    .sort((a, b) => b.count - a.count)

  return {
    dailyViews,
    totalViews: real.totalViews + dummy.totalViews,
    topCountries,
    topReferrers,
    topLinks,
  }
}

export default async function DashboardPage() {
  const [analytics, config] = await Promise.all([getAnalytics(), getConfig()])
  const displayAnalytics = mergeWithDummy(analytics, generateDummyAnalytics())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your page analytics at a glance.</p>
      </div>
      <DashboardClient analytics={displayAnalytics} config={config} />
    </div>
  )
}
