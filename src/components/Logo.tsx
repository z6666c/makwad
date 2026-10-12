import { Link } from '@tanstack/react-router'

export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" style={{ fill: 'var(--ink)' }} />
      <path d="M14 46 V28 L32 14 L50 28 V46" fill="none" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--bg)' }} />
      <path d="M26 31 L21 36 L26 41 M38 31 L43 36 L38 41" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--bg)', opacity: 0.6 }} />
      <rect className="cur" x="29.5" y="29" width="5" height="17" rx="2.5" style={{ fill: 'var(--accent)' }} />
    </svg>
  )
}

export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="استوديو مكود">
      <LogoMark />
      <span className="logo-text">
        <small>استوديو</small>
        <b>مكود</b>
      </span>
    </Link>
  )
}
