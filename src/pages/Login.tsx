import { useNavigate } from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Logo } from '@/components/Logo'
import { useTitle } from '@/useTitle'
import { twoStep } from '@/twoStep'
import { LangSwitch, useHtmlLang, useLang } from '@/i18n'

function GoToDashboard() {
  const navigate = useNavigate()
  useEffect(() => {
    void navigate({ to: '/dashboard' })
  }, [navigate])
  const { t } = useLang()
  return <p className="muted">{t('جارٍ فتح لوحة التحكم…', 'Opening your dashboard…')}</p>
}

export default function Login() {
  useHtmlLang()
  const { t, L } = useLang()
  useTitle(t('تسجيل الدخول | استوديو مكود', 'Sign in | Makwad Studio'))
  return (
    <div className="auth-page">
      <aside className="auth-side">
        <Logo />
        <div>
          <h2>{t('بوابة عملاء استوديو مكود', 'Makwad Studio client portal')}</h2>
          <p>{t('تابع مرحلة مشروعك ونسبة الإنجاز، واطّلع على آخر التحديثات، وتواصل مع فريقك من مكان واحد.', 'Follow your project’s stage and progress, see the latest updates, and talk to your team, all in one place.')}</p>
        </div>
        <ul className="auth-points">
          <li>{t('مرحلة المشروع ونسبة الإنجاز لحظياً', 'Live project stage and progress')}</li>
          <li>{t('سجل كامل بالتحديثات والملاحظات', 'A full log of updates and notes')}</li>
          <li>{t('إرسال طلبات جديدة لفريقك مباشرة', 'Send new requests to your team directly')}</li>
        </ul>
        <LangSwitch />
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <Gate />
          <a className="back-home" href={L('/')}>{t('← العودة إلى الموقع', '← Back to the site')}</a>
        </div>
      </main>
    </div>
  )
}

function Gate() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const [pending, setPending] = useState(() => twoStep.get())
  const { t } = useLang()
  if (isLoading && !pending) return <p className="muted">{t('جارٍ التحقق من الجلسة…', 'Checking your session…')}</p>
  if (isAuthenticated && !pending) return <GoToDashboard />
  return <AuthForms pending={pending} setPending={(v) => { if (v) twoStep.set(v); else twoStep.clear(); setPending(v) }} />
}

type Step =
  | { kind: 'codeSent'; email: string }
  | { kind: 'signIn' }
  | { kind: 'signUp' }
  | { kind: 'forgot' }
  | { kind: 'verify'; email: string }
  | { kind: 'reset'; email: string }

function arabicError(err: unknown, step: Step['kind'], en = false): string {
  const msg = err instanceof Error ? err.message : String(err)
  const t = (ar: string, e: string) => (en ? e : ar)
  if (/InvalidAccountId/i.test(msg)) return t('لا يوجد حساب بهذا البريد. أنشئ حساباً جديداً.', 'No account uses this email. Create a new account.')
  if (/InvalidSecret/i.test(msg)) return t('كلمة المرور غير صحيحة.', 'The password is incorrect.')
  if (/already exists/i.test(msg)) return t('يوجد حساب بهذا البريد. سجّل الدخول بدلاً من ذلك.', 'An account already uses this email. Sign in instead.')
  if (/TooManyFailedAttempts/i.test(msg)) return t('محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.', 'Too many attempts. Wait a moment and try again.')
  if (/Invalid password/i.test(msg)) return t('كلمة المرور يجب أن تكون 8 أحرف على الأقل.', 'The password must be at least 8 characters.')
  if (step === 'verify' || step === 'reset' || step === 'codeSent') return t('الرمز غير صحيح أو انتهت صلاحيته.', 'The code is wrong or has expired.')
  return t('تعذّر إكمال العملية. تحقق من البيانات وحاول مرة أخرى.', 'Something went wrong. Check your details and try again.')
}

