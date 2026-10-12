// Admin dashboard: overview, price quotes and the price catalog editor.
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { LogoMark } from '@/components/Logo'
import { SERVICE_PRICING, fmtSAR } from '@/estimate'
import type { Catalog, Option, Service } from '@/estimate'
import { COMPANY, DEFAULT_SETTINGS } from '@/site-config'
import type { SiteSettings } from '@/site-config'

export type Section = 'overview' | 'leads' | 'projects' | 'quotes' | 'pricing' | 'content' | 'users' | 'settings'
export type Quote = Doc<'quotes'>
type Lead = Doc<'leads'>
type Project = Doc<'projects'>

export const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
)

export const ICONS: Record<Section, string> = {
  overview: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  leads: '<path d="M4 4h16v12H5.2L4 17.2z"/><path d="M8 9h8M8 12h5"/>',
  projects: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  quotes: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h4"/>',
  pricing: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1.5"/>',
  content: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 20V9"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-3-5.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
}

const fmtShort = (ms: number) => new Intl.DateTimeFormat('ar-u-nu-latn', { day: 'numeric', month: 'short' }).format(ms)
const DAY = 86400000

export const QUOTE_STATUS: Record<Quote['status'], string> = { draft: 'مسودة', sent: 'أُرسل للعميل', accepted: 'مقبول', rejected: 'مرفوض' }
export const VAT_RATE = 0.15

export function quoteTotals(q: { items: Array<{ qty: number; price: number }>; discount: number; vat: boolean }) {
  const subtotal = q.items.reduce((n, i) => n + i.qty * i.price, 0)
  const afterDiscount = Math.max(0, subtotal - q.discount)
  const vat = q.vat ? Math.round(afterDiscount * VAT_RATE) : 0
  return { subtotal, afterDiscount, vat, total: afterDiscount + vat }
}

/* =================== OVERVIEW =================== */

