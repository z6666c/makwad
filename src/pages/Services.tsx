// SEO landing page per service: /services/<slug> (Arabic) and /en/services/<slug> (English). Prices come live from the pricing catalog.
import { useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Logo } from '@/components/Logo'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { usePricing, useSettings } from '@/site-config'
import { TRACKS } from '@/site-content'
import { TRACKS_EN, localizeCatalog } from '@/content-en'
import { fmtSAR } from '@/estimate'
import type { Catalog, Service } from '@/estimate'
import { LangSwitch, pathIn, useHtmlLang, useLang } from '@/i18n'
import PAGES from '@/service-pages.json'
import PAGES_EN from '@/service-pages-en.json'
import { TRACKS4, trackOfPage, tx as tt } from '@/tracks'

export type ServicePageData = (typeof PAGES)[number] & { tiers?: Array<string>; addons?: Array<string>; group?: string }
export const SERVICE_PAGES = PAGES as Array<ServicePageData>
type PageText = { title: string; description: string; kicker: string; h1: string; lead: string; includes: Array<string>; faq: Array<{ q: string; a: string }> }
export const SERVICE_PAGES_EN = PAGES_EN as Record<string, PageText>

/** The page's texts in the given language (English falls back to Arabic for a page not translated yet). */
const textOf = (p: ServicePageData, en: boolean): PageText => (en && SERVICE_PAGES_EN[p.slug]) || p

/** Finds the catalog service a page describes: an exact key, or `re:<pattern>` matched against the (Arabic) label. */
export function serviceFor(page: ServicePageData, catalog: Catalog): Service | undefined {
  if (page.service.startsWith('re:')) {
    const re = new RegExp(page.service.slice(3))
    return catalog.find((c) => re.test(c.label) || re.test(c.type ?? ''))
  }
  return catalog.find((c) => c.key === page.service)
}

/** Title, description, canonical and hreflang links for a page shown in two languages. */
export function useMeta(title: string, description: string, path: string) {
  const { lang } = useLang()
  useEffect(() => {
    const prev = document.title
    document.title = title
    const url = `https://makwad.com${pathIn(path, lang)}`
    const set = (sel: string, attr: string, val: string) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val) }
    set('meta[name="description"]', 'content', description)
    set('link[rel="canonical"]', 'href', url)
    set('meta[property="og:title"]', 'content', title)
    set('meta[property="og:description"]', 'content', description)
    set('meta[property="og:url"]', 'content', url)
    set('meta[property="og:locale"]', 'content', lang === 'en' ? 'en_US' : 'ar_SA')
    set('link[rel="alternate"][hreflang="ar"]', 'href', `https://makwad.com${pathIn(path, 'ar')}`)
    set('link[rel="alternate"][hreflang="en"]', 'href', `https://makwad.com${pathIn(path, 'en')}`)
    set('link[rel="alternate"][hreflang="x-default"]', 'href', `https://makwad.com${pathIn(path, 'ar')}`)
    return () => { document.title = prev }
  }, [title, description, path, lang])
}

export function Shell({ children, cta }: { children: ReactNode; cta?: string }) {
  useHtmlLang()
  const s = useSettings()
  const { lang, t, L } = useLang()
  return (
    <>
      <header className="site-header">
        <nav className="nav wrap" aria-label={t('القائمة الرئيسية', 'Main menu')}>
          <Logo />
          <div className="links">
            {TRACKS4.map((x) => <a key={x.key} href={L(`/${x.key}`)}>{tt(x.name, lang)}</a>)}
            <a href={L('/work')}>{t('أعمالنا', 'Our work')}</a>
          </div>
          <div className="nav-end">
            <LangSwitch />
            <a className="btn small" href={cta ?? `${L('/')}#contact`}>{t('أرسل طلبك', 'Send a request')}</a>
          </div>
        </nav>
      </header>
      <main className="wrap svc-page">{children}</main>
      <footer className="site-footer">
        <div className="wrap legal">
          <span>{t('© 2026 استوديو مكود. جميع الحقوق محفوظة.', '© 2026 Makwad Studio. All rights reserved.')}{s.crNumber && <> · {t('وثيقة العمل الحر رقم', 'Freelance document no.')} <span className="mono" dir="ltr">{s.crNumber}</span></>}</span>
          <span><a href={L('/')}>{t('الرئيسية', 'Home')}</a> · {TRACKS4.map((x) => <span key={x.key}><a href={L(`/${x.key}`)}>{tt(x.name, lang)}</a> · </span>)}<a href={L('/services')}>{t('الخدمات', 'Services')}</a> · <a href={L('/privacy')}>{t('سياسة الخصوصية', 'Privacy policy')}</a> · <a href={L('/terms')}>{t('الشروط والأحكام', 'Terms')}</a></span>
        </div>
      </footer>
      <WhatsAppButton />
    </>
  )
}

