import { Link } from '@tanstack/react-router'
import { useId } from 'react'

// MK monogram for Makwad: outlined bands with a navy-to-teal gradient.
const M_OUT = 'M10 56 V20 Q10 11 18 11 Q22.5 11 24.5 15.5 L32 31 L40 11 V56'
const M_IN = 'M10 53.3 V20 Q10 11 18 11 Q22.5 11 24.5 15.5 L32 31 L40 11 V53.3'
const A_OUT = 'M57 11 L44.5 31.5'
const A_IN = 'M55.5 13.4 L45.6 29.6'
const L_OUT = 'M44.5 37 L57 56'
const L_IN = 'M46.1 39.5 L55.5 53.6'

export function LogoMark({ size = 40, solid = false }: { size?: number; solid?: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="8" y1="58" x2="58" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--grad-a)" />
          <stop offset="1" stopColor="var(--grad-b)" />
        </linearGradient>
        {!solid && (
          <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
            <g fill="none" strokeLinejoin="round">
              <g stroke="#fff" strokeWidth="8">
                <path d={M_OUT} /><path d={A_OUT} /><path d={L_OUT} />
              </g>
              <g stroke="#000" strokeWidth="2.6">
                <path d={M_IN} /><path d={A_IN} /><path d={L_IN} />
              </g>
            </g>
          </mask>
        )}
      </defs>
      {solid ? (
        <g fill="none" stroke={`url(#g${id})`} strokeWidth="8" strokeLinejoin="round">
          <path d={M_OUT} /><path d="M57 11 L40 39" /><path d="M41 32.5 L57 56" />
        </g>
      ) : (
        <rect width="64" height="64" fill={`url(#g${id})`} mask={`url(#m${id})`} />
      )}
    </svg>
  )
}

export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="استوديو مكود">
      <LogoMark />
      <span className="logo-text">
        <b>مكود</b>
        <small>MAKWAD STUDIO</small>
      </span>
    </Link>
  )
}
