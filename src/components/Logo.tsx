import { Link } from '@tanstack/react-router'
import { useId } from 'react'

// MK monogram for Makwad Studio: outlined bands, navy-to-cyan gradient.
const M = 'M7.5 72 V17 Q7.5 7.5 17 7.5 H20 L35 41 L64 -4'
const KS = 'M69 -4 L58.5 30 Q56.8 36 56.8 42 V72'
const KA = 'M99 -6 L66 33 L99 72'
const W = 15
const HOLE = 3.6
const WALL = (W - HOLE) / 2

export function LogoMark({ height = 34, solid = false }: { height?: number; solid?: boolean }) {
  const id = useId().replace(/:/g, '')
  const width = (height * 102) / 64.6
  const paths = (
    <>
      <path d={M} strokeLinejoin="round" />
      <path d={KS} strokeLinejoin="round" />
      <path d={KA} strokeLinejoin="miter" strokeMiterlimit={6} />
    </>
  )
  return (
    <svg className="logo-mark" width={width} height={height} viewBox="-1 -1 102 64.6" aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="62" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--grad-a)" />
          <stop offset=".55" stopColor="var(--grad-m)" />
          <stop offset="1" stopColor="var(--grad-b)" />
        </linearGradient>
        <clipPath id={`co${id}`}><rect x="-5" y="0" width="110" height="62.6" /></clipPath>
        <clipPath id={`ci${id}`}><rect x="-5" y={WALL} width="110" height={62.6 - 2 * WALL} /></clipPath>
        {!solid && (
          <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="-5" y="-5" width="110" height="75">
            <g clipPath={`url(#co${id})`} fill="none" stroke="#fff" strokeWidth={W}>{paths}</g>
            <g clipPath={`url(#ci${id})`} fill="none" stroke="#000" strokeWidth={HOLE}>{paths}</g>
          </mask>
        )}
      </defs>
      {solid ? (
        <g clipPath={`url(#co${id})`} fill="none" stroke={`url(#g${id})`} strokeWidth={W}>{paths}</g>
      ) : (
        <rect x="-5" y="-5" width="110" height="75" fill={`url(#g${id})`} mask={`url(#m${id})`} />
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
