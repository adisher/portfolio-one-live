import type { Metadata } from 'next'
import '../styles/globals.css'
import { googleFontsHref } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'Bio Link',
  description: 'Bio link page',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={googleFontsHref()} />
      </head>
      <body>{children}</body>
    </html>
  )
}
