import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getConfig } from '@/lib/redis'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const config = await getConfig()
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') || config.name
    const tagline = searchParams.get('tagline') || config.tagline

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            color: '#ffffff',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              marginBottom: 16,
              textAlign: 'center',
              padding: '0 40px',
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 32,
              opacity: 0.8,
              textAlign: 'center',
              padding: '0 60px',
            }}
          >
            {tagline}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch {
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
