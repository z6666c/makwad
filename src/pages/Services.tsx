// SEO landing page per service: /services/<slug>. Prices come live from the pricing catalog.
import { Link, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Logo } from '@/components/Logo'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { COMPANY, usePricing, useSettings } from '@/site-config'
import { TRACKS } from '@/site-content'
import { fmtSAR } from '@/estimate'
import type { Catalog, Service } from '@/estimate'
import PAGES from '@/service-pages.json'

export type ServicePageData = (typeof PAGES)[number]
export const SERVICE_PAGES = PAGES as Array<ServicePageData>

/** Finds the catalog service a page describes: an exact key, or `re:<pattern>` matched against the label. */
export function serviceFor(page: ServicePageData, catalog: Catalog): Service | undefined {
  if (page.service.startsWith('re:')) {
    const re = new RegExp(page.service.slice(3))
    return catalog.find((c) => re.test(c.label) || re.test(c.type ?? ''))
  }
  return catalog.find((c) => c.key === page.service)
}

function useMeta(title: string, description: string, path: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title
    const set = (sel: string, attr: string, val: string) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val) }
    set('meta[name="description"]', 'content', description)
    set('link[rel="canonical"]', 'href', `https://makwad.com${path}`)
    set('meta[property="og:title"]', 'content', title)
    set('meta[property="og:description"]', 'content', description)
    set('meta[property="og:url"]', 'content', `https://makwad.com${path}`)
    return () => { document.title = prev }
  }, [title, description, path])
}

function Shell({ children }: { children: ReactNode }) {
  const s = useSettings()
  return (
    <>
      <header className="site-header">
        <nav className="nav wrap" aria-label="القائمة الرئيسية">
          <Logo />
          <div className="nav-end">
            <Link className="btn ghost small" to="/services">الخدمات</Link>
            <a className="btn small" href="/#estimate">احسب السعر</a>
          </div>
        </nav>
      </header>
      <main className="wrap svc-page">{children}</main>
      <footer className="site-footer">
        <div className="wrap legal">
          <span>© 2026 {COMPANY.name}. جميع الحقوق محفوظة.{s.crNumber && <> · وثيقة العمل الحر رقم <span className="mono" dir="ltr">{s.crNumber}</span></>}</span>
          <span><Link to="/">الرئيسية</Link> · <Link to="/services">الخدمات</Link> · <Link to="/privacy">سياسة الخصوصية</Link> · <Link to="/terms">الشروط والأحكام</Link></span>
        </div>
      </footer>
      <WhatsAppButton />
    </>
  )
}

export function ServicesIndex() {
  const catalog = usePricing()
  useMeta('خدماتنا: تصميم وبرمجة التطبيقات والمواقع والأنظمة | استوديو مكود', 'خدمات استوديو مكود في الرياض: تطبيقات الجوال، المواقع والمتاجر، أنظمة الإدارة، الهويات البصرية، المواد الدعائية، وحلول الذكاء الاصطناعي، بأسعار واضحة.', '/services')
  return (
    <Shell>
      <div className="svc-hero">
        <nav className="crumbs" aria-label="مسار الصفحة"><Link to="/">الرئيسية</Link> / <span>الخدمات</span></nav>
        <span className="kicker">خدماتنا</span>
        <h1>تصميم وبرمجة التطبيقات والمواقع والأنظمة</h1>
        <p className="lead">اختر الخدمة لتشوف تفاصيلها وأسعارها ومدة تنفيذها.</p>
      </div>
      <div className="svc-grid">
        {SERVICE_PAGES.map((p) => {
          const svc = serviceFor(p, catalog)
          const from = svc ? Math.min(...svc.tiers.map((t) => t.price)) : null
          return (
            <Link key={p.slug} className="svc-card" to="/services/$slug" params={{ slug: p.slug }}>
              <span className="kicker">{p.kicker}</span>
              <h2>{p.h1}</h2>
              <p>{p.lead}</p>
              {from !== null && <span className="svc-from">يبدأ من <b className="mono">{fmtSAR(from)}</b> ريال</span>}
            </Link>
          )
        })}
      </div>
    </Shell>
  )
}

