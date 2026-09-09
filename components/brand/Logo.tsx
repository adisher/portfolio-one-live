// The LinkPlate mark: an avatar over a stack of link bars — the silhouette of
// the page the product builds. The lower bar is held at 42% so the plate reads
// as continuing past its frame rather than as a two-line list icon.

interface LogoMarkProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 28, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="LinkPlate"
    >
      <rect width="32" height="32" rx="8.5" fill="#f5a524" />
      <circle cx="16" cy="9.5" r="4.1" fill="#16121e" />
      <rect x="6.6" y="17.2" width="18.8" height="4.2" rx="2.1" fill="#16121e" />
      <rect x="6.6" y="23.4" width="18.8" height="4.2" rx="2.1" fill="#16121e" opacity="0.42" />
    </svg>
  )
}

interface WordmarkProps {
  size?: 'sm' | 'md'
  className?: string
}

export function Wordmark({ size = 'md', className }: WordmarkProps) {
  return (
    <span
      className={`font-bold tracking-tight ${size === 'sm' ? 'text-lg' : 'text-xl'} ${className ?? ''}`}
    >
      Link<span className="text-primary">Plate</span>
    </span>
  )
}
