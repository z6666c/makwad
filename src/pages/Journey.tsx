// Project tracking board: accepted quotes waiting to start, then one column per stage.
// Moving a project to a stage tells the client by email and in the portal, using the stage notices.
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { fmtSAR } from '@/estimate'
import { quoteTotals } from '@/pages/AdminExtras'
import type { Quote } from '@/pages/AdminExtras'

type Project = Doc<'projects'>
type Notice = { stage: number; subject: string; body: string; need: string; toClient: boolean; toPortal: boolean; toTeam: boolean; withPayment: boolean }

export const STAGES = ['الاكتشاف', 'التصميم', 'البرمجة', 'الاختبار', 'الإطلاق']
const HINTS = ['نجمع المتطلبات والمحتوى من العميل.', 'الواجهات والنموذج التفاعلي للمراجعة.', 'البناء مع نسخ تجريبية للعميل.', 'العميل يجرّب ويرسل ملاحظاته.', 'النشر والتسليم والدفعة الأخيرة.']
// Suggested progress when a project enters each stage.
const PROGRESS = [10, 30, 50, 85, 100]
const PAYMENT_AT_STAGE: Record<number, number> = { 0: 0, 2: 1, 4: 2 }
const DAY = 86400000

const fmtDay = (ms: number) => new Intl.DateTimeFormat('ar-u-nu-latn', { day: 'numeric', month: 'long' }).format(ms)
const fmtDue = (s?: string) => {
  if (!s) return 'غير محدد'
  const d = new Date(s + 'T00:00:00')
  return isNaN(d.getTime()) ? s : fmtDay(d.getTime())
}
const todayIso = () => new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10)

function paymentLine(p: Pick<Project, 'payments'>, stage: number) {
  const i = PAYMENT_AT_STAGE[stage]
  const pay = i === undefined ? undefined : p.payments?.[i]
  if (!pay || pay.status === 'paid') return ''
  return `${pay.title}: ${fmtSAR(pay.amount)} ريال`
}

function fill(text: string, p: { clientName: string; title: string; dueDate?: string; payments?: Project['payments'] }, stage: number) {
  return text
    .replaceAll('{العميل}', p.clientName)
    .replaceAll('{المشروع}', p.title)
    .replaceAll('{التسليم}', fmtDue(p.dueDate))
    .replaceAll('{الدفعة المستحقة}', paymentLine(p, stage) || 'لا توجد دفعة مستحقة')
}

function useNotices(): Array<Notice> | undefined {
  const r = useQuery(api.journey.notices) as { status: 'ok'; notices: Array<Notice> } | { status: 'forbidden' } | undefined
  return r?.status === 'ok' ? r.notices : undefined
}

/* =================== BOARD =================== */

