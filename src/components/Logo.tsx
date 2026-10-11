import { Link } from '@tanstack/react-router'

export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" style={{ fill: 'var(--ink)' }} />
      <line x1="12" y1="46" x2="52" y2="46" strokeWidth="2.5" strokeLinecap="round" style={{ stroke: 'var(--bg)', opacity: 0.35 }} />
      <path
        d="M12 22v9a5 5 0 0 0 10 0v-5v5a5 5 0 0 0 10 0v-5v5a5 5 0 0 0 10 0v-9"
        fill="none"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: 'var(--bg)' }}
      />
      <rect className="cur" x="46" y="14" width="5" height="30" rx="2.5" style={{ fill: 'var(--accent)' }} />
    </svg>
  )
}

export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="سطر لتطوير التطبيقات">
      <LogoMark />
      <span className="logo-text">
        <b>سطر</b>
        <small>لتطوير التطبيقات</small>
      </span>
    </Link>
  )
}
