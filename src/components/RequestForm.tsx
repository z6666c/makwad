// The request form used on the home page and on every speciality page.
// The lead keeps the specialities in `types`, the budget in `plan` (shown as "الميزانية" in the dashboard),
// and the chosen services at the top of the message. Stored texts are always Arabic so the dashboard reads one language.
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '@/convex/_generated/api'
import { toWaNumber } from '@/phone'
import { useLang } from '@/i18n'
import { BUDGETS, TRACKS4, tx } from '@/tracks'
import type { TrackKey } from '@/tracks'

export function RequestForm({ initialTracks = [], initialMessage = '' }: { initialTracks?: Array<TrackKey>; initialMessage?: string }) {
  const { lang, en, t, L } = useLang()
  const submit = useMutation(api.app.submitLead)
  const [tracks, setTracks] = useState<Array<TrackKey>>(initialTracks)
  const [services, setServices] = useState<Array<string>>([])
  const [budget, setBudget] = useState(BUDGETS.length - 1)
  const [message, setMessage] = useState(initialMessage)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => { if (initialMessage) setMessage((m) => m || initialMessage) }, [initialMessage])
  useEffect(() => { if (initialTracks.length) setTracks((cur) => [...new Set([...cur, ...initialTracks])]) }, [initialTracks.join(',')])

  const shown = TRACKS4.filter((x) => tracks.includes(x.key))
  const toggleTrack = (k: TrackKey) => setTracks((cur) => {
    if (cur.includes(k)) {
      const tr = TRACKS4.find((x) => x.key === k)!
      setServices((s) => s.filter((id) => !tr.services.some((sv) => `${k}:${sv.key}` === id)))
      return cur.filter((x) => x !== k)
    }
    return [...cur, k]
  })
  const toggleSvc = (id: string) => setServices((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    if (!toWaNumber(String(fd.get('phone') ?? ''))) {
      setResult({ ok: false, text: t('رقم الجوال مطلوب. اكتبه بصيغة 05XXXXXXXX.', 'A mobile number is required, for example 05XXXXXXXX or +9665XXXXXXXX.') })
      form.querySelector<HTMLInputElement>('input[name="phone"]')?.focus()
      return
    }
    const svcNames = services.map((id) => {
      const [k, s] = id.split(':')
      const sv = TRACKS4.find((x) => x.key === k)?.services.find((x) => x.key === s)
      return sv ? sv.name[0] : ''
    }).filter(Boolean)
    const body = [svcNames.length ? `الخدمات المطلوبة: ${svcNames.join('، ')}` : '', message.trim()].filter(Boolean).join('\n\n')
    setBusy(true)
    setResult(null)
    try {
      const r = await submit({
        name: String(fd.get('name') ?? ''),
        company: String(fd.get('company') ?? ''),
        email: String(fd.get('email') ?? ''),
        types: TRACKS4.filter((x) => tracks.includes(x.key)).map((x) => x.name[0]),
        plan: BUDGETS[budget][0],
        message: en ? `[EN] ${body}` : body,
        phone: String(fd.get('phone') ?? ''),
        website: String(fd.get('website') ?? ''),
      })
      if (r.ok) {
        setResult({ ok: true, text: t('وصلنا طلبك. سيتواصل معك فريقنا خلال يوم عمل واحد.', 'We have your request. Our team will contact you within one working day.') })
        form.reset()
        setMessage('')
        setServices([])
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
        <span className="lbl">{t('التخصص', 'Speciality')}</span>
        <div className="chips">
          {TRACKS4.map((x) => (
            <label key={x.key}>
              <input type="checkbox" checked={tracks.includes(x.key)} onChange={() => toggleTrack(x.key)} />
              {tx(x.name, lang)}
            </label>
          ))}
        </div>
      </div>
      {shown.length > 0 && (
        <div className="field full">
          <span className="lbl">{t('الخدمات اللي تحتاجها', 'Services you need')} <small className="muted">{t('اختياري', 'optional')}</small></span>
          <div className="chips">
            {shown.flatMap((x) => x.services.map((sv) => {
              const id = `${x.key}:${sv.key}`
              return (
                <label key={id}>
                  <input type="checkbox" checked={services.includes(id)} onChange={() => toggleSvc(id)} />
                  {tx(sv.name, lang)}
                </label>
              )
            }))}
          </div>
        </div>
      )}
      <div className="field full">
        <span className="lbl">{t('ميزانيتك التقريبية', 'Your approximate budget')}</span>
        <div className="chips">
          {BUDGETS.map((b, i) => (
            <label key={b[0]}>
              <input type="radio" name="budget" checked={budget === i} onChange={() => setBudget(i)} />
              {tx(b, lang)}
            </label>
          ))}
        </div>
      </div>
      <div className="field full"><label htmlFor="message">{t('اكتب فكرتك باختصار', 'Tell us about your idea')}</label><textarea id="message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder={t('ما فكرة مشروعك، ومن سيستخدمه؟', 'What is your project, and who will use it?')} /></div>
      <div className="field full">
        <button className="btn" type="submit" disabled={busy}>{busy ? t('جارٍ الإرسال…', 'Sending…') : t('أرسل الطلب', 'Send request')}</button>
        <small className="consent">{en ? <>By sending this request you agree to our <a href={L('/privacy')}>privacy policy</a> and <a href={L('/terms')}>terms</a>.</> : <>بإرسال الطلب فإنك توافق على <a href={L('/privacy')}>سياسة الخصوصية</a> و<a href={L('/terms')}>الشروط والأحكام</a>.</>}</small>
      </div>
      {result && <div className={result.ok ? 'sent' : 'sent err'} role="status">{result.text}</div>}
    </form>
  )
}
