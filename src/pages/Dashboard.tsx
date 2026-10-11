import { Link } from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { Logo } from '@/components/Logo'
import { useTitle } from '@/useTitle'

const STAGES = ['الاكتشاف', 'التصميم', 'البرمجة', 'الاختبار', 'الإطلاق']
type LeadStatus = Doc<'leads'>['status']
const STATUS: Record<LeadStatus, string> = {
  new: 'جديد',
  contacted: 'تم التواصل',
  won: 'تم الاتفاق',
  lost: 'لم يكتمل',
}

const fmtDate = (ms: number) =>
  new Intl.DateTimeFormat('ar-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' }).format(ms)
const fmtTime = (ms: number) =>
  new Intl.DateTimeFormat('ar-u-nu-latn', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(ms)
const fmtDue = (s?: string) => {
  if (!s) return 'غير محدد'
  const d = new Date(s + 'T00:00:00')
  return isNaN(d.getTime()) ? s : fmtDate(d.getTime())
}

export default function DashboardPage() {
  useTitle('لوحة التحكم | سطر')
  return (
    <>
      <AuthLoading><div className="center-screen">جارٍ التحميل…</div></AuthLoading>
      <Unauthenticated>
        <div className="center-screen">
          <div className="empty">
            <h3>سجّل الدخول للمتابعة</h3>
            <p>هذه الصفحة للعملاء وفريق الإدارة.</p>
            <Link className="btn" to="/login">تسجيل الدخول</Link>
          </div>
        </div>
      </Unauthenticated>
      <Authenticated><Dashboard /></Authenticated>
    </>
  )
}

function Dashboard() {
  const me = useQuery(api.app.me)
  const { signOut } = useAuthActions()
  if (me === undefined) return <div className="center-screen">جارٍ التحميل…</div>
  if (me.status !== 'ok') return <div className="center-screen"><Link className="btn" to="/login">تسجيل الدخول</Link></div>
  return (
    <div className="dash">
      <header className="dash-top">
        <div className="wrap">
          <Logo />
          <div className="who-chip">
            <span className="role-pill">{me.role === 'admin' ? 'الإدارة' : 'عميل'}</span>
            <div className="avatar">{me.name.charAt(0)}</div>
            <span><b>{me.name}</b><small className="mono">{me.email}</small></span>
            <button className="btn ghost small" type="button" onClick={() => void signOut()}>خروج</button>
          </div>
        </div>
      </header>
      <div className="wrap dash-body">
        {me.role === 'admin' ? <AdminView /> : <ClientView name={me.name} />}
      </div>
    </div>
  )
}

/* =================== ADMIN =================== */

function AdminView() {
  const leadsRes = useQuery(api.app.listLeads)
  const projRes = useQuery(api.app.listProjects)
  const clear = useMutation(api.app.clearExamples)
  const [tab, setTab] = useState<'leads' | 'projects'>('leads')

  if (leadsRes === undefined || projRes === undefined) return <p className="muted">جارٍ تحميل البيانات…</p>
  if (leadsRes.status !== 'ok' || projRes.status !== 'ok') return <p className="muted">لا تملك صلاحية الإدارة.</p>

  const leads = leadsRes.leads
  const projects = projRes.projects
  const newCount = leads.filter((l) => l.status === 'new').length
  const active = projects.filter((p) => p.stage < 4).length
  const hasExamples = leads.some((l) => l.isExample) || projects.some((p) => p.isExample)

  return (
    <>
      <div className="dash-head">
        <div><span className="kicker">لوحة الإدارة</span><h1>أهلاً بك في سطر</h1></div>
        {hasExamples && (
          <button className="btn ghost small" type="button" onClick={() => void clear({})}>حذف البيانات التجريبية</button>
        )}
      </div>
      <div className="kpis">
        <div className="kpi"><small>طلبات جديدة</small><b>{newCount}</b></div>
        <div className="kpi"><small>كل الطلبات</small><b>{leads.length}</b></div>
        <div className="kpi"><small>مشاريع نشطة</small><b>{active}</b></div>
        <div className="kpi"><small>مشاريع منجزة</small><b>{projects.length - active}</b></div>
      </div>
      <div className="tabs" role="tablist">
        <button role="tab" type="button" aria-selected={tab === 'leads'} onClick={() => setTab('leads')}>الطلبات <span className="count">{leads.length}</span></button>
        <button role="tab" type="button" aria-selected={tab === 'projects'} onClick={() => setTab('projects')}>المشاريع <span className="count">{projects.length}</span></button>
      </div>
      {tab === 'leads' ? <LeadsPanel leads={leads} /> : <ProjectsPanel projects={projects} />}
    </>
  )
}

function LeadsPanel({ leads }: { leads: Array<Doc<'leads'>> }) {
  const setStatus = useMutation(api.app.setLeadStatus)
  const del = useMutation(api.app.deleteLead)
  const [filter, setFilter] = useState<'all' | LeadStatus>('all')
  const [confirm, setConfirm] = useState<Id<'leads'> | null>(null)
  const shown = leads.filter((l) => filter === 'all' || l.status === filter)
  return (
    <div className="panel">
      <div className="panel-pad toolbar">
        <div className="filters" style={{ margin: 0 }}>
          {(['all', 'new', 'contacted', 'won', 'lost'] as const).map((k) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{k === 'all' ? 'الكل' : STATUS[k]}</button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <div className="empty"><h3>لا توجد طلبات هنا</h3><p>تصل الطلبات من نموذج التواصل في الموقع ومن حسابات العملاء.</p></div>
      ) : (
        <div className="lead-list">
          {shown.map((l) => (
            <div className="lead" key={l._id}>
              <div>
                <div className="lead-head">
                  <b>{l.name}</b>
                  <span className={`badge-s st-${l.status}`}>{STATUS[l.status]}</span>
                  <span className="src">{l.source === 'client' ? 'من بوابة العملاء' : 'من الموقع'}</span>
                  {l.isExample && <span className="ex">مثال</span>}
                </div>
                <div className="lead-meta">
                  <span className="mono">{l.email}</span>
                  {l.company && <span>{l.company}</span>}
                  <span>{l.types.join('، ')}</span>
                  <span>الباقة: {l.plan}</span>
                  <span>{fmtDate(l._creationTime)}</span>
                </div>
              </div>
              <div className="lead-actions">
                <select aria-label="حالة الطلب" value={l.status} onChange={(e) => void setStatus({ id: l._id, status: e.target.value as LeadStatus })}>
                  {(Object.keys(STATUS) as Array<LeadStatus>).map((k) => <option key={k} value={k}>{STATUS[k]}</option>)}
                </select>
                {confirm === l._id ? (
                  <>
                    <button className="btn danger small" type="button" onClick={() => { void del({ id: l._id }); setConfirm(null) }}>تأكيد الحذف</button>
                    <button className="btn ghost small" type="button" onClick={() => setConfirm(null)}>إلغاء</button>
                  </>
                ) : (
                  <button className="btn ghost small" type="button" onClick={() => setConfirm(l._id)}>حذف</button>
                )}
              </div>
              {l.message && <p className="lead-msg">{l.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectsPanel({ projects }: { projects: Array<Doc<'projects'>> }) {
  const [creating, setCreating] = useState(projects.length === 0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="toolbar">
        <p className="muted" style={{ fontSize: '.9rem' }}>يرى العميل المشروع عندما يسجّل ببريده المسجل في المشروع.</p>
        <button className="btn small" type="button" onClick={() => setCreating((c) => !c)}>{creating ? 'إغلاق' : '+ مشروع جديد'}</button>
      </div>
      {creating && <NewProject onDone={() => setCreating(false)} />}
      {projects.length === 0 ? (
        <div className="panel empty"><h3>لا توجد مشاريع بعد</h3><p>أنشئ أول مشروع واربطه ببريد العميل.</p></div>
      ) : (
        <div className="proj-grid">
          {projects.map((p) => <AdminProject key={p._id} p={p} />)}
        </div>
      )}
    </div>
  )
}

function NewProject({ onDone }: { onDone: () => void }) {
  const create = useMutation(api.app.createProject)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setBusy(true)
    setErr(null)
    const r = await create({
      title: String(fd.get('title') ?? ''),
      clientName: String(fd.get('clientName') ?? ''),
      clientEmail: String(fd.get('clientEmail') ?? ''),
      platform: String(fd.get('platform') ?? ''),
      dueDate: String(fd.get('dueDate') ?? ''),
    })
    setBusy(false)
    if (r.ok) onDone()
    else setErr(r.error)
  }
  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field"><label htmlFor="np-title">اسم المشروع</label><input id="np-title" name="title" required placeholder="مثال: تطبيق مخبز السنابل" /></div>
      <div className="field"><label htmlFor="np-platform">المنصة</label>
        <select id="np-platform" name="platform" defaultValue="iOS وأندرويد">
          <option>iOS وأندرويد</option><option>iOS</option><option>أندرويد</option><option>ويب</option><option>جوال وويب</option>
        </select>
      </div>
      <div className="field"><label htmlFor="np-client">اسم العميل</label><input id="np-client" name="clientName" required /></div>
      <div className="field"><label htmlFor="np-email">بريد العميل</label><input id="np-email" name="clientEmail" type="email" required dir="ltr" placeholder="client@company.sa" /></div>
      <div className="field"><label htmlFor="np-due">موعد التسليم المتوقع</label><input id="np-due" name="dueDate" type="date" dir="ltr" /></div>
      <div className="field" style={{ justifyContent: 'end' }}><button className="btn" type="submit" disabled={busy}>{busy ? 'جارٍ الإنشاء…' : 'إنشاء المشروع'}</button></div>
      {err && <div className="sent err">{err}</div>}
    </form>
  )
}

function AdminProject({ p }: { p: Doc<'projects'> }) {
  const update = useMutation(api.app.updateProject)
  const del = useMutation(api.app.deleteProject)
  const [progress, setProgress] = useState(p.progress)
  const [open, setOpen] = useState(false)
  const [editEmail, setEditEmail] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [email, setEmail] = useState(p.clientEmail)
  const [err, setErr] = useState<string | null>(null)

  return (
    <article className="proj">
      <div className="proj-head">
        <div>
          <h3>{p.title} {p.isExample && <span className="ex">مثال</span>}</h3>
          <small>{p.clientName} · {p.platform}</small>
        </div>
        <span className="role-pill">{STAGES[p.stage]}</span>
      </div>
      <div className="stages" role="group" aria-label="مرحلة المشروع">
        {STAGES.map((s, i) => (
          <button key={s} type="button" className={i < p.stage ? 'done' : i === p.stage ? 'cur' : ''} onClick={() => void update({ id: p._id, stage: i })} aria-pressed={i === p.stage}>{s}</button>
        ))}
      </div>
      <div className="progress">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          aria-label="نسبة الإنجاز"
          onChange={(e) => setProgress(Number(e.target.value))}
          onPointerUp={() => void update({ id: p._id, progress })}
          onKeyUp={() => void update({ id: p._id, progress })}
        />
        <b>{progress}%</b>
      </div>
      <div className="proj-facts">
        <span>التسليم: <b>{fmtDue(p.dueDate)}</b></span>
        {editEmail ? (
          <span style={{ display: 'flex', gap: 6, width: '100%' }}>
            <input className="input" style={{ padding: '4px 8px', fontSize: '.85rem' }} dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="بريد العميل" />
            <button className="btn small" type="button" onClick={async () => {
              const r = await update({ id: p._id, clientEmail: email })
              if (r.ok) { setEditEmail(false); setErr(null) } else setErr(r.error)
            }}>حفظ</button>
          </span>
        ) : (
          <span>البريد: <b className="mono">{p.clientEmail}</b> <button className="linkish" type="button" onClick={() => setEditEmail(true)}>تعديل</button></span>
        )}
      </div>
      {err && <div className="sent err">{err}</div>}
      <div className="toolbar">
        <button className="btn ghost small" type="button" onClick={() => setOpen((o) => !o)}>{open ? 'إخفاء التحديثات' : 'التحديثات والرسائل'}</button>
        {confirm ? (
          <span style={{ display: 'flex', gap: 6 }}>
            <button className="btn danger small" type="button" onClick={() => void del({ id: p._id })}>تأكيد حذف المشروع</button>
            <button className="btn ghost small" type="button" onClick={() => setConfirm(false)}>إلغاء</button>
          </span>
        ) : (
          <button className="linkish" style={{ color: 'var(--danger)', fontSize: '.85rem' }} type="button" onClick={() => setConfirm(true)}>حذف</button>
        )}
      </div>
      {open && <Feed projectId={p._id} placeholder="اكتب تحديثاً للعميل…" />}
    </article>
  )
}

/* =================== SHARED FEED =================== */

function Feed({ projectId, placeholder }: { projectId: Id<'projects'>; placeholder: string }) {
  const res = useQuery(api.app.listUpdates, { projectId })
  const add = useMutation(api.app.addUpdate)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <form className="composer" onSubmit={async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        setBusy(true)
        const r = await add({ projectId, text })
        setBusy(false)
        if (r.ok) setText('')
      }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label="رسالة جديدة" maxLength={1500} />
        <button className="btn small" type="submit" disabled={busy || !text.trim()}>إرسال</button>
      </form>
      {res === undefined ? (
        <p className="muted" style={{ fontSize: '.88rem' }}>جارٍ التحميل…</p>
      ) : res.status !== 'ok' ? (
        <p className="muted">لا تملك صلاحية على هذا المشروع.</p>
      ) : res.updates.length === 0 ? (
        <p className="muted" style={{ fontSize: '.88rem' }}>لا توجد تحديثات بعد.</p>
      ) : (
        <div className="feed">
          {res.updates.map((u) => (
            <div key={u._id} className={u.author === 'client' ? 'msg client' : 'msg'}>
              <header><b>{u.authorName}</b><span>{fmtTime(u._creationTime)}</span></header>
              {u.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* =================== CLIENT =================== */

function ClientView({ name }: { name: string }) {
  const res = useQuery(api.app.listProjects)
  if (res === undefined) return <p className="muted">جارٍ تحميل مشاريعك…</p>
  if (res.status !== 'ok') return <p className="muted">سجّل الدخول لعرض مشاريعك.</p>
  const projects = res.projects
  return (
    <>
      <div className="dash-head">
        <div><span className="kicker">بوابة العملاء</span><h1>أهلاً {name}</h1></div>
      </div>
      <div className="split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {projects.length === 0 ? (
            <div className="panel empty">
              <h3>لا توجد مشاريع مرتبطة بحسابك بعد</h3>
              <p>عندما يبدأ مشروعك معنا، يظهر هنا بمرحلته ونسبة إنجازه. إذا كان لديك مشروع قائم، تأكد أنك سجلت بنفس البريد الذي تتواصل به مع فريقنا.</p>
            </div>
          ) : (
            projects.map((p) => <ClientProject key={p._id} p={p} />)
          )}
        </div>
        <NewRequest />
      </div>
    </>
  )
}

function ClientProject({ p }: { p: Doc<'projects'> }) {
  return (
    <article className="proj">
      <div className="proj-head">
        <div><h3>{p.title}</h3><small>{p.platform}</small></div>
        <span className="role-pill">{STAGES[p.stage]}</span>
      </div>
      <div className="stages" aria-label="مرحلة المشروع">
        {STAGES.map((s, i) => (
          <span key={s} className={i < p.stage ? 'done' : i === p.stage ? 'cur' : ''}>{s}</span>
        ))}
      </div>
      <div className="progress">
        <div className="track" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label="نسبة الإنجاز"><i style={{ width: `${p.progress}%` }} /></div>
        <b>{p.progress}%</b>
      </div>
      <div className="proj-facts"><span>موعد التسليم المتوقع: <b>{fmtDue(p.dueDate)}</b></span></div>
      <Feed projectId={p._id} placeholder="اكتب ملاحظة أو سؤالاً لفريق سطر…" />
    </article>
  )
}

function NewRequest() {
  const send = useMutation(api.app.clientRequest)
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  return (
    <form className="form" style={{ gridTemplateColumns: '1fr' }} onSubmit={async (e) => {
      e.preventDefault()
      const form = e.currentTarget
      const fd = new FormData(form)
      setBusy(true)
      const r = await send({ subject: String(fd.get('subject') ?? ''), message: String(fd.get('message') ?? '') })
      setBusy(false)
      if (r.ok) { setState({ ok: true, text: 'وصل طلبك إلى فريق سطر وسنرد عليك قريباً.' }); form.reset() }
      else setState({ ok: false, text: r.error })
    }}>
      <div><h3 style={{ fontSize: '1.1rem' }}>طلب جديد</h3><p className="muted" style={{ fontSize: '.88rem' }}>ميزة إضافية، مشروع جديد، أو دعم فني.</p></div>
      <div className="field"><label htmlFor="rq-subject">نوع الطلب</label>
        <select id="rq-subject" name="subject" defaultValue="ميزة جديدة">
          <option>ميزة جديدة</option><option>مشروع جديد</option><option>دعم فني</option><option>استفسار عن الفاتورة</option>
        </select>
      </div>
      <div className="field"><label htmlFor="rq-message">التفاصيل</label><textarea id="rq-message" name="message" required placeholder="اشرح طلبك باختصار" /></div>
      <button className="btn" type="submit" disabled={busy}>{busy ? 'جارٍ الإرسال…' : 'إرسال الطلب'}</button>
      {state && <div className={state.ok ? 'sent' : 'sent err'} role="status">{state.text}</div>}
    </form>
  )
}
