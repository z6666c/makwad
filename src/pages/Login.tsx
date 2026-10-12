import { Link, useNavigate } from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Logo } from '@/components/Logo'
import { useTitle } from '@/useTitle'

function GoToDashboard() {
  const navigate = useNavigate()
  useEffect(() => {
    void navigate({ to: '/dashboard' })
  }, [navigate])
  return <p className="muted">جارٍ فتح لوحة التحكم…</p>
}

export default function Login() {
  useTitle('تسجيل الدخول | استوديو مكود')
  return (
    <div className="auth-page">
      <aside className="auth-side">
        <Logo />
        <div>
          <h2>بوابة عملاء استوديو مكود</h2>
          <p>تابع مرحلة مشروعك ونسبة الإنجاز، واطّلع على آخر التحديثات، وتواصل مع فريقك من مكان واحد.</p>
        </div>
        <ul className="auth-points">
          <li>مرحلة المشروع ونسبة الإنجاز لحظياً</li>
          <li>سجل كامل بالتحديثات والملاحظات</li>
          <li>إرسال طلبات جديدة لفريقك مباشرة</li>
        </ul>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <AuthLoading><p className="muted">جارٍ التحقق من الجلسة…</p></AuthLoading>
          <Authenticated><GoToDashboard /></Authenticated>
          <Unauthenticated><AuthForms /></Unauthenticated>
          <Link className="back-home" to="/">← العودة إلى الموقع</Link>
        </div>
      </main>
    </div>
  )
}

type Step =
  | { kind: 'signIn' }
  | { kind: 'signUp' }
  | { kind: 'forgot' }
  | { kind: 'verify'; email: string }
  | { kind: 'reset'; email: string }

function arabicError(err: unknown, step: Step['kind']): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/InvalidAccountId/i.test(msg)) return 'لا يوجد حساب بهذا البريد. أنشئ حساباً جديداً.'
  if (/InvalidSecret/i.test(msg)) return 'كلمة المرور غير صحيحة.'
  if (/already exists/i.test(msg)) return 'يوجد حساب بهذا البريد. سجّل الدخول بدلاً من ذلك.'
  if (/TooManyFailedAttempts/i.test(msg)) return 'محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.'
  if (/Invalid password/i.test(msg)) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'
  if (step === 'verify' || step === 'reset') return 'الرمز غير صحيح أو انتهت صلاحيته.'
  return 'تعذّر إكمال العملية. تحقق من البيانات وحاول مرة أخرى.'
}