export function Overview({ leads, projects, quotes, go }: {
  leads: Array<Lead>; projects: Array<Project>; quotes: Array<Quote>; go: (s: Section) => void
}) {
  const now = Date.now()
  const open = leads.filter((l) => l.status === 'new' || l.status === 'contacted')
  const pipeline = open.reduce((n, l) => n + (l.amount ?? 0), 0)
  const pays = projects.flatMap((p) => (p.payments ?? []).map((x) => ({ ...x, project: p })))
  const paid = pays.filter((x) => x.status === 'paid').reduce((n, x) => n + x.amount, 0)
  const due = pays.filter((x) => x.status === 'due')
  const dueSum = due.reduce((n, x) => n + x.amount, 0)
  const contracted = pays.reduce((n, x) => n + x.amount, 0)
  const won = leads.filter((l) => l.status === 'won').length
  const conv = leads.length ? Math.round((won / leads.length) * 100) : 0
  const active = projects.filter((p) => p.stage < 4)
  const sentQuotes = quotes.filter((q) => q.status === 'sent')
  const sentValue = sentQuotes.reduce((n, q) => n + quoteTotals(q).total, 0)

  const stale = leads.filter((l) => l.status === 'new' && now - l._creationTime > 2 * DAY)
  const soon = active
    .filter((p) => p.dueDate)
    .map((p) => ({ p, at: new Date(p.dueDate + 'T00:00:00').getTime() }))
    .filter((x) => !isNaN(x.at) && x.at - now < 14 * DAY)
    .sort((a, b) => a.at - b.at)

  const demand = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of leads) for (const t of l.types) m.set(t, (m.get(t) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [leads])
  const maxDemand = Math.max(1, ...demand.map((d) => d[1]))

  const kpis: Array<{ label: string; value: string; unit?: string; hint: string; tone?: string; to: Section }> = [
    { label: 'طلبات جديدة', value: String(leads.filter((l) => l.status === 'new').length), hint: `${open.length} طلباً مفتوحاً`, to: 'leads' },
    { label: 'قيمة الطلبات المفتوحة', value: fmtSAR(pipeline), unit: 'ريال', hint: 'من حاسبة الأسعار', to: 'leads' },
    { label: 'عروض بانتظار الرد', value: fmtSAR(sentValue), unit: 'ريال', hint: `${sentQuotes.length} عرض مرسل`, to: 'quotes' },
    { label: 'المحصّل', value: fmtSAR(paid), unit: 'ريال', hint: `من ${fmtSAR(contracted)} متعاقد عليها`, tone: 'good', to: 'projects' },
    { label: 'مستحق الآن', value: fmtSAR(dueSum), unit: 'ريال', hint: `${due.length} دفعة`, tone: dueSum ? 'warn' : undefined, to: 'projects' },
    { label: 'مشاريع نشطة', value: String(active.length), hint: `نسبة التحويل ${conv}%`, to: 'projects' },
  ]

  return (
    <div className="ov">
      <div className="ov-kpis">
        {kpis.map((k) => (
          <button key={k.label} type="button" className={`ov-kpi ${k.tone ?? ''}`} onClick={() => go(k.to)}>
            <small>{k.label}</small>
            <b><span className="mono">{k.value}</span>{k.unit && <em>{k.unit}</em>}</b>
            <span className="muted">{k.hint}</span>
          </button>
        ))}
      </div>

      <div className="ov-grid">
        <div className="panel ov-card">
          <div className="ov-card-head"><b>يحتاج متابعتك</b><span className="muted">{stale.length + due.length + soon.length} عنصر</span></div>
          {stale.length + due.length + soon.length === 0 ? (
            <p className="muted ov-empty">كل شيء تحت السيطرة. لا توجد متابعات متأخرة.</p>
          ) : (
            <ul className="todo">
              {stale.map((l) => (
                <li key={l._id}><i className="dot st-new" /><span><b>{l.name}</b> طلب جديد منذ {Math.floor((now - l._creationTime) / DAY)} أيام بلا تواصل</span><button className="linkish" type="button" onClick={() => go('leads')}>فتح</button></li>
              ))}
              {due.map((x, k) => (
                <li key={'d' + k}><i className="dot warn" /><span><b>{x.project.clientName}</b> دفعة مستحقة {fmtSAR(x.amount)} ريال · {x.title}</span><button className="linkish" type="button" onClick={() => go('projects')}>فتح</button></li>
              ))}
              {soon.map(({ p, at }) => (
                <li key={p._id}><i className="dot sky" /><span><b>{p.title}</b> {at < now ? 'تجاوز موعد التسليم' : `التسليم ${fmtShort(at)}`} · {p.progress}%</span><button className="linkish" type="button" onClick={() => go('projects')}>فتح</button></li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel ov-card">
          <div className="ov-card-head"><b>الطلب حسب الخدمة</b><span className="muted">كل الطلبات</span></div>
          {demand.length === 0 ? <p className="muted ov-empty">لا توجد طلبات بعد.</p> : (
            <ul className="hbars">
              {demand.map(([t, n]) => (
                <li key={t}><span>{t}</span><div><i style={{ width: `${(n / maxDemand) * 100}%` }} /></div><b className="mono">{n}</b></li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel ov-card">
          <div className="ov-card-head"><b>آخر الطلبات</b><button className="linkish" type="button" onClick={() => go('leads')}>عرض الكل</button></div>
          <ul className="recent">
            {leads.slice(0, 5).map((l) => (
              <li key={l._id}>
                <div className="avatar sm">{l.name.charAt(0)}</div>
                <span><b>{l.name}</b><small className="muted">{l.types.join('، ') || '—'} · {fmtShort(l._creationTime)}</small></span>
                {l.amount ? <b className="mono amt">{fmtSAR(l.amount)}</b> : <span className={`badge-s st-${l.status}`}>{l.status === 'new' ? 'جديد' : l.status === 'won' ? 'تم' : l.status === 'lost' ? 'لم يكتمل' : 'متابعة'}</span>}
              </li>
            ))}
            {leads.length === 0 && <li className="muted">لا توجد طلبات بعد.</li>}
          </ul>
        </div>

        <div className="panel ov-card">
          <div className="ov-card-head"><b>تقدّم المشاريع</b><button className="linkish" type="button" onClick={() => go('projects')}>عرض الكل</button></div>
          <ul className="prog-list">
            {active.slice(0, 5).map((p) => (
              <li key={p._id}>
                <span><b>{p.title}</b><small className="muted">{p.clientName}</small></span>
                <div className="pay-track"><i style={{ width: `${p.progress}%` }} /></div>
                <b className="mono">{p.progress}%</b>
              </li>
            ))}
            {active.length === 0 && <li className="muted">لا توجد مشاريع نشطة.</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* =================== QUOTES =================== */

type Draft = {
  id?: Id<'quotes'>
  clientName: string; clientEmail: string; company: string; title: string; leadId?: Id<'leads'>
  items: Array<{ label: string; qty: number; price: number }>
  discount: number; vat: boolean; validDays: number; notes: string
}

const emptyDraft = (): Draft => ({ clientName: '', clientEmail: '', company: '', title: '', items: [], discount: 0, vat: false, validDays: 14, notes: '' })

export function draftFromLead(l: Lead): Draft {
  return {
    ...emptyDraft(),
    clientName: l.name, clientEmail: l.email, company: l.company ?? '', leadId: l._id,
    title: `${l.types[0] ?? 'مشروع'} — ${l.company || l.name}`,
    items: l.amount ? [{ label: l.types[0] ?? 'تنفيذ المشروع', qty: 1, price: l.amount }] : [],
  }
}

export function QuotesPanel({ quotes, leads, catalog, seed, onSeedUsed, canAdmin }: {
  quotes: Array<Quote>; leads: Array<Lead>; catalog: Catalog; seed: Draft | null; onSeedUsed: () => void; canAdmin: boolean
}) {
  const [editing, setEditing] = useState<Draft | null>(null)
  const [printing, setPrinting] = useState<Quote | null>(null)
  const [filter, setFilter] = useState<'all' | Quote['status']>('all')
  useEffect(() => { if (seed) { setEditing(seed); onSeedUsed() } }, [seed, onSeedUsed])
  const shown = quotes.filter((q) => filter === 'all' || q.status === filter)
  const sum = (st: Quote['status']) => quotes.filter((q) => q.status === st).reduce((n, q) => n + quoteTotals(q).total, 0)

  if (editing) return <QuoteForm draft={editing} leads={leads} catalog={catalog} onClose={() => setEditing(null)} />
  return (
    <div className="stack">
      <div className="q-sum">
        {(['draft', 'sent', 'accepted', 'rejected'] as const).map((st) => (
          <div key={st} className={`q-sum-item q-${st}`}><small>{QUOTE_STATUS[st]}</small><b className="mono">{fmtSAR(sum(st))}</b><span className="muted">{quotes.filter((q) => q.status === st).length} عرض</span></div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-pad toolbar">
          <div className="filters" style={{ margin: 0 }}>
            {(['all', 'draft', 'sent', 'accepted', 'rejected'] as const).map((k) => (
              <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{k === 'all' ? 'الكل' : QUOTE_STATUS[k]}</button>
            ))}
          </div>
          <button className="btn small" type="button" onClick={() => setEditing(emptyDraft())}>+ عرض سعر جديد</button>
        </div>
        {shown.length === 0 ? (
          <div className="empty"><h3>لا توجد عروض أسعار هنا</h3><p>أنشئ عرضاً من قائمة الأسعار أو من أي طلب في تبويب الطلبات، واطبعه PDF بشعار الاستوديو.</p></div>
        ) : (
          <div className="q-table" role="table">
            <div className="q-row q-th" role="row"><span>الرقم</span><span>العميل والمشروع</span><span>الإجمالي</span><span>الحالة</span><span /></div>
            {shown.map((q) => <QuoteRow key={q._id} q={q} canAdmin={canAdmin} onEdit={() => setEditing({ ...q, id: q._id, company: q.company ?? '', notes: q.notes ?? '' })} onPrint={() => setPrinting(q)} />)}
          </div>
        )}
      </div>
      {printing && <QuotePrint q={printing} onClose={() => setPrinting(null)} />}
    </div>
  )
}

function QuoteRow({ q, canAdmin, onEdit, onPrint }: { q: Quote; canAdmin: boolean; onEdit: () => void; onPrint: () => void }) {
  const setStatus = useMutation(api.quotes.setStatus)
  const toProject = useMutation(api.quotes.toProject)
  const remove = useMutation(api.quotes.remove)
  const [confirm, setConfirm] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const t = quoteTotals(q)
  return (
    <div className="q-row" role="row">
      <span className="mono q-num">{q.number}<small className="muted">{fmtShort(q._creationTime)}</small></span>
      <span className="q-who"><b>{q.title}</b><small className="muted">{q.clientName}{q.company ? ` · ${q.company}` : ''}</small></span>
      <span className="mono q-total">{fmtSAR(t.total)} <small>ريال</small></span>
      <span>
        <select className={`q-status q-${q.status}`} aria-label="حالة العرض" value={q.status} onChange={(e) => void setStatus({ id: q._id, status: e.target.value as Quote['status'] })}>
          {(Object.keys(QUOTE_STATUS) as Array<Quote['status']>).map((k) => <option key={k} value={k}>{QUOTE_STATUS[k]}</option>)}
        </select>
      </span>
      <span className="q-actions">
        <button className="btn ghost small" type="button" onClick={onPrint}>PDF</button>
        <button className="btn ghost small" type="button" onClick={onEdit}>تعديل</button>
        {q.projectId ? <span className="src ok">صار مشروعاً</span> : q.status === 'accepted' && (
          <button className="btn small" type="button" onClick={async () => {
            const r = await toProject({ id: q._id, platform: '—' })
            setMsg(r.ok ? 'تم إنشاء المشروع بجدول دفعات 40/30/30' : r.error)
          }}>تحويل لمشروع</button>
        )}
        {canAdmin && (confirm
          ? <button className="btn danger small" type="button" onClick={() => void remove({ id: q._id })}>تأكيد الحذف</button>
          : <button className="linkish danger-link" type="button" onClick={() => setConfirm(true)}>حذف</button>)}
      </span>
      {msg && <small className="q-msg">{msg}</small>}
    </div>
  )
}

function QuoteForm({ draft, leads, catalog, onClose }: { draft: Draft; leads: Array<Lead>; catalog: Catalog; onClose: () => void }) {
  const save = useMutation(api.quotes.save)
  const [d, setD] = useState<Draft>(draft)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const t = quoteTotals(d)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const setItem = (i: number, patch: Partial<Draft['items'][number]>) => set('items', d.items.map((it, k) => (k === i ? { ...it, ...patch } : it)))
  const options = catalog.flatMap((s) => [...s.tiers, ...s.addons].map((o) => ({ s, o })))

  return (
    <div className="panel q-form">
      <div className="q-form-head">
        <div><span className="kicker">{d.id ? 'تعديل عرض سعر' : 'عرض سعر جديد'}</span><h2>{d.title || 'بدون عنوان'}</h2></div>
        <button className="btn ghost small" type="button" onClick={onClose}>رجوع للقائمة</button>
      </div>
      <div className="q-form-grid">
        <div className="form flat">
          {!d.id && leads.length > 0 && (
            <div className="field full">
              <label htmlFor="q-lead">من طلب موجود (اختياري)</label>
              <select id="q-lead" value={d.leadId ?? ''} onChange={(e) => {
                const l = leads.find((x) => x._id === e.target.value)
                setD(l ? { ...draftFromLead(l), items: d.items.length ? d.items : draftFromLead(l).items } : { ...d, leadId: undefined })
              }}>
                <option value="">— بدون —</option>
                {leads.map((l) => <option key={l._id} value={l._id}>{l.name}{l.company ? ` · ${l.company}` : ''}</option>)}
              </select>
            </div>
          )}
          <div className="field"><label htmlFor="q-name">اسم العميل</label><input id="q-name" value={d.clientName} onChange={(e) => set('clientName', e.target.value)} /></div>
          <div className="field"><label htmlFor="q-company">الشركة</label><input id="q-company" value={d.company} onChange={(e) => set('company', e.target.value)} placeholder="اختياري" /></div>
          <div className="field"><label htmlFor="q-email">بريد العميل</label><input id="q-email" dir="ltr" type="email" value={d.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} /></div>
          <div className="field"><label htmlFor="q-title">عنوان العرض</label><input id="q-title" value={d.title} onChange={(e) => set('title', e.target.value)} placeholder="مثال: متجر إلكتروني لمؤسسة الريان" /></div>

          <div className="field full">
            <span className="lbl">البنود</span>
            <div className="q-items">
              {d.items.map((it, i) => (
                <div className="q-item" key={i}>
                  <input className="input" value={it.label} onChange={(e) => setItem(i, { label: e.target.value })} aria-label="البند" />
                  <input className="input mono" type="number" min={1} value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) || 1 })} aria-label="الكمية" />
                  <input className="input mono" type="number" min={0} step={100} value={it.price} onChange={(e) => setItem(i, { price: Number(e.target.value) || 0 })} aria-label="السعر" />
                  <b className="mono">{fmtSAR(it.qty * it.price)}</b>
                  <button className="icon-x" type="button" aria-label="حذف البند" onClick={() => set('items', d.items.filter((_, k) => k !== i))}>×</button>
                </div>
              ))}
              {d.items.length === 0 && <p className="muted q-hint">أضف بنوداً من قائمة الأسعار أو بنداً مخصصاً.</p>}
            </div>
            <div className="q-add">
              <select aria-label="إضافة من قائمة الأسعار" value="" onChange={(e) => {
                const hit = options[Number(e.target.value)]
                if (hit) set('items', [...d.items, { label: `${hit.s.label} — ${hit.o.label}`, qty: 1, price: hit.o.price }])
              }}>
                <option value="">+ إضافة من قائمة الأسعار…</option>
                {catalog.map((s) => (
                  <optgroup key={s.key} label={s.label}>
                    {[...s.tiers, ...s.addons].map((o) => {
                      const idx = options.findIndex((x) => x.s === s && x.o === o)
                      return <option key={idx} value={idx}>{o.label} · {fmtSAR(o.price)}</option>
                    })}
                  </optgroup>
                ))}
              </select>
              <button className="btn ghost small" type="button" onClick={() => set('items', [...d.items, { label: 'بند مخصص', qty: 1, price: 0 }])}>+ بند مخصص</button>
            </div>
          </div>

          <div className="field"><label htmlFor="q-disc">خصم (ريال)</label><input id="q-disc" className="mono" type="number" min={0} step={100} value={d.discount} onChange={(e) => set('discount', Number(e.target.value) || 0)} /></div>
          <div className="field"><label htmlFor="q-valid">صلاحية العرض (يوم)</label><input id="q-valid" className="mono" type="number" min={1} max={180} value={d.validDays} onChange={(e) => set('validDays', Number(e.target.value) || 14)} /></div>
          <label className="field full check-line"><input type="checkbox" checked={d.vat} onChange={(e) => set('vat', e.target.checked)} /> إضافة ضريبة القيمة المضافة 15%</label>
          <div className="field full"><label htmlFor="q-notes">ملاحظات وشروط تظهر في العرض</label><textarea id="q-notes" rows={3} value={d.notes} onChange={(e) => set('notes', e.target.value)} placeholder="مثال: يشمل العرض 3 جولات تعديل على التصميم، ودعماً فنياً لمدة 3 أشهر." /></div>
        </div>

        <aside className="q-totals">
          <span className="kicker">ملخص العرض</span>
          <div className="est-row"><span>المجموع</span><b className="mono">{fmtSAR(t.subtotal)}</b></div>
          {d.discount > 0 && <div className="est-row"><span>الخصم</span><b className="mono">−{fmtSAR(d.discount)}</b></div>}
          {d.vat && <div className="est-row"><span>الضريبة 15%</span><b className="mono">{fmtSAR(t.vat)}</b></div>}
          <div className="est-price"><span>الإجمالي</span><b className="mono">{fmtSAR(t.total)} <small>ريال</small></b></div>
          <div className="est-row"><span>دفعة أولى 40%</span><b className="mono">{fmtSAR(Math.round(t.total * 0.4))}</b></div>
          {err && <div className="sent err">{err}</div>}
          <button className="btn" type="button" disabled={busy} onClick={async () => {
            setBusy(true); setErr(null)
            const r = await save({
              ...(d.id ? { id: d.id } : {}), clientName: d.clientName, clientEmail: d.clientEmail, company: d.company, title: d.title,
              ...(d.leadId ? { leadId: d.leadId } : {}), items: d.items, discount: d.discount, vat: d.vat, validDays: d.validDays, notes: d.notes,
            })
            setBusy(false)
            if (r.ok) onClose(); else setErr(r.error)
          }}>{busy ? 'جارٍ الحفظ…' : 'حفظ العرض'}</button>
          <small className="muted">بعد الحفظ تقدر تطبعه PDF وترسله للعميل، وإذا قَبِل حوّله لمشروع بجدول دفعات تلقائي.</small>
        </aside>
      </div>
    </div>
  )
}

export function QuotePrint({ q, onClose }: { q: Quote; onClose: () => void }) {
  const s = (useQuery(api.settings.get) as SiteSettings | undefined) ?? DEFAULT_SETTINGS
  const t = quoteTotals(q)
  const date = new Intl.DateTimeFormat('ar-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' })
  useEffect(() => {
    document.documentElement.classList.add('printing')
    return () => document.documentElement.classList.remove('printing')
  }, [])
  return (
    <div className="print-overlay" role="dialog" aria-label={`عرض السعر ${q.number}`}>
      <div className="print-bar">
        <b>معاينة عرض السعر</b>
        <span style={{ display: 'flex', gap: 8 }}>
          <button className="btn small" type="button" onClick={() => window.print()}>طباعة / حفظ PDF</button>
          <button className="btn ghost small" type="button" onClick={onClose}>إغلاق</button>
        </span>
      </div>
      <article className="sheet">
        <header className="sheet-head">
          <div className="sheet-brand"><LogoMark height={44} /><div><b>{COMPANY.name}</b><small>MAKWAD STUDIO</small></div></div>
          <div className="sheet-meta"><h1>عرض سعر</h1><span className="mono">{q.number}</span><span>{date.format(q._creationTime)}</span></div>
        </header>
        <div className="sheet-parties">
          <div><small>مقدّم إلى</small><b>{q.clientName}</b>{q.company && <span>{q.company}</span>}<span className="mono">{q.clientEmail}</span></div>
          <div><small>من</small><b>{COMPANY.name}</b><span>{s.address}</span><span className="mono">{s.email}</span></div>
        </div>
        <h2 className="sheet-title">{q.title}</h2>
        <table className="sheet-table">
          <thead><tr><th>#</th><th>البند</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead>
          <tbody>
            {q.items.map((it, i) => (
              <tr key={i}><td className="mono">{i + 1}</td><td>{it.label}</td><td className="mono">{it.qty}</td><td className="mono">{fmtSAR(it.price)}</td><td className="mono">{fmtSAR(it.qty * it.price)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="sheet-totals">
          <div><span>المجموع</span><b className="mono">{fmtSAR(t.subtotal)}</b></div>
          {q.discount > 0 && <div><span>الخصم</span><b className="mono">−{fmtSAR(q.discount)}</b></div>}
          {q.vat && <div><span>ضريبة القيمة المضافة 15%</span><b className="mono">{fmtSAR(t.vat)}</b></div>}
          <div className="grand"><span>الإجمالي (ريال سعودي)</span><b className="mono">{fmtSAR(t.total)}</b></div>
        </div>
        <div className="sheet-terms">
          <h3>الشروط</h3>
          <ul>
            <li>الدفعات: 40% عند البدء، 30% عند اعتماد التصميم، 30% عند التسليم.</li>
            <li>العرض صالح لمدة {q.validDays} يوماً من تاريخه{q.vat ? '' : '، والأسعار لا تشمل ضريبة القيمة المضافة إن وُجدت'}.</li>
            <li>تنتقل ملكية الشيفرة المصدرية والتصاميم للعميل بعد سداد كامل المبلغ.</li>
            {q.notes && <li>{q.notes}</li>}
          </ul>
        </div>
        <footer className="sheet-foot"><span>{COMPANY.name} · {COMPANY.city}</span><span className="mono">{s.email}</span></footer>
      </article>
    </div>
  )
}

/* =================== PRICING EDITOR =================== */

const clone = (c: Catalog): Catalog => JSON.parse(JSON.stringify(c)) as Catalog

export function PricingPanel() {
  const current = useQuery(api.settings.get) as SiteSettings | undefined
  const save = useMutation(api.settings.updatePricing)
  const [list, setList] = useState<Catalog | null>(null)
  const [base, setBase] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (current && list === null) {
      const src = Array.isArray(current.pricing) && current.pricing.length ? current.pricing : SERVICE_PRICING
      // keep built-in services the saved catalog does not know about yet
      const merged = [...src, ...SERVICE_PRICING.filter((d) => !src.some((x) => x.key === d.key))]
      setList(clone(merged)); setBase(JSON.stringify(merged))
    }
  }, [current, list])
  if (!list) return <p className="muted">جارٍ تحميل الأسعار…</p>
  const dirty = JSON.stringify(list) !== base
  const patch = (k: string, f: (s: Service) => Service) => setList((l) => l && l.map((s) => (s.key === k ? f(s) : s)))
  const setOpt = (k: string, group: 'tiers' | 'addons', i: number, p: Partial<Option>) =>
    patch(k, (s) => ({ ...s, [group]: s[group].map((o, j) => (j === i ? { ...o, ...p } : o)) }))
  const minPrice = Math.min(...list.filter((s) => !s.hidden).flatMap((s) => s.tiers.map((t) => t.price)))

  return (
    <div className="stack">
      <div className="panel panel-pad pr-head">
        <div>
          <h3>الأسعار والخدمات</h3>
          <p className="muted">أي تعديل هنا يظهر مباشرة في بطاقات الخدمات وحاسبة الأسعار وعروض الأسعار. أقل سعر حالياً: <b className="mono">{fmtSAR(minPrice)}</b> ريال.</p>
        </div>
        <div className="pr-actions">
          {dirty && <span className="badge-s st-contacted">تغييرات غير محفوظة</span>}
          <button className="btn ghost small" type="button" onClick={async () => {
            setBusy(true); const r = await save({ pricing: null }); setBusy(false)
            if (r.ok) { setList(clone(SERVICE_PRICING)); setBase(JSON.stringify(SERVICE_PRICING)); setState({ ok: true, text: 'رجعت الأسعار الافتراضية.' }) }
          }}>استرجاع الافتراضي</button>
          <button className="btn small" type="button" disabled={!dirty || busy} onClick={async () => {
            setBusy(true); setState(null)
            const r = await save({ pricing: list })
            setBusy(false)
            if (r.ok) { setBase(JSON.stringify(list)); setState({ ok: true, text: 'تم حفظ الأسعار، وتظهر في الموقع الآن.' }) } else setState({ ok: false, text: r.error })
          }}>{busy ? 'جارٍ الحفظ…' : 'حفظ الأسعار'}</button>
        </div>
      </div>
      {state && <div className={state.ok ? 'sent' : 'sent err'} role="status">{state.text}</div>}
      <div className="pr-list">
        {list.map((s) => {
          const from = Math.min(...s.tiers.map((t) => t.price))
          const isOpen = open === s.key
          return (
            <div key={s.key} className={s.hidden ? 'panel pr-svc off' : 'panel pr-svc'}>
              <div className="pr-svc-head">
                <button type="button" className="pr-toggle" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.key)}>
                  <b>{s.label}</b>
                  <small className="muted">{s.tiers.length} مستويات · {s.addons.length} إضافة</small>
                </button>
                <span className="pr-from"><small>يبدأ من</small><b className="mono">{fmtSAR(from)}</b>{s.monthly && <small>/ شهر</small>}</span>
                <label className="switch"><input type="checkbox" checked={!s.hidden} onChange={(e) => patch(s.key, (x) => ({ ...x, hidden: !e.target.checked }))} /><span>{s.hidden ? 'مخفية' : 'ظاهرة'}</span></label>
              </div>
              {isOpen && (
                <div className="pr-body">
                  <div className="pr-row2">
                    <div className="field"><label>اسم الخدمة</label><input className="input" value={s.label} onChange={(e) => patch(s.key, (x) => ({ ...x, label: e.target.value }))} /></div>
                    <div className="field"><label>ملاحظة تحت الحاسبة</label><input className="input" value={s.note ?? ''} onChange={(e) => patch(s.key, (x) => ({ ...x, note: e.target.value }))} placeholder="اختياري" /></div>
                  </div>
                  {(['tiers', 'addons'] as const).map((g) => (
                    <div key={g} className="pr-group">
                      <div className="pr-group-head"><b>{g === 'tiers' ? s.tierLabel : 'الإضافات'}</b><span className="muted">السعر بالريال{g === 'tiers' ? ' · المدة بأيام العمل' : ''}</span></div>
                      <div className="pr-opts">
                        <div className="pr-opt pr-th"><span>البند</span><span>الوصف</span><span>السعر</span><span>المدة</span><span /></div>
                        {s[g].map((o, i) => (
                          <div className="pr-opt" key={o.key + i}>
                            <input className="input" value={o.label} onChange={(e) => setOpt(s.key, g, i, { label: e.target.value })} aria-label="البند" />
                            <input className="input" value={o.hint ?? ''} onChange={(e) => setOpt(s.key, g, i, { hint: e.target.value })} aria-label="الوصف" />
                            <input className="input mono" type="number" min={0} step={100} value={o.price} onChange={(e) => setOpt(s.key, g, i, { price: Number(e.target.value) || 0 })} aria-label="السعر" />
                            <input className="input mono" type="number" min={0} value={o.days} onChange={(e) => setOpt(s.key, g, i, { days: Number(e.target.value) || 0 })} aria-label="المدة" />
                            <button className="icon-x" type="button" aria-label="حذف" disabled={g === 'tiers' && s.tiers.length < 2} onClick={() => patch(s.key, (x) => ({ ...x, [g]: x[g].filter((_, j) => j !== i) }))}>×</button>
                          </div>
                        ))}
                      </div>
                      <button className="linkish" type="button" onClick={() => patch(s.key, (x) => ({ ...x, [g]: [...x[g], { key: `n${Date.now()}`, label: 'بند جديد', hint: '', price: 1000, days: 3 }] }))}>+ إضافة بند</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