function AuthForms({ pending, setPending }: { pending: string | null; setPending: (v: string | null) => void }) {
  const { signIn, signOut } = useAuthActions()
  const { en, t, L } = useLang()
  const [step, setStep] = useState<Step>(() => (pending && pending.includes('@') ? { kind: 'codeSent', email: pending } : { kind: 'signIn' }))
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
      if (step.kind === 'signIn') setPending(null)
      setError(arabicError(err, step.kind, en))
    } finally {
      setBusy(false)
    }
  }

  const go = (s: Step) => { setStep(s); setError(null) }
  const err = error && <div className="sent err" role="alert">{error}</div>

  if (step.kind === 'codeSent') {
    return (
      <>
        <div><h1>{t('رمز التحقق', 'Verification code')}</h1><p className="muted">{en ? <>Last step: we sent a 6-digit code to <b className="mono">{step.email}</b>. It is valid for 15 minutes; if it hasn’t arrived, check your spam folder.</> : <>آخر خطوة: أرسلنا رمزاً من 6 أرقام إلى <b className="mono">{step.email}</b>. صالح لمدة 15 دقيقة، وإذا ما وصلك شيّك على مجلد الرسائل غير المرغوبة.</>}</p></div>
        <form className="form" onSubmit={(e) => run(e, async (fd) => { await signIn('resend-otp', fd); setPending(null) })}>
          <div className="field"><label htmlFor="code">{t('رمز التحقق', 'Verification code')}</label><input id="code" name="code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} required dir="ltr" autoComplete="one-time-code" placeholder="000000" autoFocus /></div>
          <input type="hidden" name="email" value={step.email} />
          {err}
          <button className="btn" type="submit" disabled={busy}>{busy ? t('جارٍ التحقق…', 'Checking…') : t('دخول', 'Sign in')}</button>
        </form>
        <p className="auth-switch">
          <button className="linkish" type="button" disabled={busy} onClick={async () => {
            setError(null); setBusy(true)
            try { const fd = new FormData(); fd.set('email', step.email); await signIn('resend-otp', fd); setError(null) } catch (e2) { setError(arabicError(e2, 'codeSent', en)) } finally { setBusy(false) }
          }}>{t('إعادة إرسال الرمز', 'Resend the code')}</button>
          {' · '}
          <button className="linkish" type="button" onClick={() => { setPending(null); go({ kind: 'signIn' }) }}>{t('تغيير البريد', 'Change email')}</button>
        </p>
      </>
    )
  }

  if (step.kind === 'verify') {
    return (
      <>
        <div><h1>{t('تأكيد البريد', 'Confirm your email')}</h1><p className="muted">{t('أرسلنا رمزاً من 6 أرقام إلى', 'We sent a 6-digit code to')} <b className="mono">{step.email}</b></p></div>
        <form className="form" onSubmit={(e) => run(e, async (fd) => { await signIn('resend-otp', fd); setPending(null) })}>
          <div className="field"><label htmlFor="code">{t('رمز التحقق', 'Verification code')}</label><input id="code" name="code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} required dir="ltr" autoComplete="one-time-code" placeholder="000000" /></div>
          <input type="hidden" name="email" value={step.email} />
          <input type="hidden" name="flow" value="email-verification" />
          {err}
          <button className="btn" type="submit" disabled={busy}>{busy ? t('جارٍ التحقق…', 'Checking…') : t('تأكيد', 'Confirm')}</button>
        </form>
        <p className="auth-switch"><button className="linkish" type="button" onClick={() => go({ kind: 'signIn' })}>{t('العودة لتسجيل الدخول', 'Back to sign in')}</button></p>
      </>
    )
  }

  if (step.kind === 'forgot') {
    return (
      <>
        <div><h1>{t('استعادة كلمة المرور', 'Reset your password')}</h1><p className="muted">{t('اكتب بريدك ونرسل لك رمزاً لتعيين كلمة مرور جديدة.', 'Enter your email and we’ll send a code to set a new password.')}</p></div>
        <form className="form" onSubmit={(e) => run(e, async (fd) => {
          await signIn('password', fd)
          go({ kind: 'reset', email: String(fd.get('email')) })
        })}>
          <div className="field"><label htmlFor="email">{t('البريد الإلكتروني', 'Email')}</label><input id="email" name="email" type="email" required dir="ltr" autoComplete="email" /></div>
          <input type="hidden" name="flow" value="reset" />
          {err}
          <button className="btn" type="submit" disabled={busy}>{busy ? t('جارٍ الإرسال…', 'Sending…') : t('إرسال الرمز', 'Send code')}</button>
        </form>
        <p className="auth-switch"><button className="linkish" type="button" onClick={() => go({ kind: 'signIn' })}>{t('العودة لتسجيل الدخول', 'Back to sign in')}</button></p>
      </>
    )
  }

  if (step.kind === 'reset') {
    return (
      <>
        <div><h1>{t('كلمة مرور جديدة', 'New password')}</h1><p className="muted">{en ? <>Enter the code sent to <b className="mono">{step.email}</b> and your new password.</> : <>اكتب الرمز المرسل إلى <b className="mono">{step.email}</b> وكلمة المرور الجديدة.</>}</p></div>
        <form className="form" onSubmit={(e) => run(e, async (fd) => { await signIn('password', fd); setPending(null) })}>
          <div className="field"><label htmlFor="code">{t('الرمز', 'Code')}</label><input id="code" name="code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} required dir="ltr" autoComplete="one-time-code" /></div>
          <div className="field"><label htmlFor="newPassword">{t('كلمة المرور الجديدة', 'New password')}</label><input id="newPassword" name="newPassword" type="password" minLength={8} required dir="ltr" autoComplete="new-password" /></div>
          <input type="hidden" name="email" value={step.email} />
          <input type="hidden" name="flow" value="reset-verification" />
          {err}
          <button className="btn" type="submit" disabled={busy}>{busy ? t('جارٍ الحفظ…', 'Saving…') : t('حفظ ودخول', 'Save and sign in')}</button>
        </form>
      </>
    )
  }

  const isUp = step.kind === 'signUp'
  return (
    <>
      <div>
        <h1>{isUp ? t('إنشاء حساب', 'Create an account') : t('تسجيل الدخول', 'Sign in')}</h1>
        <p className="muted">{isUp ? t('سجّل بالبريد الذي تتواصل به مع فريق استوديو مكود لترى مشاريعك.', 'Register with the email you use with the Makwad Studio team to see your projects.') : t('اكتب بريدك وكلمة المرور، وبعدها نرسل لك رمز تحقق على البريد.', 'Enter your email and password, then we’ll email you a verification code.')}</p>
      </div>
      <form className="form" onSubmit={(e) => run(e, async (fd) => {
        const email = String(fd.get('email')).trim().toLowerCase()
        setPending('pw') // hold the dashboard until the email code is entered
        const r = await signIn('password', fd)
        if (!r.signingIn) { go({ kind: 'verify', email }); return } // new or unverified account: its email code is the second step
        await signOut()
        const otp = new FormData(); otp.set('email', email)
        await signIn('resend-otp', otp)
        setPending(email)
        go({ kind: 'codeSent', email })
      })}>
        {isUp && <div className="field"><label htmlFor="name">{t('الاسم', 'Name')}</label><input id="name" name="name" required autoComplete="name" /></div>}
        <div className="field"><label htmlFor="email">{t('البريد الإلكتروني', 'Email')}</label><input id="email" name="email" type="email" required dir="ltr" autoComplete="email" /></div>
        <div className="field">
          <label htmlFor="password">{t('كلمة المرور', 'Password')}</label>
          <input id="password" name="password" type="password" required minLength={8} dir="ltr" autoComplete={isUp ? 'new-password' : 'current-password'} />
          {isUp && <small className="muted">{t('8 أحرف على الأقل', 'At least 8 characters')}</small>}
        </div>
        <input type="hidden" name="flow" value={isUp ? 'signUp' : 'signIn'} />
        {err}
        <button className="btn" type="submit" disabled={busy}>{busy ? t('لحظة…', 'One moment…') : isUp ? t('إنشاء الحساب', 'Create account') : t('دخول', 'Sign in')}</button>
        {isUp && <small className="consent">{en ? <>By creating an account you agree to our <a href={L('/privacy')}>privacy policy</a> and <a href={L('/terms')}>terms</a>.</> : <>بإنشاء الحساب فإنك توافق على <a href={L('/privacy')}>سياسة الخصوصية</a> و<a href={L('/terms')}>الشروط والأحكام</a>.</>}</small>}
        {!isUp && <button className="linkish" type="button" onClick={() => go({ kind: 'forgot' })} style={{ justifySelf: 'start', fontSize: '.88rem' }}>{t('نسيت كلمة المرور؟', 'Forgot your password?')}</button>}
      </form>
      <p className="auth-switch">
        {isUp ? t('لديك حساب؟ ', 'Have an account? ') : t('ليس لديك حساب؟ ', 'No account yet? ')}
        <button className="linkish" type="button" onClick={() => go({ kind: isUp ? 'signIn' : 'signUp' })}>{isUp ? t('سجّل الدخول', 'Sign in') : t('أنشئ حساباً', 'Create one')}</button>
      </p>
    </>
  )
}