export function JourneyBoard({ projects, quotes, canAdmin, openNotices }: { projects: Array<Project>; quotes: Array<Quote>; canAdmin: boolean; openNotices: () => void }) {
  const notices = useNotices()
  const [moving, setMoving] = useState<{ p: Project; to: number } | null>(null)
  const [starting, setStarting] = useState<Quote | null>(null)
  const [toast, setToast] = useState('')
  const waiting = quotes.filter((q) => q.status === 'accepted' && !q.projectId)
  const today = todayIso()
  const isLate = (p: Project) => !!p.dueDate && p.dueDate < today && p.stage < 4 && p.progress < 100
  const dueOf = (p: Project) => p.payments?.find((x) => x.status === 'due')
  const active = projects.filter((p) => p.stage < 4 || p.progress < 100)

  return (
    <div className="jb">
      <div className="jb-top">
        <p className="muted">كل عرض سعر مقبول يظهر هنا. انقل المشروع للمرحلة التالية، ويوصل العميل إيميل وتنبيه في بوابته حسب <button className="linkish" type="button" onClick={openNotices} disabled={!canAdmin}>تنبيهات المراحل</button>.</p>
        <div className="jb-stats">
          <span>بانتظار البدء <b className="mono">{waiting.length}</b></span>
          <span>مشاريع نشطة <b className="mono">{active.filter((p) => p.stage < 4).length}</b></span>
          <span>متأخرة عن موعدها <b className="mono late">{projects.filter(isLate).length}</b></span>
          <span>دفعات مستحقة <b className="mono">{projects.filter((p) => dueOf(p)).length}</b></span>
        </div>
      </div>
      {toast && <div className="sent" role="status">{toast}</div>}

      <div className="jb-scroll">
        <div className="jb-cols">
          <section className="jb-col" aria-label="بانتظار البدء">
            <header><span className="jb-num wait">—</span><b>بانتظار البدء</b><span className="mono jb-count">{waiting.length}</span></header>
            <small className="jb-hint">عرض مقبول لم يبدأ بعد. ابدأه بعد استلام الدفعة الأولى.</small>
            {waiting.map((q) => (
              <article className="jb-card" key={q._id}>
                <div><b>{q.title}</b><small>{q.clientName} · <span className="mono">{q.number}</span></small></div>
                <div className="jb-chips"><span>الإجمالي {fmtSAR(quoteTotals(q).total)} ريال</span><span>قُبل {fmtDay(q._creationTime)}</span></div>
                <button className="btn ghost small" type="button" onClick={() => setStarting(q)}>ابدأ المشروع ← الاكتشاف</button>
              </article>
            ))}
            {waiting.length === 0 && <small className="jb-empty">لا توجد عروض مقبولة بانتظار البدء.</small>}
          </section>

          {STAGES.map((name, s) => {
            const list = projects.filter((p) => p.stage === s)
            return (
              <section className="jb-col" key={name} aria-label={name}>
                <header><span className="jb-num mono">{s + 1}</span><b>{name}</b><span className="mono jb-count">{list.length}</span></header>
                <small className="jb-hint">{HINTS[s]}</small>
                {list.map((p) => {
                  const days = p.stageAt ? Math.max(0, Math.floor((Date.now() - p.stageAt) / DAY)) : null
                  const due = dueOf(p)
                  return (
                    <article className="jb-card" key={p._id}>
                      <div><b>{p.title} {p.isExample && <span className="ex">مثال</span>}</b><small>{p.clientName} · {p.platform}</small></div>
                      <div className="jb-prog">
                        <span><span>الإنجاز</span><b className="mono">{p.progress}%</b></span>
                        <i aria-hidden="true"><i style={{ width: `${p.progress}%` }} className={p.progress >= 100 ? 'full' : ''} /></i>
                      </div>
                      <div className="jb-chips">
                        <span>{days === null ? 'بدأت المرحلة قبل التحديث' : days === 0 ? 'دخل المرحلة اليوم' : days === 1 ? 'في المرحلة منذ يوم' : `في المرحلة منذ ${days} أيام`}</span>
                        <span className={isLate(p) ? 'late' : ''}>التسليم {fmtDue(p.dueDate)}</span>
                        {due && <span className="pay">مستحقة {fmtSAR(due.amount)} ريال</span>}
                      </div>
                      <small className="jb-mail">
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                        {p.lastNotice ? `${p.lastNotice.emailed ? 'أُرسل إيميل' : 'بدون إيميل'}: ${STAGES[p.lastNotice.stage]} · ${fmtDay(p.lastNotice.at)}` : 'لم يُرسل تنبيه من اللوحة بعد'}
                      </small>
                      <div className="jb-actions">
                        {s < 4
                          ? <button className="btn ghost small" type="button" onClick={() => setMoving({ p, to: s + 1 })}>انقل إلى {STAGES[s + 1]} ←</button>
                          : <span className="jb-done">{p.progress >= 100 ? 'تم الإطلاق والتسليم' : 'في مرحلة الإطلاق'}</span>}
                        {s > 0 && <button className="linkish" type="button" onClick={() => setMoving({ p, to: s - 1 })}>إرجاع</button>}
                      </div>
                    </article>
                  )
                })}
                {list.length === 0 && <small className="jb-empty">لا توجد مشاريع هنا.</small>}
              </section>
            )
          })}
        </div>
      </div>

      {moving && <MoveDialog p={moving.p} to={moving.to} notice={notices?.find((n) => n.stage === moving.to)} onClose={() => setMoving(null)} onDone={(t) => { setMoving(null); setToast(t) }} />}
      {starting && <StartDialog q={starting} notice={notices?.find((n) => n.stage === 0)} onClose={() => setStarting(null)} onDone={(t) => { setStarting(null); setToast(t) }} />}
    </div>
  )
}

