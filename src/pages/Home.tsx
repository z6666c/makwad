import { useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { api } from '@/convex/_generated/api'
import { Logo } from '@/components/Logo'
import { SOCIALS, WHY } from '@/site-content'
import { ARTS, COLORS } from '@/mockups'
import { fmtSAR } from '@/estimate'
import type { Doc } from '@/convex/_generated/dataModel'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { RequestForm } from '@/components/RequestForm'
import { Shell, useMeta } from '@/pages/Services'
import { useSettings } from '@/site-config'
import { LangSwitch, useHtmlLang, useLang } from '@/i18n'
import { SOCIAL_LABEL_EN, WHY_EN, WORKS_EN, settingEn } from '@/content-en'
import { TRACKS4, trackFrom, trackOf, tx } from '@/tracks'
import type { TrackKey } from '@/tracks'

const NAV = [
  ['#services', 'التخصصات', 'Specialities'],
  ['#process', 'طريقة العمل', 'How we work'],
  ['/work', 'أعمالنا', 'Our work'],
  ['https://play.makwad.com', 'ألعاب مكود', 'Makwad Games'],
] as const

const STEPS = [
  { t: ['ترسل طلبك', 'You send your request'], p: ['تختار التخصص والخدمات وتكتب فكرتك وميزانيتك التقريبية.', 'Pick the speciality and services, and tell us your idea and approximate budget.'] },
  { t: ['جلسة اكتشاف مجانية', 'Free discovery session'], p: ['نتواصل معك خلال يوم عمل ونفهم التفاصيل.', 'We contact you within one working day to go through the details.'] },
  { t: ['عرض سعر مفصل', 'Detailed quote'], p: ['كل شاشة وميزة ومدتها، وخطة الدفع على مراحل.', 'Every screen and feature with its timeline, and a staged payment plan.'] },
  { t: ['التنفيذ والتسليم', 'Build and delivery'], p: ['نسخة تجريبية تتابعها بنفسك من بوابة العملاء حتى الإطلاق.', 'Preview versions you follow yourself in the client portal, through to launch.'] },
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
    t('أربعة تخصصات: مكود ويب للمواقع، مكود تطبيقات للجوال والألعاب، مكود هوية للهويات والحملات ووكلاء الذكاء، ومكود بزنس للمتاجر والدفع والأنظمة. أرسل طلبك واحصل على عرض سعر مفصل.', 'Four specialities: Makwad Web for websites, Makwad Apps for mobile apps and games, Makwad Brand for identities, campaigns and AI agents, and Makwad Business for stores, payments and systems. Send your request for a detailed quote.'),
    '/',
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [picked, setPicked] = useState<Array<TrackKey>>([])
  const [message, setMessage] = useState('')
  const settings = useSettings()
  const content = useQuery(api.content.publicContent) as
    | { works: Array<Doc<'works'>>; testimonials: Array<Doc<'testimonials'>> }
    | undefined
  const clients = settings.clients ?? []
  // ?track=<key> preselects a speciality; ?custom=<name> comes from older links to a custom request
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const k = trackOf(q.get('track'))
    const c = q.get('custom')?.trim().slice(0, 80)
    if (k) setPicked([k.key])
    if (c) setMessage(`${en ? 'Request' : 'طلب'}: ${c}\n`)
    if (k || c) window.setTimeout(() => document.getElementById('contact')?.scrollIntoView(), 700)
  }, [])
  const ask = (k: TrackKey) => {
    setPicked([k])
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <>
      <header className="site-header">
        <nav className="nav wrap" aria-label={t('القائمة الرئيسية', 'Main menu')}>
          <div className="brand-col"><Logo /><SealSlot /></div>
          <div className="links">
            {NAV.map(([h, ar, e]) => (
              <a key={h} href={h.startsWith('/') ? L(h) : h}>{en ? e : ar}</a>
            ))}
          </div>
          <div className="nav-end">
            <LangSwitch />
            <a className="btn ghost small hide-sm" href={L('/login')}>{t('دخول العملاء', 'Client login')}</a>
            <a className="btn small hide-sm" href="#contact">{t('أرسل طلبك', 'Send a request')}</a>
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
            {TRACKS4.map((x) => <a key={x.key} href={L(`/${x.key}`)}>{tx(x.name, lang)}</a>)}
            {[...NAV.slice(1), ['#contact', 'أرسل طلبك', 'Send a request'] as const].map(([h, ar, e]) => (
              <a key={h} href={h.startsWith('/') ? L(h) : h} onClick={() => setMenuOpen(false)}>{en ? e : ar}</a>
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
              <div><span className="kicker">{t('تخصصاتنا', 'Our specialities')}</span><h2>{t('أربعة تخصصات تحت سقف واحد', 'Four specialities under one roof')}</h2></div>
              <p>{t('موقعك، تطبيقك، هويتك، وتجارتك. ادخل صفحة التخصص لتشوف خدماته، وأرسل طلبك منها أو من هنا.', 'Your website, your app, your brand and your business. Open a speciality to see its services, and send your request there or here.')}</p>
            </div>
            <div className="tracks">
              {TRACKS4.map((tr) => (
                <article className="track" key={tr.key} style={{ ['--tc' as string]: tr.color } as CSSProperties}>
                  <div className="track-head">
                    <span className="track-num mono">{tr.num}</span>
                    <h3><a href={L(`/${tr.key}`)}>{tx(tr.name, lang)}</a></h3>
                    <p>{tx(tr.line, lang)}</p>
                  </div>
                  <ul className="track-list">
                    {tr.services.map((s) => (
                      <li key={s.key}>{tx(s.name, lang)}{s.isNew && <span className="trk-new">{t('جديد', 'New')}</span>}</li>
                    ))}
                  </ul>
                  <div className="track-foot">
                    <span className="svc-price"><small>{t('يبدأ من', 'from')}</small><b className="mono">{fmtSAR(trackFrom(tr))}</b><small>{t('ريال', 'SAR')}</small></span>
                    <span className="track-links">
                      <a className="linkish" href={L(`/${tr.key}`)}>{t('تفاصيل التخصص', 'Details')}</a>
                      <button className="btn small trk-btn" type="button" onClick={() => ask(tr.key)}>{t('أرسل طلبك', 'Request')}</button>
                    </span>
                  </div>
                </article>
              ))}
            </div>
            <div className="track-extra">
              <div>
                <b>{t('قبل أي تخصص: الاستشارة والتحليل', 'Before any speciality: consulting and analysis')}</b>
                <span>{t('تحليل فكرة، وثيقة متطلبات، دراسة جدوى تقنية، أو تدقيق نظام قائم، مع تقرير مكتوب بخطة وتكلفة.', 'Idea analysis, a requirements document, a technical feasibility study or an audit of an existing system, with a written report, plan and budget.')}</span>
              </div>
              <div>
                <b>{t('بعد الإطلاق: الاستضافة والصيانة', 'After launch: hosting and maintenance')}</b>
                <span>{t('إطلاق على دومينك مع حماية Cloudflare، نسخ احتياطي ومراقبة، وصيانة شهرية للتحديثات والإضافات.', 'Launch on your domain with Cloudflare protection, backups and monitoring, and monthly maintenance for updates and additions.')}</span>
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

          <div className="work-cta">
            <div><span className="kicker">{t('أعمالنا', 'Our work')}</span><h2>{t('مشاريع أطلقناها وفيديوهات دعائية من صنعنا', 'Projects we launched and promo videos we made')}</h2></div>
            <a className="btn ghost" href={L('/work')}>{t('شاهد أعمالنا ←', 'See our work →')}</a>
          </div>

          <section className="section" id="process">
            <div className="sec-head">
              <div><span className="kicker">{t('طريقة العمل', 'How we work')}</span><h2>{t('من الطلب إلى التسليم', 'From request to delivery')}</h2></div>
              <p>{t('نفس الخطوات في كل التخصصات، والمدة تختلف حسب حجم المشروع.', 'The same steps in every speciality; the timeline depends on the size of the project.')}</p>
            </div>
            <div className="process" style={{ ['--n' as string]: STEPS.length }}>
              {STEPS.map((st, i) => (
                <div className="step" key={st.t[0]}>
                  <div className="dot">{i + 1}</div>
                  <h3>{en ? st.t[1] : st.t[0]}</h3>
                  <p>{en ? st.p[1] : st.p[0]}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="contact">
            <div className="contact">
              <div className="info">
                <div><span className="kicker">{t('أرسل طلبك', 'Send your request')}</span><h2 className="h2">{t('لنتحدث عن مشروعك', 'Let’s talk about your project')}</h2></div>
                <p className="muted">{t('اختر التخصص والخدمات وأرسل فكرتك، ونرد عليك خلال يوم عمل واحد بموعد لجلسة اكتشاف مجانية ثم عرض سعر مفصل.', 'Pick the speciality and services and send your idea; we reply within one working day with a time for a free discovery session, then a detailed quote.')}</p>
                <ContactInfo />
              </div>
              <RequestForm initialTracks={picked} initialMessage={message} />
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="foot">
            <div>
              <Logo />
              <p>{t('مَكْوَد: حيث تُصنع التطبيقات. نبني المواقع والتطبيقات والهويات والمتاجر للشركات في المملكة والخليج.', 'Makwad: where apps are made. We build websites, apps, brands and stores for businesses in Saudi Arabia and the Gulf.')}</p>
              <SocialLinks />
            </div>
            <div>
              <h4>{t('التخصصات', 'Specialities')}</h4>
              <ul>{TRACKS4.map((x) => <li key={x.key}><a href={L(`/${x.key}`)}>{tx(x.name, lang)}</a></li>)}<li><a href={L('/services')}>{t('كل الخدمات والحلول ←', 'All services and solutions →')}</a></li></ul>
            </div>
            <div>
              <h4>{t('الشركة', 'Company')}</h4>
              <ul><li><a href="#services">{t('التخصصات', 'Specialities')}</a></li><li><a href={L('/work')}>{t('أعمالنا', 'Our work')}</a></li><li><a href="https://play.makwad.com">{t('ألعاب مكود', 'Makwad Games')}</a></li><li><a href="#process">{t('طريقة العمل', 'How we work')}</a></li></ul>
            </div>
            <div>
              <h4>{t('العملاء', 'Clients')}</h4>
              <ul><li><a href={L('/login')}>{t('دخول العملاء', 'Client login')}</a></li><li><a href="#contact">{t('أرسل طلبك', 'Send a request')}</a></li></ul>
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
              <a className="btn ghost" href="#services">{t('تعرّف على تخصصاتنا', 'Explore our specialities')}</a>
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

export function WorkCard({ w: raw }: { w: Pick<Doc<'works'>, 'title' | 'label' | 'text' | 'art' | 'color' | 'metrics' | 'url' | 'store'> }) {
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
        {(w.url || w.store) && (
          <div className="case-links">
            {w.url && <a className="case-link" href={w.url} target="_blank" rel="noopener noreferrer">{t('زيارة المشروع ←', 'Visit the project →')}</a>}
            {w.store && <a className="case-link store" href={w.store} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6s1.8-.8 3.3-.8 2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.8-1.1-2.8-4.1zM14 5.2c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3 1.1.1 2.3-.6 3-1.3z"/></svg>{t('حمّلها من App Store', 'Download on the App Store')}</a>}
          </div>
        )}
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
        <p>{t('نماذج موشن جرافيك صممناها لاستوديو مكود بموسيقى أصلية، ونسوي مثلها لنشاطك ضمن مكود هوية.', 'Motion-graphics samples we made for Makwad Studio with original music. We make the same for your business through Makwad Brand.')}</p>
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

/** /work and /en/work: the portfolio and the promo videos, moved off the home page. */
export function WorkPage() {
  const { lang, t, L } = useLang()
  useMeta(
    t('أعمالنا: مشاريع وفيديوهات دعائية | استوديو مكود', 'Our work: projects and promo videos | Makwad Studio'),
    t('نماذج من التطبيقات والأنظمة والمواقع اللي بنيناها، وفيديوهات موشن جرافيك دعائية من صنع استوديو مكود.', 'Examples of the apps, systems and websites we built, and motion-graphics promo videos made by Makwad Studio.'),
    '/work',
  )
  const settings = useSettings()
  const content = useQuery(api.content.publicContent) as
    | { works: Array<Doc<'works'>>; testimonials: Array<Doc<'testimonials'>> }
    | undefined
  return (
    <Shell>
      <div className="svc-hero">
        <nav className="crumbs" aria-label={t('مسار الصفحة', 'Breadcrumb')}><a href={L('/')}>{t('الرئيسية', 'Home')}</a> / <span>{t('أعمالنا', 'Our work')}</span></nav>
        <h1>{t('أعمالنا', 'Our work')}</h1>
        <p className="lead">{t('مشاريع أطلقناها لعملائنا، وفيديوهات دعائية من صنعنا.', 'Projects we launched for our clients, and promo videos we made.')}</p>
      </div>
      <Work works={content?.works} showNote={settings.showExampleNote !== false} />
      <PromoVideos />
      <section className="svc-sec">
        <h2>{t('عندك مشروع؟', 'Have a project in mind?')}</h2>
        <div className="svc-related">
          {TRACKS4.map((x) => <a key={x.key} href={`${L(`/${x.key}`)}#request`}>{tx(x.name, lang)} {t('←', '→')}</a>)}
        </div>
      </section>
    </Shell>
  )
}
