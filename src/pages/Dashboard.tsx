import { Link } from '@tanstack/react-router'
import { useAuthActions } from '@convex-dev/auth/react'
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from 'convex/react'
import { createContext, useContext, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { Logo } from '@/components/Logo'
import { useTitle } from '@/useTitle'
import { DEFAULT_SETTINGS, whatsappLink } from '@/site-config'
import type { SiteSettings } from '@/site-config'
import { WorkCard } from '@/pages/Home'
import { ARTS, COLORS } from '@/mockups'

const CanAdmin = createContext(false)
const ROLE_LABEL: Record<string, string> = { owner: 'المالك', admin: 'مدير', staff: 'موظف', client: 'عميل', blocked: 'موقوف' }

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
  useTitle('لوحة التحكم | استوديو مكود')
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
  if (me.status === 'blocked') {
    return (
      <div className="center-screen">
        <div className="empty">
          <h3>تم إيقاف حسابك</h3>
          <p>تواصل مع إدارة استوديو مكود لإعادة تفعيل الحساب.</p>
          <button className="btn ghost" type="button" onClick={() => void signOut()}>تسجيل الخروج</button>
        </div>
      </div>
    )
  }
  if (me.status !== 'ok') return <div className="center-screen"><Link className="btn" to="/login">تسجيل الدخول</Link></div>
  const team = me.role === 'admin' || me.role === 'staff'
  const roleLabel = me.isOwner ? ROLE_LABEL.owner : ROLE_LABEL[me.role]
  return (
    <div className="dash">
      <header className="dash-top">
        <div className="wrap">
          <Logo />
          <div className="who-chip">
            <span className="role-pill">{roleLabel}</span>
            <div className="avatar">{me.name.charAt(0)}</div>
            <span><b>{me.name}</b><small className="mono">{me.email}</small></span>
            <button className="btn ghost small" type="button" onClick={() => void signOut()}>خروج</button>
          </div>
        </div>
      </header>
      <div className="wrap dash-body">
        {team ? (
          <CanAdmin.Provider value={me.role === 'admin'}><AdminView /></CanAdmin.Provider>
        ) : (
          <ClientView name={me.name} />
        )}
      </div>
    </div>
  )
}

/* =================== ADMIN =================== */

function AdminView() {
  const leadsRes = useQuery(api.app.listLeads)
  const projRes = useQuery(api.app.listProjects)
  const clear = useMutation(api.app.clearExamples)
  const canAdmin = useContext(CanAdmin)
  const [tab, setTab] = useState<'leads' | 'projects' | 'content' | 'users' | 'settings'>('leads')

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
        <div><span className="kicker">{canAdmin ? 'لوحة الإدارة' : 'لوحة الفريق'}</span><h1>أهلاً بك في استوديو مكود</h1></div>
        {hasExamples && canAdmin && (
          <button className="btn ghost small" type="button" onClick={() => void clear({})}>حذف البيانات التجريبية</button>
        )}
      </div>
      <div className="kpis">
        <div className="kpi"><small>طلبات جديدة</small><b>{newCount}</b></div>
        <div className="kpi"><small>كل الطلبات</small><b>{leads.length}</b></div>
        <div className="kpi"><small>مشاريع نشطة</small><b>{active}</b></div>
        <div className="kpi"><small>نسبة التحويل</small><b>{leads.length ? Math.round((leads.filter((l) => l.status === 'won').length / leads.length) * 100) : 0}%</b></div>
      </div>
      <LeadsChart leads={leads} />
      <div className="tabs" role="tablist">
        <button role="tab" type="button" aria-selected={tab === 'leads'} onClick={() => setTab('leads')}>الطلبات <span className="count">{leads.length}</span></button>
        <button role="tab" type="button" aria-selected={tab === 'projects'} onClick={() => setTab('projects')}>المشاريع <span className="count">{projects.length}</span></button>
        {canAdmin && <button role="tab" type="button" aria-selected={tab === 'content'} onClick={() => setTab('content')}>محتوى الموقع</button>}
        {canAdmin && <button role="tab" type="button" aria-selected={tab === 'users'} onClick={() => setTab('users')}>المستخدمون والموظفون</button>}
        {canAdmin && <button role="tab" type="button" aria-selected={tab === 'settings'} onClick={() => setTab('settings')}>الإعدادات</button>}
      </div>
      {tab === 'leads' && <LeadsPanel leads={leads} />}
      {tab === 'projects' && <ProjectsPanel projects={projects} />}
      {tab === 'content' && canAdmin && <ContentPanel />}
      {tab === 'users' && canAdmin && <UsersPanel />}
      {tab === 'settings' && canAdmin && <SettingsPanel />}
    </>
  )
}

