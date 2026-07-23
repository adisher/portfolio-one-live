// Central font registry — used by the appearance picker, the public page's
// font-family resolution, and the Google Fonts <link> in the root layout.

export interface FontDef {
  name: string
  stack: string
  category: 'Sans' | 'Serif' | 'Display'
  weights: string // Google `wght@` value, or '' for single-weight families
}

export const FONTS: FontDef[] = [
  { name: 'Inter', stack: "'Inter', sans-serif", category: 'Sans', weights: '400;500;600;700' },
  { name: 'Poppins', stack: "'Poppins', sans-serif", category: 'Sans', weights: '400;500;600;700' },
  { name: 'Roboto', stack: "'Roboto', sans-serif", category: 'Sans', weights: '400;500;700' },
  { name: 'Montserrat', stack: "'Montserrat', sans-serif", category: 'Sans', weights: '400;500;600;700' },
  { name: 'Lato', stack: "'Lato', sans-serif", category: 'Sans', weights: '400;700' },
  { name: 'Open Sans', stack: "'Open Sans', sans-serif", category: 'Sans', weights: '400;600;700' },
  { name: 'Nunito', stack: "'Nunito', sans-serif", category: 'Sans', weights: '400;600;700' },
  { name: 'Raleway', stack: "'Raleway', sans-serif", category: 'Sans', weights: '400;500;600;700' },
  { name: 'Work Sans', stack: "'Work Sans', sans-serif", category: 'Sans', weights: '400;500;600;700' },
  { name: 'DM Sans', stack: "'DM Sans', sans-serif", category: 'Sans', weights: '400;500;700' },
  { name: 'Space Grotesk', stack: "'Space Grotesk', sans-serif", category: 'Sans', weights: '400;500;700' },
  { name: 'Manrope', stack: "'Manrope', sans-serif", category: 'Sans', weights: '400;500;600;700' },
  { name: 'Quicksand', stack: "'Quicksand', sans-serif", category: 'Sans', weights: '400;500;600;700' },
  { name: 'Playfair Display', stack: "'Playfair Display', serif", category: 'Serif', weights: '400;500;600;700' },
  { name: 'Merriweather', stack: "'Merriweather', serif", category: 'Serif', weights: '400;700' },
  { name: 'Lora', stack: "'Lora', serif", category: 'Serif', weights: '400;500;600;700' },
  { name: 'PT Serif', stack: "'PT Serif', serif", category: 'Serif', weights: '400;700' },
  { name: 'Oswald', stack: "'Oswald', sans-serif", category: 'Display', weights: '400;500;600;700' },
  { name: 'Bebas Neue', stack: "'Bebas Neue', sans-serif", category: 'Display', weights: '' },
]

export const FONT_STACK: Record<string, string> = Object.fromEntries(
  FONTS.map(f => [f.name, f.stack]),
)

export function fontStack(name: string): string {
  return FONT_STACK[name] || "'Inter', sans-serif"
}

// Single Google Fonts stylesheet URL covering every offered family. The
// browser only downloads the font files actually applied to the page.
export function googleFontsHref(): string {
  const families = FONTS.map(f => {
    const fam = f.name.replace(/ /g, '+')
    return f.weights ? `family=${fam}:wght@${f.weights}` : `family=${fam}`
  }).join('&')
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}