function AuthForms() {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<Step>({ kind: 'signIn' })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function run(e: FormEvent<HTMLFormElement>, fn: (fd: FormData) => Promise<void>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    setBusy(true)
    try {
      await fn(fd)
    } catch (err) {
      setError(arabicError(err, step.kind))
    } finally {
      setBusy(false)
    }
  }

  const go = (s: Step) => { setStep(s); setError(null) }
  const err = error && <div className="sent err" role="alert">{error}</div>

  if (step.kind === 'verify') {
    return (
      <>
        <div><h1>تأكيد البريد</h1><p className="muted">أرسلنا رمزاً من 6 أرقام إلى <b className="mono">{step.email}</b></p></div>
        <form className="form" onSubmit={(e) => run(e, async (fd) => { await signIn('resend-otp', fd) })}>
          <div className="field"><label htmlFor="code">رمز التحقق</label><input id="code" name="code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} required dir="ltr" autoComplete="one-time-code" placeholder="000000" /></div>
          <input type="hidden" name="email" value={step.email} />
          <input type="hidden" name="flow" value="email-verification" />
          {err}
          <button className="btn" type="submit" disabled={busy}>{busy ? 'جارٍ التحقق…' : 'تأكيد'}</button>
        </form>
        <p className="auth-switch"><button className="linkish" type="button" onClick={() => go({ kind: 'signIn' })}>العودة لتسجيل الدخول</button></p>
      </>
    )
  }

  if (step.kind === 'forgot') {
    return (
      <>
        <div><h1>استعادة كلمة المرور</h1><p className="muted">اكتب بريدك ونرسل لك رمزاً لتعيين كلمة مرور جديدة.</p></div>
        <form className="form" onSubmit={(e) => run(e, async (fd) => {
          await signIn('password', fd)
          go({ kind: 'reset', email: String(fd.get('email')) })
        })}>
          <div className="field"><label htmlFor="email">البريد الإلكتروني</label><input id="email" name="email" type="email" required dir="ltr" autoComplete="email" /></div>
          <input type="hidden" name="flow" value="reset" />
          {err}
          <button className="btn" type="submit" disabled={busy}>{busy ? 'جارٍ الإرسال…' : 'إرسال الرمز'}</button>
        </form>
        <p className="auth-switch"><button className="linkish" type="button" onClick={() => go({ kind: 'signIn' })}>العودة لتسجيل الدخول</button></p>
      </>
    )
  }

  if (step.kind === 'reset') {
    return (
      <>
        <div><h1>كلمة مرور جديدة</h1><p className="muted">اكتب الرمز المرسل إلى <b className="mono">{step.email}</b> وكلمة المرور الجديدة.</p></div>
        <form className="form" onSubmit={(e) => run(e, async (fd) => { await signIn('password', fd) })}>
          <div className="field"><label htmlFor="code">الرمز</label><input id="code" name="code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} required dir="ltr" autoComplete="one-time-code" /></div>
          <div className="field"><label htmlFor="newPassword">كلمة المرور الجديدة</label><input id="newPassword" name="newPassword" type="password" minLength={8} required dir="ltr" autoComplete="new-password" /></div>
          <input type="hidden" name="email" value={step.email} />
          <input type="hidden" name="flow" value="reset-verification" />
          {err}
          <button className="btn" type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ ودخول'}</button>
        </form>
      </>
    )
  }

  const isUp = step.kind === 'signUp'
  return (
    <>
      <div>
        <h1>{isUp ? 'إنشاء حساب' : 'تسجيل الدخول'}</h1>
        <p className="muted">{isUp ? 'سجّل بالبريد الذي تتواصل به مع فريق استوديو مكود لترى مشاريعك.' : 'ادخل لمتابعة مشروعك أو لإدارة الطلبات.'}</p>
      </div>
      <form className="form" onSubmit={(e) => run(e, async (fd) => {
        const r = await signIn('password', fd)
        if (!r.signingIn) go({ kind: 'verify', email: String(fd.get('email')).trim().toLowerCase() })
      })}>
        {isUp && <div className="field"><label htmlFor="name">الاسم</label><input id="name" name="name" required autoComplete="name" /></div>}
        <div className="field"><label htmlFor="email">البريد الإلكتروني</label><input id="email" name="email" type="email" required dir="ltr" autoComplete="email" /></div>
        <div className="field">
          <label htmlFor="password">كلمة المرور</label>
          <input id="password" name="password" type="password" required minLength={8} dir="ltr" autoComplete={isUp ? 'new-password' : 'current-password'} />
          {isUp && <small className="muted">8 أحرف على الأقل</small>}
        </div>
        <input type="hidden" name="flow" value={isUp ? 'signUp' : 'signIn'} />
        {err}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'لحظة…' : isUp ? 'إنشاء الحساب' : 'دخول'}</button>
        {isUp && <small className="consent">بإنشاء الحساب فإنك توافق على <Link to="/privacy">سياسة الخصوصية</Link> و<Link to="/terms">الشروط والأحكام</Link>.</small>}
        {!isUp && <button className="linkish" type="button" onClick={() => go({ kind: 'forgot' })} style={{ justifySelf: 'start', fontSize: '.88rem' }}>نسيت كلمة المرور؟</button>}
      </form>
      <p className="auth-switch">
        {isUp ? 'لديك حساب؟ ' : 'ليس لديك حساب؟ '}
        <button className="linkish" type="button" onClick={() => go({ kind: isUp ? 'signIn' : 'signUp' })}>{isUp ? 'سجّل الدخول' : 'أنشئ حساباً'}</button>
      </p>
    </>
  )
}