export function ServicesIndex() {
  const raw = usePricing()
  const { lang, en, t, L } = useLang()
  useMeta(
    t('خدماتنا: تصميم وبرمجة التطبيقات والمواقع والأنظمة | استوديو مكود', 'Our services: apps, websites and systems design & development | Makwad Studio'),
    t('خدمات استوديو مكود في الرياض: تطبيقات الجوال، المواقع والمتاجر، أنظمة الإدارة، الهويات البصرية، المواد الدعائية، وحلول الذكاء الاصطناعي، بأسعار واضحة.', 'Makwad Studio services in Riyadh: mobile apps, websites and online stores, management systems, brand identities, promotional material and AI solutions, with clear prices.'),
    '/services',
  )
  return (
    <Shell>
      <div className="svc-hero">
        <nav className="crumbs" aria-label={t('مسار الصفحة', 'Breadcrumb')}><a href={L('/')}>{t('الرئيسية', 'Home')}</a> / <span>{t('الخدمات', 'Services')}</span></nav>
        <span className="kicker">{t('خدماتنا', 'Our services')}</span>
        <h1>{t('تصميم وبرمجة التطبيقات والمواقع والأنظمة', 'Design and development of apps, websites and systems')}</h1>
        <p className="lead">{t('أربعة تخصصات: مكود ويب، مكود تطبيقات، مكود هوية، ومكود بزنس. اختر الخدمة لتشوف تفاصيلها، وأرسل طلبك من صفحة التخصص.', 'Four specialities: Makwad Web, Apps, Brand and Business. Pick a service to see its details, and send your request from the speciality page.')}</p>
      </div>
      {TRACKS4.map((tr) => (
      <section className="svc-sec" key={tr.key}>
      <h2><a href={L(`/${tr.key}`)}>{tt(tr.name, lang)}</a></h2>
      <p className="muted">{tt(tr.line, lang)} {en ? <b>From SAR {fmtSAR(tr.from)}.</b> : <b>يبدأ من {fmtSAR(tr.from)} ريال.</b>}</p>
      <div className="svc-grid">
        {SERVICE_PAGES.filter((p) => tr.pages.includes(p.slug)).map((p) => {
          const tx = textOf(p, en)
          return (
            <a key={p.slug} className="svc-card" href={L(`/services/${p.slug}`)}>
              <span className="kicker">{tx.kicker}</span>
              <h2>{tx.h1}</h2>
              <p>{tx.lead}</p>
              <span className="svc-from">{t('التفاصيل ←', 'Details →')}</span>
            </a>
          )
        })}
        <a className="svc-card" href={L(`/${tr.key}`)}>
          <span className="kicker">{tr.num}</span>
          <h2>{en ? `All ${tt(tr.name, lang)} services` : `كل خدمات ${tt(tr.name, lang)}`}</h2>
          <p>{tr.services.map((s) => tt(s.name, lang)).join(t('، ', ', '))}</p>
          <span className="svc-from">{t('أرسل طلبك ←', 'Send your request →')}</span>
        </a>
      </div>
      </section>
      ))}
    </Shell>
  )
}