function Preview({ n, target, stage }: { n?: Notice; target: { clientName: string; title: string; dueDate?: string; payments?: Project['payments'] }; stage: number }) {
  if (!n) return <p className="muted">جارٍ تحميل نص التنبيه…</p>
  const pay = n.withPayment ? paymentLine(target, stage) : ''
  return (
    <div className="jb-preview">
      <div className="jb-subj"><small>الموضوع</small><b>{fill(n.subject, target, stage)}</b></div>
      <div className="jb-body">
        <span>أهلاً {target.clientName}،</span>
        <span>{fill(n.body, target, stage)}</span>
        {n.need && <div className="jb-need"><b>المطلوب منك</b><span>{fill(n.need, target, stage)}</span></div>}
        {pay && <span className="muted">الدفعة المستحقة الآن: {pay}</span>}
      </div>
    </div>
  )
}

function Recipients({ n, mail, setMail, email }: { n?: Notice; mail: boolean; setMail: (b: boolean) => void; email: string }) {
  return (
    <div className="jb-recip">
      <b>التنبيهات</b>
      <label className="chk"><input type="checkbox" checked={mail && !!n?.toClient} disabled={!n?.toClient} onChange={(e) => setMail(e.target.checked)} /><span>إيميل للعميل<small className="mono">{email}</small>{n && !n.toClient && <small>متوقف لهذه المرحلة من الإعدادات</small>}</span></label>
      <label className="chk"><input type="checkbox" checked={!!n?.toPortal} disabled readOnly /><span>تنبيه في بوابة العميل<small>{n?.toPortal ? 'يظهر في تحديثات المشروع' : 'متوقف من الإعدادات'}</small></span></label>
      <label className="chk"><input type="checkbox" checked={!!n?.toTeam} disabled readOnly /><span>نسخة لإيميل الاستوديو<small>{n?.toTeam ? 'تصلك نسخة بالنقل' : 'متوقف من الإعدادات'}</small></span></label>
    </div>
  )
}

function MoveDialog({ p, to, notice, onClose, onDone }: { p: Project; to: number; notice?: Notice; onClose: () => void; onDone: (t: string) => void }) {
  const move = useMutation(api.journey.move)
  const back = to < p.stage
  const [mail, setMail] = useState(!back)
  const [progress, setProgress] = useState(back ? p.progress : Math.max(p.progress, PROGRESS[to]))
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const go = async () => {
    setBusy(true); setErr('')
    const r = await move({ id: p._id as Id<'projects'>, stage: to, progress, notify: mail })
    setBusy(false)
    if (r.ok) onDone(`انتقل «${p.title}» إلى ${STAGES[to]}${r.emailed ? '، وأُرسل إيميل للعميل.' : '، بدون إيميل للعميل.'}`)
    else setErr(r.error)
  }
  return (
    <div className="print-overlay" role="dialog" aria-modal="true" aria-label={`نقل ${p.title}`}>
      <div className="jb-dialog">
        <header>
          <div><b>نقل «{p.title}»</b><small>من <b>{STAGES[p.stage]}</b> إلى <b className="to">{STAGES[to]}</b></small></div>
          <button className="btn ghost small" type="button" onClick={onClose} aria-label="إغلاق">إغلاق</button>
        </header>
        <div className="jb-dialog-body">
          <div className="jb-side">
            <Recipients n={notice} mail={mail} setMail={setMail} email={p.clientEmail} />
            <label className="field"><span className="lbl">نسبة الإنجاز الجديدة</span><input className="input" type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} /></label>
          </div>
          <div className="jb-main"><b>معاينة الإيميل</b><Preview n={notice} target={p} stage={to} /></div>
        </div>
        {err && <div className="sent err">{err}</div>}
        <footer>
          <button className="btn" type="button" disabled={busy || !notice} onClick={() => void go()}>{busy ? 'جارٍ النقل…' : mail && notice?.toClient ? 'انقل وأرسل الإيميل' : 'انقل بدون إيميل'}</button>
          <button className="btn ghost" type="button" onClick={onClose}>إلغاء</button>
        </footer>
      </div>
    </div>
  )
}

