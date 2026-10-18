import { Link } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '@/convex/_generated/api'
import { Logo } from '@/components/Logo'
import { FAQ, PLANS, SERVICES, TRACKS, WHY } from '@/site-content'
import { ARTS, COLORS } from '@/mockups'
import { Estimator } from '@/components/Estimator'
import { fmtSAR } from '@/estimate'
import type { ServiceKey } from '@/estimate'
import type { Doc } from '@/convex/_generated/dataModel'
import { useTitle } from '@/useTitle'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { usePricing, useSettings } from '@/site-config'

const NAV = [
  ['#services', 'خدماتنا'],
  ['#process', 'طريقة العمل'],
  ['#work', 'أعمالنا'],
  ['#plans', 'الباقات'],
  ['#estimate', 'حاسبة الأسعار'],
  ['#faq', 'الأسئلة الشائعة'],
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
  useTitle('استوديو مكود | حيث تُصنع التطبيقات')
  const [menuOpen, setMenuOpen] = useState(false)
  const [plan, setPlan] = useState('لم أحدد بعد')
  const [trackKey, setTrackKey] = useState<string | null>(null)
  useEffect(() => { setTrackKey(null) }, [plan])
  const track = TRACKS.find((t) => t.key === trackKey) ?? TRACKS.find((t) => t.plan === plan) ?? TRACKS[1]
  const [types, setTypes] = useState<Array<string>>([])
  const [message, setMessage] = useState('')
  const [estSvc, setEstSvc] = useState<ServiceKey>('web')
  const priceOf = (k: ServiceKey) => {
    setEstSvc(k)
    document.getElementById('estimate')?.scrollIntoView({ behavior: 'smooth' })
  }
  const settings = useSettings()
  const content = useQuery(api.content.publicContent) as
    | { works: Array<Doc<'works'>>; testimonials: Array<Doc<'testimonials'>> }
    | undefined
  const clients = settings.clients ?? []
  const catalog = usePricing()
  const minPrice = Math.min(...catalog.flatMap((c) => c.tiers.map((t) => t.price)), 1500)
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
        <nav className="nav wrap" aria-label="القائمة الرئيسية">
          <Logo />
          <div className="links">
            {NAV.map(([h, t]) => (
              <a key={h} href={h}>{t}</a>
            ))}
          </div>
          <div className="nav-end">
            <Link className="btn ghost small" to="/login">دخول العملاء</Link>
            <a className="btn small hide-sm" href="#contact">اطلب عرض سعر</a>
            <button
              className="menu-btn"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mMenu"
              aria-label="فتح القائمة"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Icon d='<path d="M4 7h16M4 12h16M4 17h16"/>' />
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="mobile-menu wrap" id="mMenu">
            {[...NAV, ['#contact', 'تواصل معنا'] as const].map(([h, t]) => (
              <a key={h} href={h} onClick={() => setMenuOpen(false)}>{t}</a>
            ))}
          </div>
        )}
      </header>

      <main id="top">
        <Hero stats={settings.stats ?? []} />
        {clients.length > 0 && (
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
              <div><span className="kicker">خدماتنا</span><h2>ماذا نبني</h2></div>
              <p>خدمات بأسعار واضحة تبدأ من {fmtSAR(minPrice)} ريال. اضغط «احسب السعر» لترى التكلفة بالتفصيل.</p>
            </div>
            <div className="services">
              {catalog.map((c) => {
                const st = SERVICES.find((x) => x.key === c.key)
                return (
                  <div className="svc" key={c.key}>
                    <div className="svc-icon"><Icon d={st?.icon ?? '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'} /></div>
                    <h3>{c.label}</h3>
                    <p>{c.text || st?.text || ''}</p>
                    <div className="tags">{(c.tags?.length ? c.tags : st?.tags ?? []).map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                    <div className="svc-foot">
                      <span className="svc-price"><small>يبدأ من</small><b className="mono">{fmtSAR(Math.min(...c.tiers.map((t) => t.price)))}</b><small>ريال{c.monthly ? ' / شهرياً' : ''}</small></span>
                      <button className="linkish" type="button" onClick={() => priceOf(c.key)}>احسب السعر ←</button>
                    </div>
                  </div>
                )
              })}
              <div className="svc svc-cta">
                <h3>مشروعك مختلف؟</h3>
                <p>نجهّز لك عرضاً مخصصاً بعد جلسة اكتشاف مجانية.</p>
                <a className="btn small" href="#contact">احجز جلسة مجانية</a>
              </div>
            </div>
          </section>

          <section className="section" id="why">
            <div className={content && content.testimonials.length === 0 ? 'why single' : 'why'}>
              <div>
                <div className="sec-head" style={{ marginBottom: 28 }}>
                  <div><span className="kicker">لماذا استوديو مكود</span><h2>شريك تقني، لا مجرد منفّذ</h2></div>
                </div>
                <div className="why-list">
                  {WHY.map((w) => (
                    <div className="why-item" key={w.title}>
                      <Icon d={w.icon} size={22} />
                      <h3>{w.title}</h3>
                      <p>{w.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              {content === undefined ? <div className="quote-card skel" aria-hidden="true" /> : content.testimonials.length > 0 && <Testimonials items={content.testimonials} />}
            </div>
          </section>

          <section className="section" id="process">
            <div className="sec-head">
              <div><span className="kicker">طريقة العمل</span><h2>مراحل واضحة حسب نوع مشروعك</h2></div>
              <p>{track.note} المدة المتوقعة: <b>{track.range}</b>.</p>
            </div>
            <div className="track-tabs" role="tablist" aria-label="نوع المشروع">
              {TRACKS.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={t.key === track.key} className={t.key === track.key ? 'on' : ''} onClick={() => setTrackKey(t.key)}>
                  {t.label}<small>{t.range}</small>
                </button>
              ))}
            </div>
            <div className="process" role="tabpanel" style={{ ['--n' as string]: track.steps.length }}>
              {track.steps.map((s, i) => (
                <div className="step" key={track.key + s.t}>
                  <div className="dot">{i + 1}</div>
                  <h3>{s.t}</h3>
                  <span className="wk">{s.w}</span>
                  <p>{s.p}</p>
                </div>
              ))}
            </div>
          </section>

          <Work works={content?.works} showNote={settings.showExampleNote !== false} />

          <PromoVideos />

          <section className="section" id="plans">
            <div className="sec-head">
              <div><span className="kicker">الباقات</span><h2>اختر نقطة البداية</h2></div>
              <p>أسعار تقديرية تبدأ منها، والعرض النهائي بعد جلسة الاكتشاف المجانية.</p>
            </div>
            <div className="plans">
              {PLANS.map((p) => {
                const on = p.name === (PLANS.some((x) => x.name === plan) ? plan : 'النمو')
                return (
                  <div
                    className={on ? 'plan feat' : 'plan'}
                    key={p.name}
                    role="button"
                    tabIndex={0}
                    aria-pressed={on}
                    aria-label={`اختيار باقة ${p.name}`}
                    onClick={() => setPlan(p.name)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPlan(p.name) } }}
                  >
                    {p.feat && <span className="badge">الأكثر طلباً</span>}
                    <h3>{p.name}</h3>
                    <div className="price">{p.price}<small>{p.small}</small></div>
                    <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    <a className={on ? 'btn' : 'btn ghost'} href="#contact" onClick={(e) => { e.stopPropagation(); setPlan(p.name) }}>{p.cta}</a>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="section" id="estimate">
            <div className="sec-head">
              <div><span className="kicker">حاسبة الأسعار</span><h2>احسب سعر مشروعك</h2></div>
              <p>اختر الخدمة ونطاقها والإضافات، وتشوف السعر بنداً بنداً مع الإجمالي والمدة والدفعة الأولى، ثم أرسله لنا بضغطة.</p>
            </div>
            <Estimator service={estSvc} onService={setEstSvc} onUse={useEstimate} />
          </section>

          <section className="section" id="faq">
            <div className="faq">
              <div>
                <span className="kicker">الأسئلة الشائعة</span>
                <h2 className="h2">قبل أن تبدأ</h2>
                <p className="muted" style={{ marginTop: 12 }}>لم تجد جوابك؟ اسألنا مباشرة من نموذج التواصل.</p>
              </div>
              <div>
                {FAQ.map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary>{f.q}</summary>
                    <p>{f.a.replace('1,500 ريال', `${fmtSAR(minPrice)} ريال`)}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="section" id="contact">
            <div className="contact">
              <div className="info">
                <div><span className="kicker">تواصل معنا</span><h2 className="h2">لنتحدث عن مشروعك</h2></div>
                <p className="muted">أرسل لنا فكرتك ونرد عليك خلال يوم عمل واحد بموعد لجلسة اكتشاف مجانية.</p>
<ContactInfo />
              </div>
              <ContactForm plan={plan} setPlan={setPlan} types={types} setTypes={setTypes} message={message} setMessage={(m) => { setMessage(m); if (!m) setAmount(undefined) }} amount={amount} coupon={coupon} serviceTypes={[...new Set(catalog.map((c) => c.type || c.label))]} />
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="foot">
            <div>
              <Logo />
              <p>مَكْوَد: حيث تُصنع التطبيقات. نبني تطبيقات الجوال والويب للشركات في المملكة والخليج.</p>
            </div>
            <div>
              <h4>الشركة</h4>
              <ul><li><a href="#services">خدماتنا</a></li><li><a href="#work">أعمالنا</a></li><li><a href="#process">طريقة العمل</a></li></ul>
            </div>
            <div>
              <h4>العملاء</h4>
              <ul><li><Link to="/login">دخول العملاء</Link></li><li><a href="#estimate">حاسبة الأسعار</a></li><li><a href="#contact">اطلب عرض سعر</a></li><li><a href="#faq">الأسئلة الشائعة</a></li></ul>
            </div>
          </div>
          <div className="legal">
            <span>© 2026 استوديو مكود. جميع الحقوق محفوظة.{settings.crNumber && <> · وثيقة العمل الحر رقم <span className="mono" dir="ltr">{settings.crNumber}</span></>}</span>
            <span><Link to="/privacy">سياسة الخصوصية</Link> · <Link to="/terms">الشروط والأحكام</Link> · <Link to="/refund">الإلغاء والاسترداد</Link></span>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </>
  )
}

function Hero({ stats }: { stats: Array<{ value: string; label: string }> }) {
  const [stage, setStage] = useState(0)
  const [auto, setAuto] = useState(true)
  const reduce = usePrefersReducedMotion()
  useEffect(() => {
    if (!auto || reduce) return
    const t = setInterval(() => setStage((s) => (s ? 0 : 1)), 3200)
    return () => clearInterval(t)
  }, [auto, reduce])
  const logs = ['wireframe v0.3 · 6 screens', 'build 1.0.0 (42) · ready for review']
  return (
    <div className="hero-band">
      <div className="wrap">
        <div className="hero">
          <div>
            <div className="eyebrow">استوديو تطوير تطبيقات وأنظمة · الرياض</div>
            <h1>من فكرة على ورقة<br />إلى تطبيق <em>منشور في المتجر</em></h1>
            <p className="lead">نصمّم ونبني تطبيقات الجوال والمواقع والأنظمة وأدوات الذكاء الاصطناعي، ونحلل مشاريعك قبل التنفيذ. فريق واحد يتولى التحليل والتصميم والبرمجة والإطلاق، ويبقى معك بعده.</p>
            <div className="cta-row">
              <a className="btn" href="#contact">احجز جلسة اكتشاف مجانية</a>
              <a className="btn ghost" href="#estimate">احسب سعر مشروعك</a>
            </div>
            {stats.length > 0 && (
              <div className="stats">
                {stats.map((st) => <div key={st.label}><b>{st.value}</b>{st.label}</div>)}
              </div>
            )}
          </div>
          <div className="stage">
            <div className="phone" aria-hidden="true">
              <div className="screen">
                <div className="notch" />
                <div className={stage === 0 ? 'layer sk' : 'layer sk off'}>
                  <div className="bar" style={{ width: '55%' }} />
                  <div className="bar" style={{ width: '35%', height: 8 }} />
                  <div className="box" style={{ height: 92 }} />
                  <div className="box" style={{ height: 44 }} />
                  <div className="box" style={{ height: 44 }} />
                  <div className="box" style={{ height: 44 }} />
                  <div className="bar" style={{ marginTop: 'auto', height: 22 }} />
                </div>
                <div className={stage === 1 ? 'layer dz' : 'layer dz off'}>
                  <div className="h">صباح الخير، نورة</div>
                  <div className="sub">طلبك في الطريق إليك</div>
                  <div className="card main">
                    <span style={{ fontSize: '.72rem', opacity: 0.85 }}>الوصول المتوقع</span>
                    <span className="big">12 min</span>
                    <span style={{ fontSize: '.7rem', opacity: 0.85 }}>المندوب: سعد · حي الشاطئ</span>
                  </div>
                  <div className="card"><span>قهوة مختصة ×2</span><span className="pill">تم التجهيز</span></div>
                  <div className="card"><span>كرواسون زعتر</span><span className="pill">تم التجهيز</span></div>
                  <div className="card"><span>نقاط الولاء</span><span className="mono">320</span></div>
                  <div className="tabbar"><i className="on" /><i /><i /><i /></div>
                </div>
              </div>
            </div>
            <div className="seg" role="group" aria-label="مراحل بناء التطبيق">
              {['مخطط أولي', 'التصميم النهائي'].map((t, i) => (
                <button key={t} type="button" aria-pressed={stage === i} onClick={() => { setAuto(false); setStage(i) }}>{t}</button>
              ))}
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

export function WorkCard({ w }: { w: Pick<Doc<'works'>, 'title' | 'label' | 'text' | 'art' | 'color' | 'metrics' | 'url'> }) {
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
        {w.url && <a className="case-link" href={w.url} target="_blank" rel="noopener noreferrer">زيارة المشروع ←</a>}
      </div>
    </article>
  )
}

// Motion-graphics samples made for Makwad itself (files in public/videos).
const PROMOS = [
  { src: 'chat', title: 'محادثة مع عميل', text: 'إعلان على شكل محادثة واتساب، يناسب سناب وتيك توك.' },
  { src: 'launch', title: 'الإطلاق من الرياض', text: 'قصة سينمائية بعد تنازلي وإطلاق، لتعريف العلامة.' },
  { src: 'identity', title: 'تصميم الهويات', text: 'من مفاهيم الشعار إلى هوية كاملة على المطبوعات.' },
]

function PromoVideos() {
  const base = import.meta.env.BASE_URL
  return (
    <section className="section" id="promos">
      <div className="sec-head">
        <div><span className="kicker">المواد الدعائية</span><h2>فيديوهات دعائية من صنعنا</h2></div>
        <p>نماذج موشن جرافيك صممناها لاستوديو مكود بموسيقى أصلية، ونسوي مثلها لنشاطك ابتداءً من 500 ريال.</p>
      </div>
      <div className="promo-grid">
        {PROMOS.map((v) => (
          <figure className="promo-card" key={v.src}>
            <video src={`${base}videos/${v.src}.mp4`} poster={`${base}videos/${v.src}.jpg`} controls playsInline preload="none" aria-label={v.title} />
            <figcaption><b>{v.title}</b><span>{v.text}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function Work({ works, showNote }: { works: Array<Doc<'works'>> | undefined; showNote: boolean }) {
  const [filter, setFilter] = useState<'all' | 'mobile' | 'web'>('all')
  if (works && works.length === 0) return null
  const shown = (works ?? []).filter((c) => filter === 'all' || c.kind === filter || c.kind === 'both')
  return (
    <section className="section" id="work">
      <div className="sec-head">
        <div><span className="kicker">أعمالنا</span><h2>مشاريع أطلقناها</h2></div>
        <p>نماذج من تطبيقات الجوال والأنظمة التي بنيناها لعملائنا.</p>
      </div>
      <div className="filters" role="group" aria-label="تصفية الأعمال">
        {([['all', 'الكل'], ['mobile', 'تطبيقات جوال'], ['web', 'أنظمة ويب']] as const).map(([k, t]) => (
          <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{t}</button>
        ))}
      </div>
      <div className="work">
        {works === undefined
          ? [0, 1, 2].map((k) => <div key={k} className="case skel" aria-hidden="true" />)
          : shown.map((w) => <WorkCard key={w._id} w={w} />)}
      </div>
      {showNote && <p className="note">الأعمال والأرقام وآراء العملاء في هذه الصفحة أمثلة توضيحية.</p>}
    </section>
  )
}

function ContactInfo() {
  const s = useSettings()
  return (
    <>
      {s.email && <CopyRow label="البريد الإلكتروني" value={s.email} />}
      {s.phone && <CopyRow label="الهاتف" value={s.phone} />}
      <CopyRow label="واتساب" value={'+' + s.whatsapp} />
      {s.address && <div className="row"><div><span>المقر</span><b>{s.address}</b></div></div>}
      {s.hours && <div className="row"><div><span>ساعات العمل</span><b>{s.hours}</b></div></div>}
    </>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
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
        {done ? 'تم النسخ' : 'نسخ'}
      </button>
    </div>
  )
}


type FormProps = {
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

function ContactForm({ plan, setPlan, types, setTypes, message, setMessage, amount, coupon, serviceTypes }: FormProps) {
  const TYPES = [...serviceTypes, 'أخرى']
  const submit = useMutation(api.app.submitLead)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setBusy(true)
    setResult(null)
    try {
      const r = await submit({
        name: String(fd.get('name') ?? ''),
        company: String(fd.get('company') ?? ''),
        email: String(fd.get('email') ?? ''),
        types,
        plan,
        message,
        ...(amount ? { amount } : {}),
        ...(coupon ? { coupon } : {}),
        phone: String(fd.get('phone') ?? ''),
        website: String(fd.get('website') ?? ''),
      })
      if (r.ok) {
        setResult({ ok: true, text: 'وصلنا طلبك. سيتواصل معك فريقنا خلال يوم عمل واحد.' })
        form.reset()
        setMessage('')
      } else {
        setResult({ ok: false, text: r.error })
      }
    } catch {
      setResult({ ok: false, text: 'تعذّر إرسال الطلب. تحقق من اتصالك وحاول مرة أخرى.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form" noValidate onSubmit={onSubmit}>
      <div className="field"><label htmlFor="name">الاسم</label><input id="name" name="name" autoComplete="name" placeholder="مثال: عبدالله السالم" /></div>
      <div className="field"><label htmlFor="company">الشركة</label><input id="company" name="company" autoComplete="organization" placeholder="اختياري" /></div>
      <div className="field"><label htmlFor="email">البريد الإلكتروني</label><input id="email" name="email" type="email" autoComplete="email" dir="ltr" placeholder="name@company.sa" /></div>
      <div className="hp" aria-hidden="true"><label htmlFor="website">الموقع</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="field"><label htmlFor="phone">رقم الجوال (واتساب)</label><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="05XXXXXXXX" /></div>
      <div className="field full">
        <span className="lbl">نوع المشروع</span>
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
        <label htmlFor="plan">الباقة</label>
        <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value)}>
          {['لم أحدد بعد', 'الانطلاقة', 'النمو', 'المنشآت'].map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="field full"><label htmlFor="message">نبذة عن الفكرة</label><textarea id="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={message ? 9 : 4} placeholder="ما فكرة مشروعك، ومن سيستخدمه؟" /></div>
      <div className="field full">
        <button className="btn" type="submit" disabled={busy}>{busy ? 'جارٍ الإرسال…' : 'إرسال الطلب'}</button>
        <small className="consent">بإرسال الطلب فإنك توافق على <Link to="/privacy">سياسة الخصوصية</Link> و<Link to="/terms">الشروط والأحكام</Link>.</small>
      </div>
      {result && <div className={result.ok ? 'sent' : 'sent err'} role="status">{result.text}</div>}
    </form>
  )
}
