// One page per speciality: /web, /apps, /brand, /business (Arabic) and /en/... (English).
// Services with a single starting price, how we work, FAQ, and a request form for that speciality.
import { useLocation } from '@tanstack/react-router'
import { Shell, SERVICE_PAGES, SERVICE_PAGES_EN, useMeta } from '@/pages/Services'
import { RequestForm } from '@/components/RequestForm'
import { fmtSAR } from '@/estimate'
import { basePath, useLang } from '@/i18n'
import { TRACKS4, trackFrom, tx } from '@/tracks'
import type { CSSProperties } from 'react'

export function TrackPage() {
  const { pathname } = useLocation()
  const key = basePath(pathname).replace(/^\//, '').replace(/\/$/, '')
  const tr = TRACKS4.find((x) => x.key === key) ?? TRACKS4[0]
  const { lang, en, t, L } = useLang()
  useMeta(tx(tr.title, lang), tx(tr.description, lang), `/${tr.key}`)
  const from = trackFrom(tr)
  const url = `https://makwad.com${L(`/${tr.key}`)}`
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name: tx(tr.name, lang), description: tx(tr.description, lang), inLanguage: lang,
      provider: { '@id': 'https://makwad.com/#studio' }, areaServed: { '@type': 'Country', name: t('المملكة العربية السعودية', 'Saudi Arabia') }, url,
      offers: { '@type': 'AggregateOffer', priceCurrency: 'SAR', lowPrice: from },
      hasOfferCatalog: { '@type': 'OfferCatalog', name: tx(tr.name, lang), itemListElement: tr.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: tx(s.name, lang) }, priceSpecification: { '@type': 'PriceSpecification', minPrice: s.from, priceCurrency: 'SAR' } })) },
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: tr.faq.map((f) => ({ '@type': 'Question', name: tx(f.q, lang), acceptedAnswer: { '@type': 'Answer', text: tx(f.a, lang) } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('الرئيسية', 'Home'), item: `https://makwad.com${L('/')}` },
      { '@type': 'ListItem', position: 2, name: tx(tr.name, lang), item: url },
    ] },
  ]
  return (
    <Shell cta="#request">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="svc-hero trk-hero" style={{ ['--tc' as string]: tr.color } as CSSProperties}>
        <nav className="crumbs" aria-label={t('مسار الصفحة', 'Breadcrumb')}><a href={L('/')}>{t('الرئيسية', 'Home')}</a> / <span>{tx(tr.name, lang)}</span></nav>
        <span className="trk-num mono">{tr.num} · {t('التخصص', 'Speciality')}</span>
        <h1>{tx(tr.name, lang)}</h1>
        <p className="lead">{tx(tr.lead, lang)}</p>
        <div className="cta-row">
          <a className="btn trk-btn" href="#request">{t('أرسل طلبك', 'Send your request')}</a>
          <span className="trk-from">{en ? <>From <b className="mono">{fmtSAR(from)}</b> SAR</> : <>يبدأ من <b className="mono">{fmtSAR(from)}</b> ريال</>}</span>
        </div>
      </div>

      <section className="svc-sec">
        <h2>{t('خدمات التخصص', 'Services')}</h2>
        <p className="muted">{t('أسعار تبدأ منها بالريال السعودي، والعرض النهائي مفصل بالبنود بعد جلسة الاكتشاف المجانية.', 'Starting prices in Saudi riyals; the itemised final quote follows the free discovery session.')}</p>
        <div className="trk-grid" style={{ ['--tc' as string]: tr.color } as CSSProperties}>
          {tr.services.map((s) => (
            <article className="trk-card" key={s.key}>
              <h3>{tx(s.name, lang)}{s.isNew && <span className="trk-new">{t('جديد', 'New')}</span>}</h3>
              <p>{tx(s.text, lang)}</p>
              <div className="trk-card-foot">
                <span>{en ? <>From <b className="mono">{fmtSAR(s.from)}</b> SAR{s.monthly ? ' / month' : ''}</> : <>يبدأ من <b className="mono">{fmtSAR(s.from)}</b> ريال{s.monthly ? ' / شهرياً' : ''}</>}</span>
                <span className="muted">{tx(s.time, lang)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="svc-sec">
        <h2>{t('كيف نشتغل', 'How we work')}</h2>
        <ol className="svc-steps">{tr.steps.map((st) => <li key={st.t[0]}><b>{tx(st.t, lang)}</b><span className="muted">{tx(st.w, lang)}</span><p>{tx(st.p, lang)}</p></li>)}</ol>
      </section>

      <section className="svc-sec">
        <h2>{t('أسئلة شائعة', 'FAQ')}</h2>
        <div className="svc-faq">{tr.faq.map((f) => <details key={f.q[0]}><summary>{tx(f.q, lang)}</summary><p>{tx(f.a, lang)}</p></details>)}</div>
      </section>

      {tr.pages.length > 0 && (
        <section className="svc-sec">
          <h2>{t('اقرأ أكثر', 'Read more')}</h2>
          <div className="svc-related">
            {tr.pages.map((slug) => { const p = SERVICE_PAGES.find((x) => x.slug === slug); if (!p) return null; const h1 = en ? SERVICE_PAGES_EN[slug]?.h1 ?? p.h1 : p.h1; return <a key={slug} href={L(`/services/${slug}`)}>{h1} {t('←', '→')}</a> })}
          </div>
        </section>
      )}

      <section className="svc-sec" id="request">
        <h2>{en ? `Send your ${tx(tr.name, lang)} request` : `أرسل طلبك في ${tx(tr.name, lang)}`}</h2>
        <p className="muted">{t('يوصلنا طلبك مباشرة، ونتواصل معك خلال يوم عمل لترتيب جلسة الاكتشاف وإرسال عرض السعر.', 'Your request reaches us directly; we contact you within one working day to arrange the discovery session and send the quote.')}</p>
        <RequestForm initialTracks={[tr.key]} />
      </section>

      <section className="svc-sec">
        <h2>{t('التخصصات الأخرى', 'Other specialities')}</h2>
        <div className="svc-related">
          {TRACKS4.filter((x) => x.key !== tr.key).map((x) => <a key={x.key} href={L(`/${x.key}`)}>{tx(x.name, lang)} {t('←', '→')}</a>)}
        </div>
      </section>
    </Shell>
  )
}