function StartDialog({ q, notice, onClose, onDone }: { q: Quote; notice?: Notice; onClose: () => void; onDone: (t: string) => void }) {
  const start = useMutation(api.quotes.toProject)
  const [platform, setPlatform] = useState('ويب')
  const [due, setDue] = useState('')
  const [mail, setMail] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const total = quoteTotals(q).total
  const first = Math.round(total * 0.4)
  const target = { clientName: q.clientName, title: q.title, dueDate: due || undefined, payments: [{ title: 'دفعة أولى عند البدء (40%)', amount: first, status: 'due' as const }] }
  const go = async () => {
    setBusy(true); setErr('')
    const r = await start({ id: q._id, platform, notify: mail, ...(due ? { dueDate: due } : {}) })
    setBusy(false)
    if (r.ok) onDone(`بدأ مشروع «${q.title}» في مرحلة الاكتشاف${mail && notice?.toClient ? '، وأُرسل إيميل للعميل.' : '.'}`)
    else setErr(r.error)
  }
  return (
    <div className="print-overlay" role="dialog" aria-modal="true" aria-label={`بدء ${q.title}`}>
      <div className="jb-dialog">
        <header>
          <div><b>بدء «{q.title}»</b><small>عرض <span className="mono">{q.number}</span> · {q.clientName} · ينشأ المشروع بخطة دفع 40/30/30</small></div>
          <button className="btn ghost small" type="button" onClick={onClose} aria-label="إغلاق">إغلاق</button>
        </header>
        <div className="jb-dialog-body">
          <div className="jb-side">
            <label className="field"><span className="lbl">المنصة</span>
              <select className="input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {['ويب', 'iOS وأندرويد', 'iOS', 'أندرويد', 'هوية', 'نظام إدارة', 'متجر إلكتروني'].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="field"><span className="lbl">موعد التسليم المتوقع</span><input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
            <Recipients n={notice} mail={mail} setMail={setMail} email={q.clientEmail} />
          </div>
          <div className="jb-main"><b>معاينة إيميل الاكتشاف</b><Preview n={notice} target={target} stage={0} /></div>
        </div>
        {err && <div className="sent err">{err}</div>}
        <footer>
          <button className="btn" type="button" disabled={busy || !notice} onClick={() => void go()}>{busy ? 'جارٍ البدء…' : 'ابدأ المشروع'}</button>
          <button className="btn ghost" type="button" onClick={onClose}>إلغاء</button>
        </footer>
      </div>
    </div>
  )
}

/* =================== STAGE NOTICES =================== */

export function NoticesPanel() {
  const notices = useNotices()
  const [stage, setStage] = useState(1)
  if (!notices) return <p className="muted">جارٍ التحميل…</p>
  const n = notices.find((x) => x.stage === stage)!
  return (
    <div className="jb-notices">
      <nav className="panel jb-stage-list" aria-label="المراحل">
        {notices.map((x) => (
          <button key={x.stage} type="button" className={x.stage === stage ? 'cur' : ''} aria-pressed={x.stage === stage} onClick={() => setStage(x.stage)}>
            <span><span className="mono">{x.stage + 1}</span> {STAGES[x.stage]}</span>
            <small>{[x.toClient && 'إيميل', x.toPortal && 'بوابة', x.toTeam && 'نسخة للاستوديو'].filter(Boolean).join(' + ') || 'بدون تنبيه'}</small>
          </button>
        ))}
      </nav>
      <NoticeForm key={stage} n={n} />
    </div>
  )
}

