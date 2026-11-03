// Two languages: Arabic at the root (/...), English under /en (/en, /en/services/...).
// The language comes from the URL, so every page has a stable, indexable address in each language.
import { useLocation, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export type Lang = 'ar' | 'en'

export const langOfPath = (p: string): Lang => (p === '/en' || p.startsWith('/en/') ? 'en' : 'ar')

/** Path without the /en prefix. */
export const basePath = (p: string) => (langOfPath(p) === 'en' ? p.slice(3) || '/' : p)

/** The same page in the given language. */
export const pathIn = (p: string, lang: Lang) => {
  const b = basePath(p)
  return lang === 'en' ? (b === '/' ? '/en' : `/en${b}`) : b
}

export function useLang() {
  const { pathname } = useLocation()
  const lang = langOfPath(pathname)
  const en = lang === 'en'
  /** Pick the text for the current language. */
  const t = (ar: string, english: string) => (en ? english : ar)
  /** A site path in the current language (`/services` -> `/en/services`). */
  const L = (p: string) => pathIn(p, lang)
  return { lang, en, t, L, pathname }
}

/** Keeps <html lang/dir> in step with the URL. */
export function useHtmlLang() {
  const { lang } = useLang()
  useEffect(() => {
    const h = document.documentElement
    h.lang = lang
    h.dir = lang === 'en' ? 'ltr' : 'rtl'
  }, [lang])
}

/** "English" / "العربية" switch that keeps the visitor on the same page and section. */
export function LangSwitch({ className = 'btn ghost small lang-sw' }: { className?: string }) {
  const { en, pathname } = useLang()
  const router = useRouter()
  const to = pathIn(pathname, en ? 'ar' : 'en')
  return (
    <a
      className={className}
      href={to + window.location.search + window.location.hash}
      hrefLang={en ? 'ar' : 'en'}
      lang={en ? 'ar' : 'en'}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        void router.navigate({ to, hash: window.location.hash.slice(1) || undefined, search: Object.fromEntries(new URLSearchParams(window.location.search)) as never })
      }}
    >
      {en ? 'العربية' : 'English'}
    </a>
  )
}
