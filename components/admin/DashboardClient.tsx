'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import type { AnalyticsData } from '@/lib/redis'
import type { SiteConfig } from '@/lib/config'
import { Eye, Globe, ExternalLink, Link2 } from 'lucide-react'

interface DashboardClientProps {
  analytics: AnalyticsData
  config: SiteConfig
}

const countryToFlag = (cc: string) =>
  cc.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function StatCard({ title, value, icon, sub }: { title: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight truncate">{value || '—'}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export function DashboardClient({ analytics, config }: DashboardClientProps) {
  const { dailyViews, totalViews, topCountries, topReferrers, topLinks } = analytics

  // Resolve link titles from config
  const linkTitleMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const l of config.links) map[l.id] = l.title || l.id
    return map
  }, [config.links])

  const topCountry = topCountries[0]
    ? `${countryToFlag(topCountries[0].country)} ${topCountries[0].country}`
    : '—'

  const chartData = useMemo(
    () => dailyViews.map(d => ({ date: formatDate(d.date), views: d.views })),
    [dailyViews]
  )

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={<Eye className="h-4 w-4" />}
          sub="Last 30 days"
        />
        <StatCard
          title="Top Country"
          value={topCountry}
          icon={<Globe className="h-4 w-4" />}
          sub={topCountries[0] ? `${topCountries[0].count} views` : undefined}
        />
        <StatCard
          title="Top Referrer"
          value={topReferrers[0]?.referrer ?? '—'}
          icon={<ExternalLink className="h-4 w-4" />}
          sub={topReferrers[0] ? `${topReferrers[0].count} visits` : undefined}
        />
        <StatCard
          title="Top Link"
          value={topLinks[0] ? (linkTitleMap[topLinks[0].linkId] || topLinks[0].linkId) : '—'}
          icon={<Link2 className="h-4 w-4" />}
          sub={topLinks[0] ? `${topLinks[0].count} clicks` : undefined}
        />
      </div>

      {/* Area chart */}
      <Card>
        <CardHeader>
          <CardTitle>Page Views — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 || chartData.every(d => d.views === 0) ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No view data yet. Views will appear here once visitors land on your page.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#6366f1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom lists */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Top Links</CardTitle></CardHeader>
          <CardContent>
            {topLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clicks recorded yet.</p>
            ) : (
              <ol className="space-y-2">
                {topLinks.map((item, idx) => (
                  <li key={item.linkId} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{idx + 1}</span>
                      <span className="text-sm truncate">{linkTitleMap[item.linkId] || item.linkId}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground shrink-0">{item.count.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Countries</CardTitle></CardHeader>
          <CardContent>
            {topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ol className="space-y-2">
                {topCountries.map((item, idx) => (
                  <li key={item.country} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{idx + 1}</span>
                      <span>{countryToFlag(item.country)}</span>
                      <span className="text-sm">{item.country}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground shrink-0">{item.count.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Referrers</CardTitle></CardHeader>
          <CardContent>
            {topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrer data yet.</p>
            ) : (
              <ol className="space-y-2">
                {topReferrers.map((item, idx) => (
                  <li key={item.referrer} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{idx + 1}</span>
                      <span className="text-sm truncate">{item.referrer}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground shrink-0">{item.count.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
