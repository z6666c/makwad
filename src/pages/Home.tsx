import { Link } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api } from '@/convex/_generated/api'
import { Logo } from '@/components/Logo'
import { FAQ, PLANS, SERVICES, SOCIALS, TRACKS, WHY } from '@/site-content'
import { ARTS, COLORS } from '@/mockups'
import { Estimator } from '@/components/Estimator'
import { SERVICE_PRICING, fmtSAR, presetForPlan, withPlans } from '@/estimate'
import type { ServiceKey } from '@/estimate'
import type { Doc } from '@/convex/_generated/dataModel'
import { useTitle } from '@/useTitle'
import { toWaNumber } from '@/phone'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { SERVICE_PAGES, serviceFor, useMeta } from '@/pages/Services'
import { usePricing, useSettings, useLocalPricing } from '@/site-config'
import { LangSwitch, useHtmlLang, useLang } from '@/i18n'
import { FAQ_EN, PLANS_EN, SOCIAL_LABEL_EN, TRACKS_EN, WA_MESSAGE_EN, WHY_EN, WORKS_EN, planName, settingEn } from '@/content-en'
import { SERVICE_PAGES_EN } from '@/pages/Services'

const NAV = [
  ['#services', 'خدماتنا', 'Services'],
  ['#process', 'طريقة العمل', 'How we work'],
  ['#work', 'أعمالنا', 'Work'],
  ['#plans', 'الباقات', 'Plans'],
  ['#estimate', 'حاسبة الأسعار', 'Price calculator'],
  ['#faq', 'الأسئلة الشائعة', 'FAQ'],
] as const

const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: d }}
  />
)

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])
  return reduce
}

