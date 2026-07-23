import type { Metadata } from 'next'
import { getConfig } from '@/lib/redis'
import { getThemeClass } from '@/lib/themes'
import { BioPage } from '@/components/public/BioPage'
import { TrackingScripts } from '@/components/public/TrackingScripts'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig()

  const title = config.seoTitle || config.name
  const description = config.seoDescription
  const ogImage = config.ogImageUrl
    || `/api/og?name=${encodeURIComponent(config.name)}&tagline=${encodeURIComponent(config.tagline)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function HomePage() {
  const config = await getConfig()
  const themeClass = getThemeClass(config.theme)
  return (
    <>
      <TrackingScripts
        ga={config.gaMeasurementId}
        meta={config.metaPixelId}
        tiktok={config.tiktokPixelId}
      />
      <BioPage config={config} themeClass={themeClass} />
    </>
  )
}