function NoticeForm({ n }: { n: Notice }) {
  const save = useMutation(api.journey.saveNotice)
  const test = useMutation(api.journey.sendTest)
  const [d, setD] = useState(n)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const set = <K extends keyof Notice>(k: K, v: Notice[K]) => setD((x) => ({ ...x, [k]: v }))
  const sample = { clientName: 'عميل تجريبي', title: 'مشروع تجريبي', dueDate: undefined, payments: [] }
  return (
    <section className="panel jb-form">
      <div className="jb-form-head"><h3>المرحلة {n.stage + 1} · {STAGES[n.stage]}</h3><small className="muted">التعديل هنا يطبق على كل المشاريع.</small></div>
      <fieldset className="jb-toggles">
        <legend>عند الوصول لهذه المرحلة</legend>
        <label className="chk"><input type="checkbox" checked={d.toClient} onChange={(e) => set('toClient', e.target.checked)} />إيميل للعميل</label>
        <label className="chk"><input type="checkbox" checked={d.toPortal} onChange={(e) => set('toPortal', e.target.checked)} />تنبيه في بوابة العميل</label>
        <label className="chk"><input type="checkbox" checked={d.toTeam} onChange={(e) => set('toTeam', e.target.checked)} />نسخة لإيميل الاستوديو</label>
        <label className="chk"><input type="checkbox" checked={d.withPayment} onChange={(e) => set('withPayment', e.target.checked)} />أضف الدفعة المستحقة في هذه المرحلة</label>
      </fieldset>
      <label className="field"><span className="lbl">عنوان الإيميل</span><input className="input" value={d.subject} onChange={(e) => set('subject', e.target.value)} /></label>
      <label className="field"><span className="lbl">نص الرسالة</span><textarea className="input" rows={3} value={d.body} onChange={(e) => set('body', e.target.value)} /></label>
      <label className="field"><span className="lbl">المطلوب من العميل</span><textarea className="input" rows={2} value={d.need} onChange={(e) => set('need', e.target.value)} /></label>
      <div className="jb-vars"><span className="muted">متغيرات:</span>{['{العميل}', '{المشروع}', '{التسليم}', '{الدفعة المستحقة}'].map((x) => <code key={x}>{x}</code>)}</div>
      <div className="jb-main"><b>المعاينة</b><Preview n={d} target={sample} stage={d.stage} /></div>
      {msg && <div className={msg.ok ? 'sent' : 'sent err'} role="status">{msg.text}</div>}
      <div className="toolbar">
        <button className="btn" type="button" onClick={async () => { const r = await save(d); setMsg(r.ok ? { ok: true, text: 'حُفظ نص المرحلة.' } : { ok: false, text: r.error }) }}>حفظ</button>
        <button className="btn ghost" type="button" onClick={async () => { const r = await test({ stage: d.stage }); setMsg(r.ok ? { ok: true, text: `أُرسلت نسخة تجربة (بالنص المحفوظ) إلى ${r.to}.` } : { ok: false, text: r.error }) }}>أرسل تجربة لإيميلي</button>
      </div>
    </section>
  )
}

/* =================== CLIENT PORTAL =================== */

export function ClientNeed({ projectId }: { projectId: Id<'projects'> }) {
  const r = useQuery(api.journey.clientNeed, { projectId }) as { need: string; payment: string; since: number | null } | null | undefined
  if (!r || (!r.need && !r.payment)) return null
  return (
    <div className="jb-client-need">
      <b>المطلوب منك في هذه المرحلة</b>
      {r.need && <span>{r.need}</span>}
      {r.payment && <span className="muted">الدفعة المستحقة: {r.payment}</span>}
    </div>
  )
}