function downloadCsv(leads: Array<Doc<'leads'>>) {
  const head = ['التاريخ', 'الاسم', 'الشركة', 'البريد', 'النوع', 'الباقة', 'الحالة', 'المصدر', 'الرسالة', 'ملاحظات']
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
  const rows = leads.map((l) => [
    new Date(l._creationTime).toISOString().slice(0, 10), l.name, l.company ?? '', l.email, l.types.join(' / '),
    l.plan, STATUS[l.status], l.source === 'client' ? 'بوابة العملاء' : 'الموقع', l.message, l.notes ?? '',
  ].map(esc).join(','))
  const blob = new Blob(['\ufeff' + [head.map(esc).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `makwad-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function LeadsChart({ leads }: { leads: Array<Doc<'leads'>> }) {
  const WEEKS = 8
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime()
  const week = 7 * 86400000
  const buckets = Array.from({ length: WEEKS }, (_, k) => {
    const from = start - (WEEKS - 1 - k) * week
    const items = leads.filter((l) => l._creationTime >= from && l._creationTime < from + week)
    return { from, total: items.length, won: items.filter((l) => l.status === 'won').length }
  })
  const max = Math.max(1, ...buckets.map((b) => b.total))
  const fmt = (ms: number) => new Intl.DateTimeFormat('ar-u-nu-latn', { day: 'numeric', month: 'short' }).format(ms)
  return (
    <div className="panel chart-card">
      <div className="chart-head">
        <div><b>الطلبات الأسبوعية</b><small className="muted">آخر 8 أسابيع</small></div>
        <div className="legend"><span><i className="sw total" />كل الطلبات</span><span><i className="sw won" />تم الاتفاق</span></div>
      </div>
      <div className="bars" role="img" aria-label={`الطلبات في آخر 8 أسابيع: ${buckets.map((b) => b.total).join('، ')}`}>
        {buckets.map((b, k) => (
          <div className="bar-col" key={b.from}>
            <span className="bar-val">{b.total || ''}</span>
            <div className="bar-track">
              <div className="bar total" style={{ height: `${(b.total / max) * 100}%` }}>
                <div className="bar won" style={{ height: b.total ? `${(b.won / b.total) * 100}%` : 0 }} />
              </div>
            </div>
            <span className={k === WEEKS - 1 ? 'bar-lbl now' : 'bar-lbl'}>{k === WEEKS - 1 ? 'هذا الأسبوع' : fmt(b.from)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LeadsPanel({ leads }: { leads: Array<Doc<'leads'>> }) {
  const [filter, setFilter] = useState<'all' | LeadStatus>('all')
  const [q, setQ] = useState('')
  const t = q.trim().toLowerCase()
  const shown = leads.filter((l) => (filter === 'all' || l.status === filter) &&
    (!t || [l.name, l.email, l.company ?? '', l.message, l.notes ?? ''].some((x) => x.toLowerCase().includes(t))))
  return (
    <div className="panel">
      <div className="panel-pad toolbar">
        <div className="filters" style={{ margin: 0 }}>
          {(['all', 'new', 'contacted', 'won', 'lost'] as const).map((k) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {k === 'all' ? 'الكل' : STATUS[k]} <span className="count">{k === 'all' ? leads.length : leads.filter((l) => l.status === k).length}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input search" placeholder="بحث في الطلبات" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث في الطلبات" />
          <button className="btn ghost small" type="button" onClick={() => downloadCsv(shown)} disabled={shown.length === 0}>تصدير Excel (CSV)</button>
        </div>
      </div>
      {shown.length === 0 ? (
        <div className="empty"><h3>لا توجد طلبات هنا</h3><p>تصل الطلبات من نموذج التواصل وحاسبة التكلفة في الموقع ومن حسابات العملاء.</p></div>
      ) : (
        <div className="lead-list">
          {shown.map((l) => <LeadRow key={l._id} l={l} />)}
        </div>
      )}
    </div>
  )
}

function LeadRow({ l }: { l: Doc<'leads'> }) {
  const setStatus = useMutation(api.app.setLeadStatus)
  const del = useMutation(api.app.deleteLead)
  const saveNotes = useMutation(api.app.setLeadNotes)
  const create = useMutation(api.app.createProject)
  const canAdmin = useContext(CanAdmin)
  const [confirm, setConfirm] = useState(false)
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(l.notes ?? '')
  const [saved, setSaved] = useState(false)
  const [converting, setConverting] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  return (
    <div className="lead">
      <div>
        <div className="lead-head">
          <b>{l.name}</b>
          <span className={`badge-s st-${l.status}`}>{STATUS[l.status]}</span>
          <span className="src">{l.source === 'client' ? 'من بوابة العملاء' : 'من الموقع'}</span>
          {l.projectId && <span className="src ok">تحوّل إلى مشروع</span>}
          {l.notes && <span className="src">فيه ملاحظات</span>}
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
        <button className="btn ghost small" type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'إغلاق' : 'التفاصيل'}</button>
      </div>
      {l.message && <p className="lead-msg">{l.message}</p>}
      {open && (
        <div className="lead-more">
          <div className="field">
            <label htmlFor={`notes-${l._id}`}>ملاحظات داخلية (لا يراها العميل)</label>
            <textarea id={`notes-${l._id}`} className="input" rows={3} value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false) }} placeholder="مثال: اتصلت به يوم الأحد، يحتاج عرضاً قبل نهاية الشهر" />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn small" type="button" disabled={notes === (l.notes ?? '')} onClick={async () => { await saveNotes({ id: l._id, notes }); setSaved(true) }}>حفظ الملاحظات</button>
              {saved && <small className="ok-note">تم الحفظ</small>}
            </div>
          </div>
          <div className="lead-more-actions">
            {!l.projectId && (
              <button className="btn small" type="button" disabled={converting} onClick={async () => {
                setConverting(true)
                setErr(null)
                const platform = l.types.includes('تطبيق ويب') && l.types.includes('تطبيق جوال') ? 'جوال وويب' : l.types.includes('تطبيق ويب') ? 'ويب' : 'iOS وأندرويد'
                const r = await create({
                  title: `مشروع ${l.company || l.name}`, clientName: l.name, clientEmail: l.email, platform,
                  leadId: l._id, notifyClient: true,
                })
                setConverting(false)
                if (!r.ok) setErr(r.error)
              }}>{converting ? 'جارٍ التحويل…' : 'تحويل إلى مشروع ودعوة العميل'}</button>
            )}
            <a className="btn ghost small" href={`mailto:${l.email}?subject=${encodeURIComponent('بخصوص طلبك لدى استوديو مكود')}`}>مراسلة بالبريد</a>
            {canAdmin && (confirm ? (
              <>
                <button className="btn danger small" type="button" onClick={() => void del({ id: l._id })}>تأكيد الحذف</button>
                <button className="btn ghost small" type="button" onClick={() => setConfirm(false)}>إلغاء</button>
              </>
            ) : (
              <button className="linkish" style={{ color: 'var(--danger)' }} type="button" onClick={() => setConfirm(true)}>حذف الطلب</button>
            ))}
          </div>
          {err && <div className="sent err">{err}</div>}
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
      notifyClient: fd.get('notify') === 'on',
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
      <label className="field full check-line"><input type="checkbox" name="notify" defaultChecked /> أرسل للعميل بريداً بدعوته إلى بوابة العملاء</label>
      {err && <div className="sent err">{err}</div>}
    </form>
  )
}

function AdminProject({ p }: { p: Doc<'projects'> }) {
  const update = useMutation(api.app.updateProject)
  const del = useMutation(api.app.deleteProject)
  const [progress, setProgress] = useState(p.progress)
  const [open, setOpen] = useState(false)
  const [extras, setExtras] = useState(false)
  const [editEmail, setEditEmail] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [email, setEmail] = useState(p.clientEmail)
  const [err, setErr] = useState<string | null>(null)
  const canAdmin = useContext(CanAdmin)

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
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="btn ghost small" type="button" onClick={() => setOpen((o) => !o)}>{open ? 'إخفاء التحديثات' : 'التحديثات والرسائل'}</button>
          <button className="btn ghost small" type="button" onClick={() => setExtras((o) => !o)}>{extras ? 'إغلاق' : 'الروابط والدفعات'}</button>
        </span>
        {!canAdmin ? null : confirm ? (
          <span style={{ display: 'flex', gap: 6 }}>
            <button className="btn danger small" type="button" onClick={() => void del({ id: p._id })}>تأكيد حذف المشروع</button>
            <button className="btn ghost small" type="button" onClick={() => setConfirm(false)}>إلغاء</button>
          </span>
        ) : (
          <button className="linkish" style={{ color: 'var(--danger)', fontSize: '.85rem' }} type="button" onClick={() => setConfirm(true)}>حذف</button>
        )}
      </div>
      <PaymentsSummary payments={p.payments} />
      {extras && <ProjectExtras p={p} />}
      {open && <Feed projectId={p._id} placeholder="اكتب تحديثاً للعميل… (يصله إشعار بالبريد)" />}
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
      {p.links && p.links.length > 0 && (
        <div className="proj-links">
          {p.links.map((l) => <a key={l.url + l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
        </div>
      )}
      <PaymentsSummary payments={p.payments} detailed />
      <Feed projectId={p._id} placeholder="اكتب ملاحظة أو سؤالاً لفريق استوديو مكود…" />
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
      if (r.ok) { setState({ ok: true, text: 'وصل طلبك إلى فريق استوديو مكود وسنرد عليك قريباً.' }); form.reset() }
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

/* =================== USERS & STAFF (admins) =================== */

type UserRow = {
  key: string
  userId: string | null
  email: string
  name: string
  role: 'owner' | 'admin' | 'staff' | 'client' | 'blocked'
  joined: number | null
  pending: boolean
}

function UsersPanel() {
  const res = useQuery(api.users.listUsers) as { status: 'ok'; rows: Array<UserRow>; me: string } | { status: 'forbidden' } | undefined
  const [filter, setFilter] = useState<'all' | 'team' | 'client' | 'blocked'>('all')
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  if (res === undefined) return <p className="muted">جارٍ تحميل المستخدمين…</p>
  if (res.status !== 'ok') return <p className="muted">إدارة المستخدمين للمدراء فقط.</p>
  const rows = res.rows.filter((r) => {
    if (filter === 'team' && !['owner', 'admin', 'staff'].includes(r.role)) return false
    if (filter === 'client' && r.role !== 'client') return false
    if (filter === 'blocked' && r.role !== 'blocked') return false
    const t = q.trim().toLowerCase()
    return !t || r.email.includes(t) || r.name.toLowerCase().includes(t)
  })
  const teamCount = res.rows.filter((r) => ['owner', 'admin', 'staff'].includes(r.role)).length
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="roles-guide">
        <div><b>مدير</b><span>كل الصلاحيات: الطلبات والمشاريع والمستخدمين والإعدادات وحذف البيانات.</span></div>
        <div><b>موظف</b><span>متابعة الطلبات وتغيير حالتها، وإدارة المشاريع والرد على العملاء. لا يحذف ولا يدير المستخدمين.</span></div>
        <div><b>عميل</b><span>يرى مشاريعه المسجلة ببريده فقط ويرسل الطلبات.</span></div>
        <div><b>موقوف</b><span>لا يستطيع الدخول إلى أي بيانات.</span></div>
      </div>

      <div className="toolbar">
        <div className="filters" style={{ margin: 0 }}>
          {([['all', 'الكل'], ['team', `الفريق (${teamCount})`], ['client', 'العملاء'], ['blocked', 'الموقوفون']] as const).map(([k, t]) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input search" placeholder="بحث بالاسم أو البريد" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" />
          <button className="btn small" type="button" onClick={() => setAdding((a) => !a)}>{adding ? 'إغلاق' : '+ إضافة موظف'}</button>
        </div>
      </div>

      {adding && <InviteForm onDone={() => setAdding(false)} />}

      <div className="panel table-wrap">
        <table className="users-table">
          <thead>
            <tr><th>المستخدم</th><th>الصلاحية</th><th>تاريخ التسجيل</th><th></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="muted" style={{ textAlign: 'center', padding: 32 }}>لا يوجد مستخدمون مطابقون.</td></tr>
            ) : rows.map((r) => <UserRowView key={r.key} r={r} me={res.me} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserRowView({ r, me }: { r: UserRow; me: string }) {
  const setRole = useMutation(api.users.setRole)
  const rename = useMutation(api.users.renameUser)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(r.name)
  const [err, setErr] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const locked = r.role === 'owner' || r.email === me

  async function changeRole(role: 'admin' | 'staff' | 'client' | 'blocked') {
    setErr(null)
    const res = await setRole({ email: r.email, role })
    if (!res.ok) setErr(res.error)
    else { setSaved(true); setTimeout(() => setSaved(false), 1500) }
  }

  return (
    <tr>
      <td>
        {editing && r.userId ? (
          <span className="inline-edit">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} aria-label="الاسم" />
            <button className="btn small" type="button" onClick={async () => {
              const res = await rename({ userId: r.userId as Id<'users'>, name })
              if (res.ok) { setEditing(false); setErr(null) } else setErr(res.error)
            }}>حفظ</button>
            <button className="btn ghost small" type="button" onClick={() => { setEditing(false); setName(r.name) }}>إلغاء</button>
          </span>
        ) : (
          <div className="user-cell">
            <div className="avatar">{r.name.charAt(0)}</div>
            <span>
              <b>{r.name}</b> {r.pending && <span className="ex">بانتظار التسجيل</span>}
              <small className="mono">{r.email}</small>
            </span>
          </div>
        )}
        {err && <div className="row-err">{err}</div>}
      </td>
      <td>
        {locked ? (
          <span className="role-pill">{ROLE_LABEL[r.role]}{r.email === me && r.role !== 'owner' ? ' (أنت)' : ''}</span>
        ) : (
          <select className="select" value={r.role} aria-label={`صلاحية ${r.name}`} onChange={(e) => void changeRole(e.target.value as 'admin' | 'staff' | 'client' | 'blocked')}>
            <option value="client">عميل</option>
            <option value="staff">موظف</option>
            <option value="admin">مدير</option>
            <option value="blocked">موقوف</option>
          </select>
        )}
        {saved && <small className="ok-note"> تم الحفظ</small>}
      </td>
      <td className="muted">{r.joined ? fmtDate(r.joined) : '—'}</td>
      <td>
        {r.userId && !editing && <button className="linkish" type="button" onClick={() => setEditing(true)}>تعديل الاسم</button>}
        {r.pending && <button className="linkish" style={{ color: 'var(--danger)' }} type="button" onClick={() => void changeRole('client')}>إلغاء الدعوة</button>}
      </td>
    </tr>
  )
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const invite = useMutation(api.users.inviteMember)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  return (
    <form className="form" onSubmit={async (e) => {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      setBusy(true)
      setErr(null)
      const r = await invite({
        name: String(fd.get('name') ?? ''),
        email: String(fd.get('email') ?? ''),
        role: (String(fd.get('role')) === 'admin' ? 'admin' : 'staff') as 'admin' | 'staff',
      })
      setBusy(false)
      if (r.ok) onDone()
      else setErr(r.error)
    }}>
      <div className="field"><label htmlFor="iv-name">اسم الموظف</label><input id="iv-name" name="name" required /></div>
      <div className="field"><label htmlFor="iv-email">بريد الموظف</label><input id="iv-email" name="email" type="email" required dir="ltr" placeholder="name@company.sa" /></div>
      <div className="field"><label htmlFor="iv-role">الصلاحية</label>
        <select id="iv-role" name="role" defaultValue="staff"><option value="staff">موظف</option><option value="admin">مدير</option></select>
      </div>
      <div className="field" style={{ justifyContent: 'end' }}><button className="btn" type="submit" disabled={busy}>{busy ? 'جارٍ الإضافة…' : 'إضافة'}</button></div>
      <p className="muted field full" style={{ fontSize: '.85rem' }}>بعد الإضافة، يسجّل الموظف من صفحة الدخول بنفس البريد ويؤكده بالرمز، وتُفعَّل صلاحياته تلقائياً. إذا كان لديه حساب مسبقاً تتغير صلاحيته فوراً.</p>
      {err && <div className="sent err">{err}</div>}
    </form>
  )
}

/* =================== SITE SETTINGS (admins) =================== */

function SettingsPanel() {
  const current = useQuery(api.settings.get) as SiteSettings | undefined
  const save = useMutation(api.settings.update)
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (current && !loaded) { setForm(current); setLoaded(true) }
  }, [current, loaded])

  if (!current) return <p className="muted">جارٍ تحميل الإعدادات…</p>
  const set = (k: keyof SiteSettings) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form className="form" onSubmit={async (e) => {
      e.preventDefault()
      setBusy(true)
      setState(null)
      const r = await save(form)
      setBusy(false)
      if (r.ok) { setForm((f) => ({ ...f, whatsapp: r.whatsapp })); setState({ ok: true, text: 'تم حفظ الإعدادات، وتظهر في الموقع مباشرة.' }) }
      else setState({ ok: false, text: r.error })
    }}>
      <div className="field full"><h3 style={{ fontSize: '1.1rem' }}>بيانات التواصل في الموقع</h3><p className="muted" style={{ fontSize: '.88rem' }}>تظهر في قسم التواصل وزر واتساب والصفحات القانونية.</p></div>
      <div className="field">
        <label htmlFor="st-wa">رقم الواتساب</label>
        <input id="st-wa" dir="ltr" inputMode="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="9665XXXXXXXX" required />
        <small className="muted">بالصيغة الدولية بدون + أو أصفار، مثل 966512345678. ويُقبل 05XXXXXXXX.</small>
      </div>
      <div className="field">
        <label htmlFor="st-phone">رقم الهاتف المعروض</label>
        <input id="st-phone" dir="ltr" value={form.phone} onChange={set('phone')} placeholder="+966 13 000 0000" />
      </div>
      <div className="field full">
        <label htmlFor="st-msg">رسالة واتساب الجاهزة</label>
        <input id="st-msg" value={form.whatsappMessage} onChange={set('whatsappMessage')} />
      </div>
      <div className="field">
        <label htmlFor="st-email">البريد الإلكتروني</label>
        <input id="st-email" dir="ltr" type="email" value={form.email} onChange={set('email')} />
      </div>
      <div className="field">
        <label htmlFor="st-hours">ساعات العمل</label>
        <input id="st-hours" value={form.hours} onChange={set('hours')} />
      </div>
      <div className="field full">
        <label htmlFor="st-address">العنوان</label>
        <input id="st-address" value={form.address} onChange={set('address')} />
      </div>
      <div className="field full settings-actions">
        <button className="btn" type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ الإعدادات'}</button>
        <a className="btn ghost" href={whatsappLink(form)} target="_blank" rel="noopener noreferrer">تجربة رابط واتساب</a>
      </div>
      {state && <div className={state.ok ? 'sent' : 'sent err'} role="status">{state.text}</div>}
    </form>
  )
}

/* =================== PROJECT LINKS & PAYMENTS =================== */

type Payment = { title: string; amount: number; status: 'pending' | 'due' | 'paid' }
const PAY_LABEL: Record<Payment['status'], string> = { pending: 'لاحقاً', due: 'مستحقة', paid: 'مدفوعة' }
const sar = (n: number) => n.toLocaleString('en-US')

function PaymentsSummary({ payments, detailed = false }: { payments?: Array<Payment>; detailed?: boolean }) {
  if (!payments || payments.length === 0) return null
  const total = payments.reduce((s, x) => s + x.amount, 0)
  const paid = payments.filter((x) => x.status === 'paid').reduce((s, x) => s + x.amount, 0)
  const due = payments.filter((x) => x.status === 'due').reduce((s, x) => s + x.amount, 0)
  return (
    <div className="pay">
      <div className="pay-head">
        <span>الدفعات</span>
        <span><b className="mono">{sar(paid)}</b> من <b className="mono">{sar(total)}</b> ريال</span>
      </div>
      <div className="pay-track"><i style={{ width: `${total ? (paid / total) * 100 : 0}%` }} /></div>
      {due > 0 && <div className="pay-due">مستحق الآن: <b className="mono">{sar(due)}</b> ريال</div>}
      {detailed && (
        <ul className="pay-list">
          {payments.map((x, k) => (
            <li key={k}><span>{x.title}</span><span className="mono">{sar(x.amount)}</span><span className={`badge-s pay-${x.status}`}>{PAY_LABEL[x.status]}</span></li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ProjectExtras({ p }: { p: Doc<'projects'> }) {
  const update = useMutation(api.app.updateProject)
  const [title, setTitle] = useState(p.title)
  const [due, setDue] = useState(p.dueDate ?? '')
  const [links, setLinks] = useState<Array<{ label: string; url: string }>>(p.links ?? [])
  const [pays, setPays] = useState<Array<Payment>>(p.payments ?? [])
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const setLink = (k: number, f: 'label' | 'url', v: string) => setLinks((ls) => ls.map((l, i) => (i === k ? { ...l, [f]: v } : l)))
  const setPay = (k: number, patch: Partial<Payment>) => setPays((ps) => ps.map((x, i) => (i === k ? { ...x, ...patch } : x)))
  return (
    <div className="extras">
      <div className="extras-grid">
        <div className="field"><label htmlFor={`t-${p._id}`}>اسم المشروع</label><input id={`t-${p._id}`} className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="field"><label htmlFor={`d-${p._id}`}>موعد التسليم</label><input id={`d-${p._id}`} className="input" type="date" dir="ltr" value={due} onChange={(e) => setDue(e.target.value)} /></div>
      </div>

      <div className="extras-sec">
        <div className="extras-title"><b>روابط للعميل</b><small className="muted">التصاميم، النسخة التجريبية، المستندات</small></div>
        {links.map((l, k) => (
          <div className="extras-row" key={k}>
            <input className="input" placeholder="الاسم، مثل: التصاميم" value={l.label} onChange={(e) => setLink(k, 'label', e.target.value)} aria-label="اسم الرابط" />
            <input className="input" dir="ltr" placeholder="https://" value={l.url} onChange={(e) => setLink(k, 'url', e.target.value)} aria-label="الرابط" />
            <button className="icon-btn" type="button" aria-label="حذف الرابط" onClick={() => setLinks((ls) => ls.filter((_, i) => i !== k))}>×</button>
          </div>
        ))}
        <button className="linkish" type="button" onClick={() => setLinks((ls) => [...ls, { label: '', url: '' }])}>+ إضافة رابط</button>
      </div>

      <div className="extras-sec">
        <div className="extras-title"><b>جدول الدفعات</b><small className="muted">يظهر للعميل مع المبلغ المستحق</small></div>
        {pays.map((x, k) => (
          <div className="extras-row pay-row" key={k}>
            <input className="input" placeholder="مثال: دفعة التوقيع 30%" value={x.title} onChange={(e) => setPay(k, { title: e.target.value })} aria-label="اسم الدفعة" />
            <input className="input" dir="ltr" inputMode="numeric" placeholder="المبلغ" value={x.amount || ''} onChange={(e) => setPay(k, { amount: Number(e.target.value.replace(/[^\d]/g, '')) || 0 })} aria-label="المبلغ بالريال" />
            <select className="select" value={x.status} onChange={(e) => setPay(k, { status: e.target.value as Payment['status'] })} aria-label="حالة الدفعة">
              <option value="pending">لاحقاً</option><option value="due">مستحقة</option><option value="paid">مدفوعة</option>
            </select>
            <button className="icon-btn" type="button" aria-label="حذف الدفعة" onClick={() => setPays((ps) => ps.filter((_, i) => i !== k))}>×</button>
          </div>
        ))}
        <button className="linkish" type="button" onClick={() => setPays((ps) => [...ps, { title: '', amount: 0, status: 'pending' }])}>+ إضافة دفعة</button>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn small" type="button" disabled={busy} onClick={async () => {
          setBusy(true)
          setState(null)
          const r = await update({ id: p._id, title, dueDate: due, links: links.filter((l) => l.label || l.url), payments: pays.filter((x) => x.title || x.amount) })
          setBusy(false)
          setState(r.ok ? { ok: true, text: 'تم الحفظ' } : { ok: false, text: r.error })
        }}>{busy ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}</button>
        {state && <small className={state.ok ? 'ok-note' : 'row-err'}>{state.text}</small>}
      </div>
    </div>
  )
}

/* =================== WEBSITE CONTENT (admins) =================== */

type WorkDraft = {
  id?: Id<'works'>
  title: string; label: string; text: string; kind: 'mobile' | 'web' | 'both'
  art: string; color: string; metrics: Array<{ value: string; label: string }>; url: string; visible: boolean
}
const emptyWork: WorkDraft = { title: '', label: '', text: '', kind: 'mobile', art: 'coffee', color: 'accent', metrics: [{ value: '', label: '' }], url: '', visible: true }

function ContentPanel() {
  const res = useQuery(api.content.adminContent) as
    | { status: 'ok'; works: Array<Doc<'works'>>; testimonials: Array<Doc<'testimonials'>> }
    | { status: 'forbidden' }
    | undefined
  const [section, setSection] = useState<'home' | 'works' | 'quotes'>('works')
  if (res === undefined) return <p className="muted">جارٍ تحميل المحتوى…</p>
  if (res.status !== 'ok') return <p className="muted">تعديل المحتوى للمدراء فقط.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="toolbar">
        <div className="filters" style={{ margin: 0 }}>
          <button type="button" aria-pressed={section === 'works'} onClick={() => setSection('works')}>الأعمال <span className="count">{res.works.length}</span></button>
          <button type="button" aria-pressed={section === 'quotes'} onClick={() => setSection('quotes')}>آراء العملاء <span className="count">{res.testimonials.length}</span></button>
          <button type="button" aria-pressed={section === 'home'} onClick={() => setSection('home')}>الأرقام والشركات</button>
        </div>
        <a className="btn ghost small" href="/satr/" target="_blank" rel="noopener noreferrer">معاينة الموقع ↗</a>
      </div>
      {section === 'works' && <WorksEditor works={res.works} />}
      {section === 'quotes' && <QuotesEditor items={res.testimonials} />}
      {section === 'home' && <HomeContentForm />}
    </div>
  )
}

function OrderButtons({ table, id, first, last }: { table: 'works' | 'testimonials'; id: string; first: boolean; last: boolean }) {
  const move = useMutation(api.content.move)
  return (
    <span className="order-btns">
      <button className="icon-btn" type="button" disabled={first} aria-label="تقديم" onClick={() => void move({ table, id, dir: -1 })}>↑</button>
      <button className="icon-btn" type="button" disabled={last} aria-label="تأخير" onClick={() => void move({ table, id, dir: 1 })}>↓</button>
    </span>
  )
}

function WorksEditor({ works }: { works: Array<Doc<'works'>> }) {
  const [editing, setEditing] = useState<WorkDraft | null>(null)
  const del = useMutation(api.content.deleteWork)
  const [confirm, setConfirm] = useState<string | null>(null)
  if (editing) return <WorkForm draft={editing} onClose={() => setEditing(null)} />
  return (
    <div className="panel">
      <div className="panel-pad toolbar">
        <p className="muted" style={{ fontSize: '.9rem' }}>تظهر الأعمال في قسم «أعمالنا» بهذا الترتيب. المخفي لا يظهر للزوار.</p>
        <button className="btn small" type="button" onClick={() => setEditing({ ...emptyWork, metrics: [{ value: '', label: '' }] })}>+ إضافة عمل</button>
      </div>
      {works.length === 0 ? <div className="empty"><h3>لا توجد أعمال</h3><p>عند عدم وجود أعمال يُخفى قسم «أعمالنا» من الموقع.</p></div> : (
        <div className="lead-list">
          {works.map((w, k) => (
            <div className="content-row" key={w._id}>
              <OrderButtons table="works" id={w._id} first={k === 0} last={k === works.length - 1} />
              <span className="swatch" style={{ background: (COLORS[w.color] ?? COLORS.accent).css }} />
              <div className="content-main"><b>{w.title}</b><small className="muted">{w.label} · {ARTS[w.art]?.label ?? ''}</small></div>
              {!w.visible && <span className="ex">مخفي</span>}
              <span className="content-actions">
                <button className="btn ghost small" type="button" onClick={() => setEditing({
                  id: w._id, title: w.title, label: w.label, text: w.text, kind: w.kind, art: w.art, color: w.color,
                  metrics: w.metrics.length ? w.metrics : [{ value: '', label: '' }], url: w.url ?? '', visible: w.visible,
                })}>تعديل</button>
                {confirm === w._id ? (
                  <><button className="btn danger small" type="button" onClick={() => void del({ id: w._id })}>تأكيد</button><button className="btn ghost small" type="button" onClick={() => setConfirm(null)}>إلغاء</button></>
                ) : <button className="linkish" style={{ color: 'var(--danger)' }} type="button" onClick={() => setConfirm(w._id)}>حذف</button>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WorkForm({ draft, onClose }: { draft: WorkDraft; onClose: () => void }) {
  const save = useMutation(api.content.saveWork)
  const [w, setW] = useState<WorkDraft>(draft)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof WorkDraft>(k: K, v: WorkDraft[K]) => setW((x) => ({ ...x, [k]: v }))
  const setMetric = (k: number, f: 'value' | 'label', v: string) => set('metrics', w.metrics.map((m, i) => (i === k ? { ...m, [f]: v } : m)))
  return (
    <div className="work-editor">
      <form className="form" onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setErr(null)
        const r = await save({ ...(w.id ? { id: w.id } : {}), title: w.title, label: w.label, text: w.text, kind: w.kind, art: w.art, color: w.color,
          metrics: w.metrics.filter((m) => m.value && m.label), url: w.url, visible: w.visible })
        setBusy(false)
        if (r.ok) onClose()
        else setErr(r.error)
      }}>
        <div className="field full"><h3 style={{ fontSize: '1.1rem' }}>{w.id ? 'تعديل العمل' : 'عمل جديد'}</h3></div>
        <div className="field"><label htmlFor="w-title">اسم المشروع</label><input id="w-title" value={w.title} onChange={(e) => set('title', e.target.value)} required placeholder="تطبيق «...»" /></div>
        <div className="field"><label htmlFor="w-label">التصنيف</label><input id="w-label" value={w.label} onChange={(e) => set('label', e.target.value)} placeholder="توصيل · iOS وأندرويد" /></div>
        <div className="field full"><label htmlFor="w-text">وصف قصير</label><textarea id="w-text" rows={2} value={w.text} onChange={(e) => set('text', e.target.value)} /></div>
        <div className="field"><label htmlFor="w-kind">النوع (للتصفية)</label>
          <select id="w-kind" value={w.kind} onChange={(e) => set('kind', e.target.value as WorkDraft['kind'])}>
            <option value="mobile">تطبيق جوال</option><option value="web">نظام ويب</option><option value="both">جوال وويب</option>
          </select>
        </div>
        <div className="field"><label htmlFor="w-art">شكل المعاينة</label>
          <select id="w-art" value={w.art} onChange={(e) => set('art', e.target.value)}>
            {Object.entries(ARTS).map(([k, a]) => <option key={k} value={k}>{a.label}</option>)}
          </select>
        </div>
        <div className="field full"><span className="lbl">اللون</span>
          <div className="chips">
            {Object.entries(COLORS).map(([k, c]) => (
              <label key={k}><input type="radio" name="w-color" checked={w.color === k} onChange={() => set('color', k)} /><span className="swatch" style={{ background: c.css }} /> {c.label}</label>
            ))}
          </div>
        </div>
        <div className="field full"><span className="lbl">أرقام المشروع (حتى 3)</span>
          {w.metrics.map((m, k) => (
            <div className="extras-row" key={k}>
              <input className="input" dir="ltr" placeholder="85K" value={m.value} onChange={(e) => setMetric(k, 'value', e.target.value)} aria-label="الرقم" />
              <input className="input" placeholder="تحميل" value={m.label} onChange={(e) => setMetric(k, 'label', e.target.value)} aria-label="الوصف" />
              <button className="icon-btn" type="button" aria-label="حذف" onClick={() => set('metrics', w.metrics.filter((_, i) => i !== k))}>×</button>
            </div>
          ))}
          {w.metrics.length < 3 && <button className="linkish" type="button" onClick={() => set('metrics', [...w.metrics, { value: '', label: '' }])}>+ إضافة رقم</button>}
        </div>
        <div className="field full"><label htmlFor="w-url">رابط المشروع (اختياري)</label><input id="w-url" dir="ltr" value={w.url} onChange={(e) => set('url', e.target.value)} placeholder="https://apps.apple.com/..." /></div>
        <label className="field full check-line"><input type="checkbox" checked={w.visible} onChange={(e) => set('visible', e.target.checked)} /> يظهر في الموقع</label>
        <div className="field full settings-actions">
          <button className="btn" type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</button>
          <button className="btn ghost" type="button" onClick={onClose}>إلغاء</button>
        </div>
        {err && <div className="sent err">{err}</div>}
      </form>
      <div className="work-preview">
        <span className="kicker">معاينة</span>
        <WorkCard w={{ ...w, title: w.title || 'اسم المشروع', label: w.label || 'التصنيف', text: w.text || 'وصف قصير للمشروع', metrics: w.metrics.filter((m) => m.value && m.label) }} />
      </div>
    </div>
  )
}

function QuotesEditor({ items }: { items: Array<Doc<'testimonials'>> }) {
  const save = useMutation(api.content.saveTestimonial)
  const del = useMutation(api.content.deleteTestimonial)
  const [editing, setEditing] = useState<{ id?: Id<'testimonials'>; text: string; name: string; role: string; visible: boolean } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  return (
    <div className="panel">
      <div className="panel-pad toolbar">
        <p className="muted" style={{ fontSize: '.9rem' }}>تتبدل الآراء تلقائياً في قسم «لماذا استوديو مكود». عند حذفها كلها يُخفى المربع.</p>
        {!editing && <button className="btn small" type="button" onClick={() => setEditing({ text: '', name: '', role: '', visible: true })}>+ إضافة رأي</button>}
      </div>
      {editing && (
        <form className="form" style={{ margin: '0 20px 20px' }} onSubmit={async (e) => {
          e.preventDefault()
          setErr(null)
          const r = await save(editing)
          if (r.ok) setEditing(null)
          else setErr(r.error)
        }}>
          <div className="field full"><label htmlFor="q-text">نص الرأي</label><textarea id="q-text" rows={3} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} required /></div>
          <div className="field"><label htmlFor="q-name">الاسم</label><input id="q-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></div>
          <div className="field"><label htmlFor="q-role">المنصب والجهة</label><input id="q-role" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="المدير التنفيذي، ..." /></div>
          <label className="field full check-line"><input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} /> يظهر في الموقع</label>
          <div className="field full settings-actions"><button className="btn" type="submit">حفظ</button><button className="btn ghost" type="button" onClick={() => setEditing(null)}>إلغاء</button></div>
          {err && <div className="sent err">{err}</div>}
        </form>
      )}
      <div className="lead-list">
        {items.map((t, k) => (
          <div className="content-row" key={t._id}>
            <OrderButtons table="testimonials" id={t._id} first={k === 0} last={k === items.length - 1} />
            <div className="content-main"><b>{t.name}</b><small className="muted">{t.role}</small><p className="quote-snip">«{t.text}»</p></div>
            {!t.visible && <span className="ex">مخفي</span>}
            <span className="content-actions">
              <button className="btn ghost small" type="button" onClick={() => setEditing({ id: t._id, text: t.text, name: t.name, role: t.role, visible: t.visible })}>تعديل</button>
              {confirm === t._id ? (
                <><button className="btn danger small" type="button" onClick={() => void del({ id: t._id })}>تأكيد</button><button className="btn ghost small" type="button" onClick={() => setConfirm(null)}>إلغاء</button></>
              ) : <button className="linkish" style={{ color: 'var(--danger)' }} type="button" onClick={() => setConfirm(t._id)}>حذف</button>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomeContentForm() {
  const current = useQuery(api.settings.get) as SiteSettings | undefined
  const save = useMutation(api.settings.updateHome)
  const [stats, setStats] = useState<Array<{ value: string; label: string }>>([])
  const [clients, setClients] = useState('')
  const [note, setNote] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    if (current && !loaded) {
      const st = current.stats ?? []
      setStats([0, 1, 2].map((i) => st[i] ?? { value: '', label: '' }))
      setClients((current.clients ?? []).join('\n'))
      setNote(current.showExampleNote !== false)
      setLoaded(true)
    }
  }, [current, loaded])
  if (!current) return <p className="muted">جارٍ التحميل…</p>
  return (
    <form className="form" onSubmit={async (e) => {
      e.preventDefault()
      setState(null)
      const r = await save({ stats: stats.filter((s) => s.value && s.label), clients: clients.split('\n').map((c) => c.trim()).filter(Boolean), showExampleNote: note })
      setState(r.ok ? { ok: true, text: 'تم الحفظ، والتعديل ظاهر في الموقع الآن.' } : { ok: false, text: r.error })
    }}>
      <div className="field full"><h3 style={{ fontSize: '1.1rem' }}>أرقام الواجهة</h3><p className="muted" style={{ fontSize: '.88rem' }}>تظهر تحت العنوان الرئيسي. اترك الحقول فارغة لإخفائها.</p></div>
      {stats.map((st, k) => (
        <div className="field full extras-row" key={k}>
          <input className="input" dir="ltr" placeholder="+40" value={st.value} onChange={(e) => setStats((s) => s.map((x, i) => (i === k ? { ...x, value: e.target.value } : x)))} aria-label={`الرقم ${k + 1}`} />
          <input className="input" placeholder="تطبيقاً منشوراً" value={st.label} onChange={(e) => setStats((s) => s.map((x, i) => (i === k ? { ...x, label: e.target.value } : x)))} aria-label={`وصف الرقم ${k + 1}`} />
        </div>
      ))}
      <div className="field full"><label htmlFor="h-clients">شركات وثقت بنا (اسم في كل سطر)</label><textarea id="h-clients" rows={6} value={clients} onChange={(e) => setClients(e.target.value)} /><small className="muted">اتركه فارغاً لإخفاء الشريط.</small></div>
      <label className="field full check-line"><input type="checkbox" checked={note} onChange={(e) => setNote(e.target.checked)} /> إظهار تنبيه «الأعمال أمثلة توضيحية» تحت قسم الأعمال</label>
      <div className="field full settings-actions"><button className="btn" type="submit">حفظ</button></div>
      {state && <div className={state.ok ? 'sent' : 'sent err'} role="status">{state.text}</div>}
    </form>
  )
}