export function ServiceDetail() {
  const { slug } = useParams({ strict: false }) as { slug?: string }
  const page = SERVICE_PAGES.find((p) => p.slug === slug)
  const catalog = usePricing()
  useMeta(page?.title ?? 'الخدمة غير موجودة | استوديو مكود', page?.description ?? '', `/services/${slug ?? ''}`)
  if (!page) {
    return <Shell><div className="empty" style={{ margin: '80px auto' }}><h3>الخدمة غير موجودة</h3><Link className="btn" to="/services">كل الخدمات</Link></div></Shell>
  }
  const svc = serviceFor(page, catalog)
  const track = TRACKS.find((t) => t.key === page.track) ?? TRACKS[1]
  const calc = svc ? `/?svc=${encodeURIComponent(svc.key)}#estimate` : '/#estimate'
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name: page.h1, description: page.description, serviceType: page.kicker,
      provider: { '@id': 'https://makwad.com/#studio' }, areaServed: { '@type': 'Country', name: 'المملكة العربية السعودية' },
      url: `https://makwad.com/services/${page.slug}`,
      ...(svc ? { offers: { '@type': 'AggregateOffer', priceCurrency: 'SAR', lowPrice: Math.min(...svc.tiers.map((t) => t.price)), highPrice: Math.max(...svc.tiers.map((t) => t.price)) } } : {}),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: page.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://makwad.com/' },
      { '@type': 'ListItem', position: 2, name: 'الخدمات', item: 'https://makwad.com/services' },
      { '@type': 'ListItem', position: 3, name: page.h1, item: `https://makwad.com/services/${page.slug}` },
    ] },
  ]
  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="svc-hero">
        <nav className="crumbs" aria-label="مسار الصفحة"><Link to="/">الرئيسية</Link> / <Link to="/services">الخدمات</Link> / <span>{page.kicker}</span></nav>
        <span className="kicker">{page.kicker} · الرياض والمملكة</span>
        <h1>{page.h1}</h1>
        <p className="lead">{page.lead}</p>
        <div className="cta-row">
          <a className="btn" href={calc}>احسب تكلفة مشروعك</a>
          <a className="btn ghost" href="/#contact">احجز جلسة اكتشاف مجانية</a>
        </div>
      </div>

      <section className="svc-sec">
        <h2>وش تحصل معنا</h2>
        <ul className="svc-includes">{page.includes.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      {svc && (
        <section className="svc-sec">
          <h2>الأسعار</h2>
          <p className="muted">أسعار تبدأ منها بالريال السعودي، والعرض النهائي بعد جلسة الاكتشاف المجانية.</p>
          <div className="svc-tiers">
            {svc.tiers.map((t) => (
              <div className="svc-tier" key={t.key}>
                <b>{t.label}</b>
                {t.hint && <small>{t.hint}</small>}
                <span className="mono">{fmtSAR(t.price)} <small>ريال{svc.monthly ? ' / شهر' : ''}</small></span>
              </div>
            ))}
          </div>
          {svc.addons.length > 0 && (
            <>
              <h3>إضافات حسب احتياجك</h3>
              <ul className="svc-addons">{svc.addons.map((a) => <li key={a.key}><span>{a.label}</span><b className="mono">+{fmtSAR(a.price)}</b></li>)}</ul>
            </>
          )}
          <a className="btn small" href={calc}>احسب السعر بالتفصيل ←</a>
        </section>
      )}

      <section className="svc-sec">
        <h2>مراحل التنفيذ · {track.range}</h2>
        <ol className="svc-steps">{track.steps.map((st) => <li key={st.t}><b>{st.t}</b><span className="muted">{st.w}</span><p>{st.p}</p></li>)}</ol>
      </section>

      <section className="svc-sec">
        <h2>أسئلة شائعة</h2>
        <div className="svc-faq">{page.faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      </section>

      <section className="svc-sec">
        <h2>خدمات أخرى</h2>
        <div className="svc-related">
          {page.related.map((r) => { const p = SERVICE_PAGES.find((x) => x.slug === r); return p ? <Link key={r} to="/services/$slug" params={{ slug: r }}>{p.h1} ←</Link> : null })}
        </div>
      </section>
    </Shell>
  )
}