export default function Home() {
  const { lang, en, t, L } = useLang()
  useHtmlLang()
  useMeta(
    t('استوديو مكود | تصميم وبرمجة تطبيقات الجوال والمواقع في الرياض', 'Makwad Studio | Mobile App & Website Development in Riyadh'),
    t('شركة تصميم وبرمجة تطبيقات جوال ومواقع ومتاجر إلكترونية وأنظمة إدارة في الرياض، مع تصميم الهويات وأدوات الذكاء الاصطناعي. احسب تكلفة مشروعك بالتفصيل، والباقات تبدأ من 850 ريال.', 'Mobile app, website, online store and management system design and development in Riyadh, plus brand identities and AI tools. Price your project in detail; plans start at SAR 850.'),
    '/',
  )
  const PL = en ? PLANS_EN : PLANS
  const FQ = en ? FAQ_EN : FAQ
  const [menuOpen, setMenuOpen] = useState(false)
  const [plan, setPlan] = useState('لم أحدد بعد')
  const track = (en ? TRACKS_EN : TRACKS).find((x) => x.plan === plan) ?? (en ? TRACKS_EN : TRACKS)[1]
  const [types, setTypes] = useState<Array<string>>([])
  const [message, setMessage] = useState('')
  const [estSvc, setEstSvc] = useState<ServiceKey>('web')
  // start the calculator on the featured plan so the cards and the calculator agree from the first view
  const [preset, setPreset] = useState<{ service: ServiceKey; tier: string; n: number } | null>(() => {
    const ps = presetForPlan('النمو', withPlans(SERVICE_PRICING, PLANS))
    return ps ? { ...ps, n: 1 } : null
  })
  const priceOf = (k: ServiceKey) => {
    setEstSvc(k)
    document.getElementById('estimate')?.scrollIntoView({ behavior: 'smooth' })
  }
  const settings = useSettings()
  const content = useQuery(api.content.publicContent) as
    | { works: Array<Doc<'works'>>; testimonials: Array<Doc<'testimonials'>> }
    | undefined
  const clients = settings.clients ?? []
  const rawCatalog = usePricing()
  const catalog = useLocalPricing()
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const k = q.get('svc')
    const svc = k ? catalog.find((c) => c.key === k) : undefined
    const tier = svc?.tiers.find((t) => t.key === q.get('tier')) ?? svc?.tiers[0]
    if (svc && tier) setPreset((cur) => (cur?.service === svc.key && cur.tier === tier.key ? cur : { service: svc.key, tier: tier.key, n: (cur?.n ?? 0) + 1 }))
  }, [catalog])
  // ?custom=<service name> comes from a service page that is quoted by special request
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('custom')?.trim().slice(0, 80)
    if (!c) return
    setPlan('طلب خاص')
    setTypes([en ? 'Other' : 'أخرى'])
    setMessage((m) => m || `${en ? 'Custom request' : 'طلب خاص'}: ${c}\n`)
    // the hash jump runs before the page finishes laying out, so land on the form again
    window.setTimeout(() => document.getElementById('contact')?.scrollIntoView(), 700)
  }, [])
  const pickPlan = (name: string) => {
    setPlan(name)
    const ps = presetForPlan(name, withPlans(rawCatalog, PLANS))
    if (ps) setPreset((cur) => ({ ...ps, n: (cur?.n ?? 0) + 1 }))
  }
  const minPrice = Math.min(...catalog.flatMap((c) => c.tiers.map((x) => x.price)), 1500)
  const [amount, setAmount] = useState<number | undefined>(undefined)
  const [coupon, setCoupon] = useState<string | undefined>(undefined)
  const useEstimate = (summary: string, p: string, t: Array<string>, total: number, code?: string) => {
    setAmount(total)
    setCoupon(code)
    setMessage(summary)
    setPlan(p)
    setTypes(t)
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    window.setTimeout(() => document.getElementById('name')?.focus({ preventScroll: true }), 600)
  }
  return (
    <>
      <header className="site-header">
        <nav className="nav wrap" aria-label={t('القائمة الرئيسية', 'Main menu')}>
          <div className="brand-col"><Logo /><SealSlot /></div>
          <div className="links">
            {NAV.map(([h, ar, e]) => (
              <a key={h} href={h}>{en ? e : ar}</a>
            ))}
          </div>
          <div className="nav-end">
            <LangSwitch />
            <a className="btn ghost small hide-sm" href={L('/login')}>{t('دخول العملاء', 'Client login')}</a>
            <a className="btn small hide-sm" href="#contact">{t('اطلب عرض سعر', 'Get a quote')}</a>
            <button
              className="menu-btn"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mMenu"
              aria-label={t('فتح القائمة', 'Open menu')}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Icon d='<path d="M4 7h16M4 12h16M4 17h16"/>' />
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="mobile-menu wrap" id="mMenu">
            {[...NAV, ['#contact', 'تواصل معنا', 'Contact'] as const].map(([h, ar, e]) => (
              <a key={h} href={h} onClick={() => setMenuOpen(false)}>{en ? e : ar}</a>
            ))}
            <a href={L('/login')}>{t('دخول العملاء', 'Client login')}</a>
          </div>
        )}
      </header>

      <main id="top">
        <Hero stats={settings.stats ?? []} />
        {clients.length > 0 && !en && (
          <div className="strip">
            <div className="wrap">
              <span>شركات وثقت بنا</span>
              <ul className="clients">
                {clients.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </div>
        )}

        <div className="wrap">
          <section className="section" id="services">
            <div className="sec-head">
              <div><span className="kicker">{t('خدماتنا', 'Our services')}</span><h2>{t('تصميم وبرمجة التطبيقات والمواقع والأنظمة', 'Design and development of apps, websites and systems')}</h2></div>
              <p>{en ? <>Clear prices from SAR {fmtSAR(minPrice)}. Tap “Price it” to see the cost in detail.</> : <>خدمات بأسعار واضحة تبدأ من {fmtSAR(minPrice)} ريال. اضغط «احسب السعر» لترى التكلفة بالتفصيل.</>}</p>
            </div>
            <div className="services">
              {catalog.map((c) => {
                const st = SERVICES.find((x) => x.key === c.key)
                return (
                  <div className="svc" key={c.key}>
                    <div className="svc-icon"><Icon d={st?.icon ?? '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'} /></div>
                    <h3>{c.label}</h3>
                    <p>{c.text || (en ? '' : st?.text) || ''}</p>
                    <div className="tags">{(c.tags?.length ? c.tags : en ? [] : st?.tags ?? []).map((g) => <span className="tag" key={g}>{g}</span>)}</div>
                    <div className="svc-foot">
                      <span className="svc-price"><small>{t('يبدأ من', 'from')}</small><b className="mono">{fmtSAR(Math.min(...c.tiers.map((x) => x.price)))}</b><small>{t('ريال', 'SAR')}{c.monthly ? t(' / شهرياً', ' / month') : ''}</small></span>
                      <span className="svc-links">
                        {(() => { const pg = SERVICE_PAGES.find((x) => (x.group ?? 'main') === 'main' && serviceFor(x, [c])); return pg ? <a className="linkish" href={L(`/services/${pg.slug}`)}>{t('التفاصيل', 'Details')}</a> : null })()}
                        <button className="linkish" type="button" onClick={() => priceOf(c.key)}>{t('احسب السعر ←', 'Price it →')}</button>
                      </span>
                    </div>
                  </div>
                )
              })}
              <div className="svc svc-cta">
                <h3>{t('مشروعك مختلف؟', 'Something different in mind?')}</h3>
                <p>{t('نجهّز لك عرضاً مخصصاً بعد جلسة اكتشاف مجانية.', 'We prepare a tailored quote after a free discovery session.')}</p>
                <a className="btn small" href="#contact">{t('احجز جلسة مجانية', 'Book a free session')}</a>
              </div>
            </div>
          </section>

          <section className="section" id="why">
            <div className={(content && content.testimonials.length === 0) || en ? 'why single' : 'why'}>
              <div>
                <div className="sec-head" style={{ marginBottom: 28 }}>
                  <div><span className="kicker">{t('لماذا استوديو مكود', 'Why Makwad Studio')}</span><h2>{t('شريك تقني، لا مجرد منفّذ', 'A technology partner, not just a vendor')}</h2></div>
                </div>
                <div className="why-list">
                  {(en ? WHY_EN : WHY).map((w) => (
                    <div className="why-item" key={w.title}>
                      <Icon d={w.icon} size={22} />
                      <h3>{w.title}</h3>
                      <p>{w.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              {en ? null : content === undefined ? <div className="quote-card skel" aria-hidden="true" /> : content.testimonials.length > 0 && <Testimonials items={content.testimonials} />}
            </div>
          </section>

          <Work works={content?.works} showNote={settings.showExampleNote !== false} />

          <PromoVideos />

          <section className="section" id="plans">
            <div className="sec-head">
              <div><span className="kicker">{t('الباقات والأسعار', 'Plans & pricing')}</span><h2>{t('اختر نقطة البداية', 'Pick your starting point')}</h2></div>
              <p>{t('أسعار تقديرية تبدأ منها، والعرض النهائي بعد جلسة الاكتشاف المجانية.', 'Starting prices; the final quote follows the free discovery session.')}</p>
            </div>
            <div className="plans">
              {PLANS.map((p0, pi) => {
                const p = PL[pi]
                const on = p0.name === (PLANS.some((x) => x.name === plan) ? plan : 'النمو')
                return (
                  <div
                    className={on ? 'plan feat' : 'plan'}
                    key={p0.name}
                    role="button"
                    tabIndex={0}
                    aria-pressed={on}
                    aria-label={en ? `Choose the ${p.name} plan` : `اختيار باقة ${p.name}`}
                    onClick={() => pickPlan(p0.name)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickPlan(p0.name) } }}
                  >
                    {p.feat && <span className="badge">{t('الأكثر طلباً', 'Most popular')}</span>}
                    <h3>{p.name}</h3>
                    <div className="price">{p.price}<small>{p.small}</small></div>
                    <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    {'note' in p && p.note && <p className="plan-note">{p.note}</p>}
                    <a className={on ? 'btn' : 'btn ghost'} href="#contact" onClick={(e) => { e.stopPropagation(); pickPlan(p0.name) }}>{p.cta}</a>
                  </div>
                )
              })}
            </div>
            <div className="plan-timeline" id="process" aria-live="polite">
              <div className="pt-head">
                <div>
                  <span className="kicker">{t('طريقة العمل', 'How we work')}</span>
                  <h3>{en ? `${planName(track.plan, lang)} plan: delivery stages` : `مراحل تنفيذ باقة ${track.plan}`}</h3>
                </div>
                <p>{track.note} <b>{t('المدة المتوقعة', 'Expected timeline')}: {track.range}</b> <a className="pt-calc" href="#estimate">{en ? `Price the ${planName(track.plan, lang)} plan in the calculator ↓` : `احسب تفاصيل باقة ${track.plan} في الحاسبة ↓`}</a></p>
              </div>
              <div className="process" style={{ ['--n' as string]: track.steps.length }}>
                {track.steps.map((st, i) => (
                  <div className="step" key={track.key + st.t}>
                    <div className="dot">{i + 1}</div>
                    <h3>{st.t}</h3>
                    <span className="wk">{st.w}</span>
                    <p>{st.p}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section" id="estimate">
            <div className="sec-head">
              <div><span className="kicker">{t('حاسبة الأسعار', 'Price calculator')}</span><h2>{t('احسب تكلفة تطبيقك أو موقعك', 'Work out the cost of your app or website')}</h2></div>
              <p>{t('اختر الخدمة ونطاقها والإضافات، وتشوف السعر بنداً بنداً مع الإجمالي والمدة والدفعة الأولى، ثم أرسله لنا بضغطة.', 'Choose the service, its scope and add-ons to see the price line by line with the total, timeline and first payment, then send it to us in one tap.')}</p>
            </div>
            <Estimator service={estSvc} onService={setEstSvc} onUse={useEstimate} preset={preset} onPlan={setPlan} />
          </section>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }) }} />
          <section className="section" id="faq">
            <div className="faq">
              <div>
                <span className="kicker">{t('الأسئلة الشائعة', 'FAQ')}</span>
                <h2 className="h2">{t('قبل أن تبدأ', 'Before you start')}</h2>
                <p className="muted" style={{ marginTop: 12 }}>{t('لم تجد جوابك؟ اسألنا مباشرة من نموذج التواصل.', 'Didn’t find your answer? Ask us directly through the contact form.')}</p>
              </div>
              <div>
                {FQ.map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="section" id="contact">
            <div className="contact">
              <div className="info">
                <div><span className="kicker">{t('تواصل معنا', 'Contact us')}</span><h2 className="h2">{t('لنتحدث عن مشروعك', 'Let’s talk about your project')}</h2></div>
                <p className="muted">{t('أرسل لنا فكرتك ونرد عليك خلال يوم عمل واحد بموعد لجلسة اكتشاف مجانية.', 'Send us your idea and we reply within one working day with a time for a free discovery session.')}</p>
<ContactInfo />
              </div>
              <ContactForm en={en} plan={plan} setPlan={setPlan} types={types} setTypes={setTypes} message={message} setMessage={(m) => { setMessage(m); if (!m) setAmount(undefined) }} amount={amount} coupon={coupon} serviceTypes={[...new Set(catalog.map((c) => c.type || c.label))]} />
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="foot">
            <div>
              <Logo />
              <p>{t('مَكْوَد: حيث تُصنع التطبيقات. نبني تطبيقات الجوال والويب للشركات في المملكة والخليج.', 'Makwad: where apps are made. We build mobile and web apps for businesses in Saudi Arabia and the Gulf.')}</p>
              <SocialLinks />
            </div>
            <div>
              <h4>{t('الخدمات', 'Services')}</h4>
              <ul>{SERVICE_PAGES.filter((p) => (p.group ?? 'main') === 'main').map((p) => <li key={p.slug}><a href={L(`/services/${p.slug}`)}>{en ? SERVICE_PAGES_EN[p.slug]?.h1 ?? p.h1 : p.h1}</a></li>)}<li><a href={L('/services')}>{t('كل الخدمات والحلول ←', 'All services and solutions →')}</a></li></ul>
            </div>
            <div>
              <h4>{t('الشركة', 'Company')}</h4>
              <ul><li><a href="#services">{t('خدماتنا', 'Services')}</a></li><li><a href="#work">{t('أعمالنا', 'Work')}</a></li><li><a href="#process">{t('طريقة العمل', 'How we work')}</a></li></ul>
            </div>
            <div>
              <h4>{t('العملاء', 'Clients')}</h4>
              <ul><li><a href={L('/login')}>{t('دخول العملاء', 'Client login')}</a></li><li><a href="#estimate">{t('حاسبة الأسعار', 'Price calculator')}</a></li><li><a href="#contact">{t('اطلب عرض سعر', 'Get a quote')}</a></li><li><a href="#faq">{t('الأسئلة الشائعة', 'FAQ')}</a></li></ul>
            </div>
          </div>
          <div className="legal">
            <span>{t('© 2026 استوديو مكود. جميع الحقوق محفوظة.', '© 2026 Makwad Studio. All rights reserved.')}{settings.crNumber && <> · {t('وثيقة العمل الحر رقم', 'Freelance document no.')} <span className="mono" dir="ltr">{settings.crNumber}</span></>}</span>
            <span><a href={L('/privacy')}>{t('سياسة الخصوصية', 'Privacy policy')}</a> · <a href={L('/terms')}>{t('الشروط والأحكام', 'Terms')}</a> · <a href={L('/refund')}>{t('الإلغاء والاسترداد', 'Cancellation & refunds')}</a></span>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </>
  )
}

function Hero({ stats }: { stats: Array<{ value: string; label: string }> }) {
  const { en, t } = useLang()
  const [stage, setStage] = useState(0)
  const [auto, setAuto] = useState(true)
  const reduce = usePrefersReducedMotion()
  useEffect(() => {
    if (!auto || reduce) return
    const t = setInterval(() => setStage((s) => (s + 1) % 4), 3200)
    return () => clearInterval(t)
  }, [auto, reduce])
  const logs = ['wireframe v0.3 · 6 screens', 'build 1.0.0 (42) · ready for review', 'wireframe v0.2 · dashboard', 'deploy · makwad.com · live']
  const dev = stage < 2 ? 0 : 1
  const lay = stage % 2
  return (
    <div className="hero-band">
      <div className="wrap">
        <div className="hero">
          <div>
            <div className="eyebrow">{t('استوديو تطوير تطبيقات وأنظمة · الرياض', 'App & systems development studio · Riyadh')}</div>
            <h1>{t('من فكرة على ورقة', 'From an idea on paper')}<br />
              <span className="h-rot">
                <span className={dev === 0 ? 'on' : undefined} aria-hidden={dev !== 0}>{en ? <>to an app <em>live in the store</em></> : <>إلى تطبيق <em>منشور في المتجر</em></>}</span>
                <span className={dev === 1 ? 'on' : undefined} aria-hidden={dev !== 1}>{en ? <>to a system <em>that runs your business</em></> : <>إلى نظام <em>يدير أعمالك</em></>}</span>
              </span>
            </h1>
            <p className="lead">{t('نصمّم ونبني تطبيقات الجوال والمواقع والأنظمة وأدوات الذكاء الاصطناعي، ونحلل مشاريعك قبل التنفيذ. فريق واحد يتولى التحليل والتصميم والبرمجة والإطلاق، ويبقى معك بعده.', 'We design and build mobile apps, websites, systems and AI tools, and analyse your project before we build. One team handles analysis, design, development and launch, and stays with you afterwards.')}</p>
            <div className="cta-row">
              <a className="btn" href="#contact">{t('احجز جلسة اكتشاف مجانية', 'Book a free discovery session')}</a>
              <a className="btn ghost" href="#estimate">{t('احسب سعر مشروعك', 'Price your project')}</a>
            </div>
            {stats.length > 0 && (
              <div className="stats">
                {stats.map((st) => <div key={st.label}><b>{st.value}</b>{st.label}</div>)}
              </div>
            )}
          </div>
          <div className="stage">
            <div className="devices" aria-hidden="true">
              <div className={dev === 0 ? 'phone' : 'phone dev-off'}>
                <div className="screen">
                  <div className="notch" />
                  <div className={lay === 0 ? 'layer sk' : 'layer sk off'}>
                    <div className="bar" style={{ width: '55%' }} />
                    <div className="bar" style={{ width: '35%', height: 8 }} />
                    <div className="box" style={{ height: 92 }} />
                    <div className="box" style={{ height: 44 }} />
                    <div className="box" style={{ height: 44 }} />
                    <div className="box" style={{ height: 44 }} />
                    <div className="bar" style={{ marginTop: 'auto', height: 22 }} />
                  </div>
                  <div className={lay === 1 ? 'layer dz' : 'layer dz off'}>
                    <div className="h">{t('صباح الخير، نورة', 'Good morning, Noura')}</div>
                    <div className="sub">{t('طلبك في الطريق إليك', 'Your order is on its way')}</div>
                    <div className="card main">
                      <span style={{ fontSize: '.72rem', opacity: 0.85 }}>{t('الوصول المتوقع', 'Arriving in')}</span>
                      <span className="big">12 min</span>
                      <span style={{ fontSize: '.7rem', opacity: 0.85 }}>{t('المندوب: سعد · حي الشاطئ', 'Courier: Saad · Al Shati')}</span>
                    </div>
                    <div className="card"><span>{t('قهوة مختصة ×2', 'Specialty coffee ×2')}</span><span className="pill">{t('تم التجهيز', 'Ready')}</span></div>
                    <div className="card"><span>{t('كرواسون زعتر', 'Zaatar croissant')}</span><span className="pill">{t('تم التجهيز', 'Ready')}</span></div>
                    <div className="card"><span>{t('نقاط الولاء', 'Loyalty points')}</span><span className="mono">320</span></div>
                    <div className="tabbar"><i className="on" /><i /><i /><i /></div>
                  </div>
                </div>
              </div>
              <div className={dev === 1 ? 'laptop' : 'laptop dev-off'}>
                <div className="lid"><div className="lscreen">
                  <div className={lay === 0 ? 'llayer lsk' : 'llayer lsk off'}>
                    <div className="side"><div className="bar" style={{ width: '70%' }} /><div className="bar" /><div className="bar" /><div className="bar" /><div className="bar" /></div>
                    <div className="main">
                      <div className="bar" style={{ width: '40%' }} />
                      <div className="row3"><div className="box" style={{ height: 30 }} /><div className="box" style={{ height: 30 }} /><div className="box" style={{ height: 30 }} /></div>
                      <div className="box" style={{ flex: 1 }} />
                      <div className="bar" /><div className="bar" style={{ width: '80%' }} />
                    </div>
                  </div>
                  <div className={lay === 1 ? 'llayer ldz' : 'llayer ldz off'}>
                    <div className="side"><div className="logo"><i />{t('متجرك', 'Your store')}</div><span className="on">{t('الرئيسية', 'Home')}</span><span>{t('الطلبات', 'Orders')}</span><span>{t('المنتجات', 'Products')}</span><span>{t('العملاء', 'Customers')}</span><span>{t('التقارير', 'Reports')}</span></div>
                    <div className="main">
                      <div className="top"><b>{t('لوحة متجرك', 'Store dashboard')}</b><small>{t('اليوم', 'Today')}</small></div>
                      <div className="kpis"><div className="main"><small>{t('المبيعات', 'Sales')}</small><b>4,820</b></div><div><small>{t('الطلبات', 'Orders')}</small><b>38</b></div><div><small>{t('الزوار', 'Visitors')}</small><b>1.2K</b></div></div>
                      <div className="chart">{[35, 52, 44, 63, 58, 86, 70].map((h, i) => <i key={i} className={i === 5 ? 'hi' : undefined} style={{ height: `${h}%` }} />)}</div>
                      <div className="orders"><div><span>#1042 · {t('سارة', 'Sara')}</span><span className="pill">{t('قيد التوصيل', 'Out for delivery')}</span></div><div><span>#1041 · {t('فهد', 'Fahad')}</span><span className="pill">{t('تم التسليم', 'Delivered')}</span></div></div>
                    </div>
                  </div>
                </div></div>
                <div className="base" />
              </div>
            </div>
            <div className="stage-ctl">
              <div className="seg" role="group" aria-label={t('نوع الجهاز', 'Device')}>
                {(en ? ['Phone', 'Desktop'] : ['جوال', 'كمبيوتر']).map((x, i) => (
                  <button key={x} type="button" aria-pressed={dev === i} onClick={() => { setAuto(false); setStage(i * 2 + lay) }}>{x}</button>
                ))}
              </div>
              <div className="seg" role="group" aria-label={t('مراحل البناء', 'Build stage')}>
                {(en ? ['Wireframe', 'Final design'] : ['مخطط أولي', 'التصميم النهائي']).map((x, i) => (
                  <button key={x} type="button" aria-pressed={lay === i} onClick={() => { setAuto(false); setStage(dev * 2 + i) }}>{x}</button>
                ))}
              </div>
            </div>
            <div className="build-log">{logs[stage]}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Testimonials({ items }: { items: Array<Doc<'testimonials'>> }) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(true)
  const reduce = usePrefersReducedMotion()
  useEffect(() => {
    if (!auto || reduce || items.length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 6000)
    return () => clearInterval(t)
  }, [auto, reduce, items.length])
  const q = items[Math.min(i, items.length - 1)]
  return (
    <div className="quote-card" aria-live="polite">
      <blockquote>{q.text}</blockquote>
      <div className="who">
        <div className="avatar">{q.name.replace('د. ', '').charAt(0)}</div>
        <div><b>{q.name}</b><span>{q.role}</span></div>
      </div>
      {items.length > 1 && (
        <div className="qnav" role="group" aria-label="آراء العملاء">
          {items.map((x, k) => (
            <button key={x._id} type="button" aria-pressed={k === i} aria-label={`رأي ${k + 1}`} onClick={() => { setAuto(false); setI(k) }} />
          ))}
        </div>
      )}
    </div>
  )
}

export function WorkCard({ w: raw }: { w: Pick<Doc<'works'>, 'title' | 'label' | 'text' | 'art' | 'color' | 'metrics' | 'url'> }) {
  const { en, t } = useLang()
  const tr = en ? WORKS_EN[raw.title] : undefined
  const w = tr ? { ...raw, title: tr.title, label: tr.label, text: tr.text, metrics: raw.metrics.map((m, i) => ({ ...m, label: tr.metrics[i] ?? m.label })) } : raw
  const art = ARTS[w.art] ?? ARTS.coffee
  return (
    <article className="case" style={{ ['--pa' as string]: (COLORS[w.color] ?? COLORS.accent).css }}>
      <div className="case-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: art.html }} />
      <div className="case-body">
        <span className="kind">{w.label}</span>
        <h3>{w.title}</h3>
        <p>{w.text}</p>
        {w.metrics.length > 0 && (
          <div className="metrics">
            {w.metrics.map((m) => <div key={m.label}><b>{m.value}</b>{m.label}</div>)}
          </div>
        )}
        {w.url && <a className="case-link" href={w.url} target="_blank" rel="noopener noreferrer">{t('زيارة المشروع ←', 'Visit the project →')}</a>}
      </div>
    </article>
  )
}

// Motion-graphics samples made for Makwad itself (files in public/videos).
const PROMOS = [
  { src: 'chat', title: 'محادثة مع عميل', text: 'إعلان على شكل محادثة واتساب، يناسب سناب وتيك توك.', en: ['A chat with a client', 'An ad styled as a WhatsApp chat, made for Snapchat and TikTok.'] },
  { src: 'launch', title: 'الإطلاق من الرياض', text: 'قصة سينمائية بعد تنازلي وإطلاق، لتعريف العلامة.', en: ['Launch from Riyadh', 'A cinematic countdown-and-launch story to introduce the brand.'] },
  { src: 'identity', title: 'تصميم الهويات', text: 'من مفاهيم الشعار إلى هوية كاملة على المطبوعات.', en: ['Identity design', 'From logo concepts to a complete identity on print.'] },
]

function PromoVideos() {
  const { en, t } = useLang()
  const base = import.meta.env.BASE_URL
  return (
    <section className="section" id="promos">
      <div className="sec-head">
        <div><span className="kicker">{t('المواد الدعائية', 'Promotional material')}</span><h2>{t('فيديوهات دعائية من صنعنا', 'Promo videos we made')}</h2></div>
        <p>{t('نماذج موشن جرافيك صممناها لاستوديو مكود بموسيقى أصلية، ونسوي مثلها لنشاطك ابتداءً من 500 ريال.', 'Motion-graphics samples we made for Makwad Studio with original music. We make the same for your business from SAR 500.')}</p>
      </div>
      <div className="promo-grid">
        {PROMOS.map((v) => (
          <figure className="promo-card" key={v.src}>
            <video src={`${base}videos/${v.src}.mp4`} poster={`${base}videos/${v.src}.jpg`} controls playsInline preload="none" aria-label={en ? v.en[0] : v.title} />
            <figcaption><b>{en ? v.en[0] : v.title}</b><span>{en ? v.en[1] : v.text}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Work({ works: all, showNote }: { works: Array<Doc<'works'>> | undefined; showNote: boolean }) {
  const { en, t } = useLang()
  const [filter, setFilter] = useState<'all' | 'mobile' | 'web'>('all')
  // in English only the examples that have a translation
  const works = en && all ? all.filter((w) => WORKS_EN[w.title]) : all
  if (works && works.length === 0) return null
  const shown = (works ?? []).filter((c) => filter === 'all' || c.kind === filter || c.kind === 'both')
  return (
    <section className="section" id="work">
      <div className="sec-head">
        <div><span className="kicker">{t('أعمالنا', 'Our work')}</span><h2>{t('مشاريع أطلقناها', 'Projects we launched')}</h2></div>
        <p>{t('نماذج من تطبيقات الجوال والأنظمة التي بنيناها لعملائنا.', 'Examples of the mobile apps and systems we build for clients.')}</p>
      </div>
      <div className="filters" role="group" aria-label={t('تصفية الأعمال', 'Filter work')}>
        {([['all', 'الكل', 'All'], ['mobile', 'تطبيقات جوال', 'Mobile apps'], ['web', 'أنظمة ويب', 'Web systems']] as const).map(([k, ar, e]) => (
          <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{en ? e : ar}</button>
        ))}
      </div>
      <div className="work">
        {works === undefined
          ? [0, 1, 2].map((k) => <div key={k} className="case skel" aria-hidden="true" />)
          : shown.map((w) => <WorkCard key={w._id} w={w} />)}
      </div>
      {showNote && <p className="note">{t('الأعمال والأرقام وآراء العملاء في هذه الصفحة أمثلة توضيحية.', 'The work, figures and client quotes on this page are illustrative examples.')}</p>}
    </section>
  )
}

const SOCIAL_ICONS: Record<string, ReactNode> = {
  instagram: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" /></svg>,
  x: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  tiktok: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><path d="M14 3c.4 2.6 2.3 4.4 5 4.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>,
  facebook: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.6 1.6-1.6h1.7V3.4a22 22 0 0 0-2.5-.1c-2.4 0-4.1 1.5-4.1 4.2v2.3H8.5V13h2.7v8z" fill="currentColor" /></svg>,
}

/** Moves the Saudi Business Center seal (a static element in index.html) under the header logo while this page is shown.
 *  A transparent cover stops the seal from opening on mouse-over: it opens on click, and closes when the pointer moves back onto the page, on a click outside, or with Escape. */
function SealSlot() {
  const { t } = useLang()
  const slot = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const seal = document.querySelector<HTMLElement>('.sbc-verify-seal')
    const el = slot.current
    if (!seal || !el) return
    el.prepend(seal)
    seal.hidden = false
    return () => { seal.hidden = true; document.body.appendChild(seal) }
  }, [])
  useEffect(() => {
    if (!open) return
    const close = (e: Event) => { if (!slot.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    // while the pointer is over the opened seal, events go to its frame; the first move back on our page closes it
    document.addEventListener('pointerdown', close)
    document.addEventListener('pointermove', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('pointermove', close); document.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div className={open ? 'seal-slot open' : 'seal-slot'} ref={slot}>
      {!open && <button type="button" className="seal-cover" aria-label={t('عرض شهادة توثيق المتجر', 'View the store verification certificate')} onClick={() => setOpen(true)} />}
    </div>
  )
}

export function SocialLinks({ withHandles = false }: { withHandles?: boolean }) {
  const { en, t } = useLang()
  return (
    <ul className={withHandles ? 'socials big' : 'socials'} aria-label={t('حساباتنا في التواصل الاجتماعي', 'Our social media accounts')}>
      {SOCIALS.map((x) => (
        <li key={x.key}>
          <a href={x.url} target="_blank" rel="noopener noreferrer" aria-label={`${en ? SOCIAL_LABEL_EN[x.key] : x.label} ${x.handle}`} title={`${en ? SOCIAL_LABEL_EN[x.key] : x.label} ${x.handle}`}>
            <i className={`ic ic-${x.key}`}>{SOCIAL_ICONS[x.key]}</i>
            {withHandles && <b dir="ltr">{x.handle}</b>}
          </a>
        </li>
      ))}
    </ul>
  )
}

function ContactInfo() {
  const s = useSettings()
  const { lang, t } = useLang()
  return (
    <>
      {s.email && <CopyRow label={t('البريد الإلكتروني', 'Email')} value={s.email} />}
      {s.phone && <CopyRow label={t('الهاتف', 'Phone')} value={s.phone} />}
      <CopyRow label={t('واتساب', 'WhatsApp')} value={'+' + s.whatsapp} />
      {s.address && <div className="row"><div><span>{t('المقر', 'Based in')}</span><b>{settingEn(s.address, lang)}</b></div></div>}
      {s.hours && <div className="row"><div><span>{t('ساعات العمل', 'Working hours')}</span><b>{settingEn(s.hours, lang)}</b></div></div>}
      <div className="social-block"><span>{t('تابعنا', 'Follow us')}</span><SocialLinks withHandles /></div>
    </>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const { t } = useLang()
  const [done, setDone] = useState(false)
  return (
    <div className="row">
      <div><span>{label}</span><b className="mono">{value}</b></div>
      <button
        className="copy"
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value.replace(/\s/g, '')).then(
            () => { setDone(true); setTimeout(() => setDone(false), 1600) },
            () => {},
          )
        }}
      >
        {done ? t('تم النسخ', 'Copied') : t('نسخ', 'Copy')}
      </button>
    </div>
  )
}


type FormProps = {
  en: boolean
  plan: string
  setPlan: (p: string) => void
  types: Array<string>
  setTypes: (f: (cur: Array<string>) => Array<string>) => void
  message: string
  setMessage: (m: string) => void
  amount?: number
  coupon?: string
  serviceTypes: Array<string>
}

function ContactForm({ en, plan, setPlan, types, setTypes, message, setMessage, amount, coupon, serviceTypes }: FormProps) {
  const { lang, t, L } = useLang()
  const OTHER = t('أخرى', 'Other')
  const TYPES = [...serviceTypes, OTHER]
  const submit = useMutation(api.app.submitLead)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    if (!toWaNumber(String(fd.get('phone') ?? ''))) {
      setResult({ ok: false, text: t('رقم الجوال مطلوب. اكتبه بصيغة 05XXXXXXXX.', 'A mobile number is required, for example 05XXXXXXXX or +9665XXXXXXXX.') })
      form.querySelector<HTMLInputElement>('#phone')?.focus()
      return
    }
    setBusy(true)
    setResult(null)
    try {
      const r = await submit({
        name: String(fd.get('name') ?? ''),
        company: String(fd.get('company') ?? ''),
        email: String(fd.get('email') ?? ''),
        types,
        plan,
        message: en ? `[EN] ${message}` : message,
        ...(amount ? { amount } : {}),
        ...(coupon ? { coupon } : {}),
        phone: String(fd.get('phone') ?? ''),
        website: String(fd.get('website') ?? ''),
      })
      if (r.ok) {
        setResult({ ok: true, text: t('وصلنا طلبك. سيتواصل معك فريقنا خلال يوم عمل واحد.', 'We have your request. Our team will contact you within one working day.') })
        form.reset()
        setMessage('')
      } else {
        setResult({ ok: false, text: r.error })
      }
    } catch {
      setResult({ ok: false, text: t('تعذّر إرسال الطلب. تحقق من اتصالك وحاول مرة أخرى.', 'The request could not be sent. Check your connection and try again.') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form" noValidate onSubmit={onSubmit}>
      <div className="field"><label htmlFor="name">{t('الاسم', 'Name')}</label><input id="name" name="name" autoComplete="name" placeholder={t('مثال: عبدالله السالم', 'e.g. Sarah Ahmed')} /></div>
      <div className="field"><label htmlFor="company">{t('الشركة', 'Company')}</label><input id="company" name="company" autoComplete="organization" placeholder={t('اختياري', 'Optional')} /></div>
      <div className="field"><label htmlFor="email">{t('البريد الإلكتروني', 'Email')}</label><input id="email" name="email" type="email" autoComplete="email" dir="ltr" placeholder="name@company.sa" /></div>
      <div className="hp" aria-hidden="true"><label htmlFor="website">{t('الموقع', 'Website')}</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="field"><label htmlFor="phone">{t('رقم الجوال (واتساب)', 'Mobile number (WhatsApp)')} <span aria-hidden="true" style={{ color: 'var(--accent)' }}>*</span></label><input id="phone" name="phone" required aria-required="true" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="05XXXXXXXX" /></div>
      <div className="field full">
        <span className="lbl">{t('نوع المشروع', 'Project type')}</span>
        <div className="chips">
          {TYPES.map((t, i) => (
            <label key={t}>
              <input
                type="checkbox"
                id={`type-${i}`}
                checked={types.includes(t)}
                onChange={(e) => setTypes((cur) => (e.target.checked ? [...cur, t] : cur.filter((x) => x !== t)))}
              />
              {t}
            </label>
          ))}
        </div>
      </div>
      <div className="field full">
        <label htmlFor="plan">{t('الباقة', 'Plan')}</label>
        <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value)}>
          {['لم أحدد بعد', 'الانطلاقة', 'النمو', 'المنشآت', 'طلب خاص'].map((p) => <option key={p} value={p}>{planName(p, lang)}</option>)}
        </select>
      </div>
      <div className="field full"><label htmlFor="message">{t('نبذة عن الفكرة', 'About your idea')}</label><textarea id="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={message ? 9 : 4} placeholder={t('ما فكرة مشروعك، ومن سيستخدمه؟', 'What is your project, and who will use it?')} /></div>
      <div className="field full">
        <button className="btn" type="submit" disabled={busy}>{busy ? t('جارٍ الإرسال…', 'Sending…') : t('إرسال الطلب', 'Send request')}</button>
        <small className="consent">{en ? <>By sending this request you agree to our <a href={L('/privacy')}>privacy policy</a> and <a href={L('/terms')}>terms</a>.</> : <>بإرسال الطلب فإنك توافق على <a href={L('/privacy')}>سياسة الخصوصية</a> و<a href={L('/terms')}>الشروط والأحكام</a>.</>}</small>
      </div>
      {result && <div className={result.ok ? 'sent' : 'sent err'} role="status">{result.text}</div>}
    </form>
  )
}