export function ServiceDetail() {
  const { slug } = useParams({ strict: false }) as { slug?: string }
  const page = SERVICE_PAGES.find((p) => p.slug === slug)
  const raw = usePricing()
  const { lang, en, t, L } = useLang()
  const tx = page ? textOf(page, en) : undefined
  useMeta(tx?.title ?? t('الخدمة غير موجودة | استوديو مكود', 'Service not found | Makwad Studio'), tx?.description ?? '', `/services/${slug ?? ''}`)
  if (!page || !tx) {
    return <Shell><div className="empty" style={{ margin: '80px auto' }}><h3>{t('الخدمة غير موجودة', 'Service not found')}</h3><a className="btn" href={L('/services')}>{t('كل الخدمات', 'All services')}</a></div></Shell>
  }
  const found = serviceFor(page, raw)
  const full = found ? localizeCatalog([found], lang)[0] : undefined
  // a focused page shows only its own tiers and add-ons; fall back to everything if the catalog changed
  const pick = <T extends { key: string }>(all: Array<T>, keys?: Array<string>) => { const f = keys ? all.filter((x) => keys.includes(x.key)) : all; return f.length ? f : all }
  const svc = full ? { ...full, tiers: pick(full.tiers, page.tiers), addons: pick(full.addons, page.addons) } : undefined
  const tracks = en ? TRACKS_EN : TRACKS
  const track = tracks.find((x) => x.key === page.track) ?? tracks[1]
  const home = L('/')
  const owner = trackOfPage(page.slug)
  // requests go to the speciality page's form, or the home form for a page outside the four specialities
  const request = owner ? `${L(`/${owner.key}`)}#request` : `${home}#contact`
  const pageUrl = `https://makwad.com${L(`/services/${page.slug}`)}`
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name: tx.h1, description: tx.description, serviceType: tx.kicker, inLanguage: lang,
      provider: { '@id': 'https://makwad.com/#studio' }, areaServed: { '@type': 'Country', name: t('المملكة العربية السعودية', 'Saudi Arabia') },
      url: pageUrl,
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: tx.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('الرئيسية', 'Home'), item: `https://makwad.com${home}` },
      { '@type': 'ListItem', position: 2, name: t('الخدمات', 'Services'), item: `https://makwad.com${L('/services')}` },
      { '@type': 'ListItem', position: 3, name: tx.h1, item: pageUrl },
    ] },
  ]
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="svc-hero">
        <nav className="crumbs" aria-label={t('مسار الصفحة', 'Breadcrumb')}><a href={home}>{t('الرئيسية', 'Home')}</a> / <a href={L('/services')}>{t('الخدمات', 'Services')}</a> / <span>{tx.kicker}</span></nav>
        <span className="kicker">{tx.kicker} · {t('الرياض والمملكة', 'Riyadh & Saudi Arabia')}</span>
        <h1>{tx.h1}</h1>
        <p className="lead">{tx.lead}</p>
        <div className="cta-row">
          <a className="btn" href={request}>{t('أرسل طلبك', 'Send your request')}</a>
          {owner && <a className="btn ghost" href={L(`/${owner.key}`)}>{en ? `About ${tt(owner.name, lang)}` : `عن ${tt(owner.name, lang)}`}</a>}
        </div>
      </div>

      <section className="svc-sec">
        <h2>{t('وش تحصل معنا', 'What you get')}</h2>
        <ul className="svc-includes">{tx.includes.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      <section className="svc-sec">
        <h2>{t('السعر', 'Price')}</h2>
        {owner && <p className="svc-start">{en ? <>{tt(owner.name, lang)} services start from <b className="mono">{fmtSAR(owner.from)}</b> SAR</> : <>تبدأ خدمات {tt(owner.name, lang)} من <b className="mono">{fmtSAR(owner.from)}</b> ريال</>}</p>}
        <p className="muted">{t('السعر النهائي يعتمد على حجم مشروعك والمزايا اللي تحتاجها. أرسل طلبك، وبعد جلسة الاكتشاف المجانية يوصلك عرض سعر مفصل بالبنود والمدة قبل أي التزام.', 'The final price depends on the size of your project and the features you need. Send your request, and after the free discovery session you receive an itemised quote with the timeline before any commitment.')}</p>
        <a className="btn small" href={request}>{t('أرسل طلبك ←', 'Send your request →')}</a>
      </section>

      <section className="svc-sec">
        <h2>{t('مراحل التنفيذ', 'Delivery stages')} · {track.range}</h2>
        <ol className="svc-steps">{track.steps.map((st) => <li key={st.t}><b>{st.t}</b><span className="muted">{st.w}</span><p>{st.p}</p></li>)}</ol>
      </section>

      <section className="svc-sec">
        <h2>{t('أسئلة شائعة', 'FAQ')}</h2>
        <div className="svc-faq">{tx.faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      </section>

      <section className="svc-sec">
        <h2>{t('خدمات أخرى', 'Other services')}</h2>
        <div className="svc-related">
          {page.related.map((r) => { const p = SERVICE_PAGES.find((x) => x.slug === r); return p ? <a key={r} href={L(`/services/${r}`)}>{textOf(p, en).h1} {t('←', '→')}</a> : null })}
        </div>
      </section>
    </Shell>
  )
}
