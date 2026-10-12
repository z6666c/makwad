import { Link } from '@tanstack/react-router'

export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" style={{ fill: 'var(--ink)' }} />
      <path d="M13 33 L32 16 L51 33" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--bg)' }} />
      <line x1="17" y1="48" x2="47" y2="48" strokeWidth="2.5" strokeLinecap="round" style={{ stroke: 'var(--bg)', opacity: 0.35 }} />
      <rect className="cur" x="29.5" y="28" width="5" height="20" rx="2.5" style={{ fill: 'var(--accent)' }} />
    </svg>
  )
}

export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="استوديو مكود">
      <LogoMark />
      <span className="logo-text">
        <small>استوديو</small>
        <b>مَكْوَد</b>
      </span>
    </Link>
  )
}
