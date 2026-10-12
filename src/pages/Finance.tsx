// Admin finance: revenue, costs, profit, invoices, and payment channels.
import { useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { fmtSAR } from '@/estimate'
import { DEFAULT_SETTINGS } from '@/site-config'
import type { SiteSettings } from '@/site-config'
import { InvoicePrint, VAT_RATE } from '@/pages/AdminExtras'
import { PAY_PROVIDERS, defaultMethods } from '@/components/PayMethods'
import type { PayMethod } from '@/components/PayMethods'

type Project = Doc<'projects'>
type Tx = Doc<'transactions'>
type Pay = { title: string; amount: number; status: 'pending' | 'due' | 'paid'; paidAt?: string; method?: string }

const EXPENSE_CATS = ['رواتب وأجور', 'مستقلون ومقاولون', 'استضافة وخوادم', 'اشتراكات وبرامج', 'تسويق وإعلانات', 'أجهزة وأدوات', 'رسوم حكومية', 'رسوم بوابات الدفع', 'مكتب وإيجار', 'نقل ومواصلات', 'أخرى']
const INCOME_CATS = ['مشروع', 'صيانة شهرية', 'استضافة', 'استشارة', 'أخرى']
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

const today = () => new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10)
const dayOf = (ms: number) => new Date(ms + 3 * 3600_000).toISOString().slice(0, 10)

type Entry = { date: string; kind: 'income' | 'expense'; category: string; description: string; amount: number; vat: number; source: 'project' | 'manual'; method?: string; projectId?: string; tx?: Tx }

// Expand recurring entries (monthly / yearly) from their start date until today.
function expand(t: Tx): Array<Entry> {
  const base: Entry = { date: t.date, kind: t.kind, category: t.category, description: t.description, amount: t.amount, vat: t.vat ?? 0, source: 'manual', method: t.method, projectId: t.projectId, tx: t }
  if (!t.recurring) return [base]
  const out: Array<Entry> = []
  const [y, m, d] = t.date.split('-').map(Number)
  const end = today()
  for (let i = 0; i < 120; i++) {
    const dt = t.recurring === 'monthly' ? new Date(Date.UTC(y, m - 1 + i, d)) : new Date(Date.UTC(y + i, m - 1, d))
    const iso = dt.toISOString().slice(0, 10)
    if (iso > end) break
    out.push({ ...base, date: iso, description: i ? `${t.description} (متكرر)` : t.description })
  }
  return out
}

function projectEntries(projects: Array<Project>): Array<Entry> {
  return projects.flatMap((p) => ((p.payments ?? []) as Array<Pay>).filter((x) => x.status === 'paid').map((x) => ({
    date: x.paidAt ?? dayOf(p._creationTime), kind: 'income' as const, category: 'مشروع', description: `${x.title} — ${p.title}`,
    amount: x.amount, vat: 0, source: 'project' as const, method: x.method, projectId: p._id,
  })))
}

type Period = 'month' | 'quarter' | 'year' | 'all'
const PERIODS: Record<Period, string> = { month: 'هذا الشهر', quarter: 'آخر 3 أشهر', year: 'هذه السنة', all: 'الكل' }
function inPeriod(date: string, p: Period) {
  const t = today()
  if (p === 'all') return true
  if (p === 'month') return date.slice(0, 7) === t.slice(0, 7)
  if (p === 'year') return date.slice(0, 4) === t.slice(0, 4)
  const d = new Date(t); d.setMonth(d.getMonth() - 2); d.setDate(1)
  return date >= d.toISOString().slice(0, 10) && date <= t
}

export function FinancePanel({ projects }: { projects: Array<Project> }) {
  const res = useQuery(api.finance.list) as { status: 'ok'; transactions: Array<Tx> } | { status: 'forbidden' } | undefined
  const s = (useQuery(api.settings.get) as SiteSettings | undefined) ?? DEFAULT_SETTINGS
  const [period, setPeriod] = useState<Period>('year')
  const [tab, setTab] = useState<'ledger' | 'invoices' | 'projects'>('ledger')
  const [form, setForm] = useState<TxDraft | null>(null)
  const txs = res?.status === 'ok' ? res.transactions : []

  const all = useMemo(() => [...projectEntries(projects), ...txs.flatMap(expand)].sort((a, b) => b.date.localeCompare(a.date)), [projects, txs])
  const shown = all.filter((e) => inPeriod(e.date, period))
  const income = shown.filter((e) => e.kind === 'income').reduce((n, e) => n + e.amount, 0)
  const expense = shown.filter((e) => e.kind === 'expense').reduce((n, e) => n + e.amount, 0)
  const net = income - expense
  const margin = income ? Math.round((net / income) * 100) : 0
  const pays = projects.flatMap((p) => ((p.payments ?? []) as Array<Pay>).map((x, i) => ({ ...x, p, i })))
  const due = pays.filter((x) => x.status === 'due').reduce((n, x) => n + x.amount, 0)
  const upcoming = pays.filter((x) => x.status === 'pending').reduce((n, x) => n + x.amount, 0)
  const vatOn = !!s.vatNumber
  const outVat = vatOn ? Math.round(shown.filter((e) => e.kind === 'income').reduce((n, e) => n + (e.source === 'project' ? e.amount * VAT_RATE / (1 + VAT_RATE) : e.vat), 0)) : 0
  const inVat = Math.round(shown.filter((e) => e.kind === 'expense').reduce((n, e) => n + e.vat, 0))

  // last 12 months
  const months = useMemo(() => {
    const t = new Date(today())
    return Array.from({ length: 12 }, (_, k) => {
      const d = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() - (11 - k), 1))
      const key = d.toISOString().slice(0, 7)
      const inc = all.filter((e) => e.kind === 'income' && e.date.startsWith(key)).reduce((n, e) => n + e.amount, 0)
      const exp = all.filter((e) => e.kind === 'expense' && e.date.startsWith(key)).reduce((n, e) => n + e.amount, 0)
      return { key, label: MONTHS[d.getUTCMonth()], inc, exp }
    })
  }, [all])
  const max = Math.max(1, ...months.flatMap((m) => [m.inc, m.exp]))
  const cats = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of shown) if (e.kind === 'expense') m.set(e.category, (m.get(e.category) ?? 0) + e.amount)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [shown])
  const maxCat = Math.max(1, ...cats.map((c) => c[1]))

  if (res?.status === 'forbidden') return <p className="muted">المالية للمدراء فقط.</p>
  return (
    <div className="stack fin">
      <div className="fin-bar">
        <div className="filters" style={{ margin: 0 }}>
          {(Object.keys(PERIODS) as Array<Period>).map((k) => <button key={k} type="button" aria-pressed={period === k} onClick={() => setPeriod(k)}>{PERIODS[k]}</button>)}
        </div>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn ghost small" type="button" onClick={() => setForm(newTx('expense'))}>+ مصروف</button>
          <button className="btn small" type="button" onClick={() => setForm(newTx('income'))}>+ إيراد</button>
        </span>
      </div>
      {form && <TxForm draft={form} projects={projects} onClose={() => setForm(null)} />}

      <div className="ov-kpis fin-kpis">
        <div className="ov-kpi good"><small>الإيرادات</small><b><span className="mono">{fmtSAR(income)}</span><em>ريال</em></b><span className="muted">{PERIODS[period]}</span></div>
        <div className="ov-kpi warn"><small>المصروفات</small><b><span className="mono">{fmtSAR(expense)}</span><em>ريال</em></b><span className="muted">{cats[0] ? `أكبرها: ${cats[0][0]}` : 'لا توجد مصروفات'}</span></div>
        <div className={net >= 0 ? 'ov-kpi good' : 'ov-kpi warn'}><small>صافي الربح</small><b><span className="mono">{net < 0 ? '−' : ''}{fmtSAR(Math.abs(net))}</span><em>ريال</em></b><span className="muted">هامش الربح {margin}%</span></div>
        <div className="ov-kpi"><small>مستحق على العملاء</small><b><span className="mono">{fmtSAR(due)}</span><em>ريال</em></b><span className="muted">ودفعات قادمة {fmtSAR(upcoming)} ريال</span></div>
        <div className="ov-kpi"><small>{vatOn ? 'ضريبة القيمة المضافة المستحقة' : 'ضريبة المشتريات المدفوعة'}</small><b><span className="mono">{fmtSAR(vatOn ? Math.max(0, outVat - inVat) : inVat)}</span><em>ريال</em></b><span className="muted">{vatOn ? `مخرجات ${fmtSAR(outVat)} − مدخلات ${fmtSAR(inVat)}` : 'غير مسجل في الضريبة'}</span></div>
        <div className="ov-kpi"><small>متوسط الإيراد الشهري</small><b><span className="mono">{fmtSAR(Math.round(months.reduce((n, m) => n + m.inc, 0) / 12))}</span><em>ريال</em></b><span className="muted">آخر 12 شهراً</span></div>
      </div>

      <div className="ov-grid">
        <div className="panel ov-card ov-wide">
          <div className="ov-card-head"><b>الإيرادات والمصروفات شهرياً</b><div className="legend"><span><i className="sw inc" />إيرادات</span><span><i className="sw exp" />مصروفات</span></div></div>
          <div className="fin-chart" role="img" aria-label="الإيرادات والمصروفات لآخر 12 شهراً">
            {months.map((m) => (
              <div className="fin-col" key={m.key} title={`${m.label}: إيرادات ${fmtSAR(m.inc)} · مصروفات ${fmtSAR(m.exp)}`}>
                <div className="fin-bars"><i className="inc" style={{ height: `${(m.inc / max) * 100}%` }} /><i className="exp" style={{ height: `${(m.exp / max) * 100}%` }} /></div>
                <span>{m.label.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel ov-card">
          <div className="ov-card-head"><b>المصروفات حسب البند</b><span className="muted">{PERIODS[period]}</span></div>
          {cats.length === 0 ? <p className="muted ov-empty">سجّل مصروفاتك (اشتراكات، استضافة، رواتب…) لتعرف ربحك الحقيقي.</p> : (
            <ul className="hbars">{cats.map(([c, n]) => <li key={c}><span>{c}</span><div><i style={{ width: `${(n / maxCat) * 100}%` }} /></div><b className="mono">{fmtSAR(n)}</b></li>)}</ul>
          )}
        </div>
        <div className="panel ov-card">
          <div className="ov-card-head"><b>التحصيل</b><span className="muted">كل المشاريع</span></div>
          <ul className="fin-collect">
            <li><span>محصّل</span><b className="mono">{fmtSAR(pays.filter((x) => x.status === 'paid').reduce((n, x) => n + x.amount, 0))}</b></li>
            <li><span>مستحق الآن</span><b className="mono warn">{fmtSAR(due)}</b></li>
            <li><span>دفعات قادمة</span><b className="mono">{fmtSAR(upcoming)}</b></li>
            <li className="tot"><span>إجمالي العقود</span><b className="mono">{fmtSAR(pays.reduce((n, x) => n + x.amount, 0))}</b></li>
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="tabs fin-tabs" role="tablist">
          <button role="tab" type="button" aria-selected={tab === 'ledger'} onClick={() => setTab('ledger')}>دفتر الحركات</button>
          <button role="tab" type="button" aria-selected={tab === 'invoices'} onClick={() => setTab('invoices')}>الفواتير والدفعات</button>
          <button role="tab" type="button" aria-selected={tab === 'projects'} onClick={() => setTab('projects')}>ربحية المشاريع</button>
        </div>
        {tab === 'ledger' && <Ledger entries={shown} onEdit={(t) => setForm({ ...t, id: t._id, vatIncluded: !!t.vat, recurring: t.recurring ?? '', projectId: t.projectId ?? '', method: t.method ?? '' })} />}
        {tab === 'invoices' && <Invoices projects={projects} />}
        {tab === 'projects' && <Profitability projects={projects} entries={all} />}
      </div>
    </div>
  )
}

function Ledger({ entries, onEdit }: { entries: Array<Entry>; onEdit: (t: Tx) => void }) {
  const remove = useMutation(api.finance.remove)
  const csv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const rows = entries.map((e) => [e.date, e.kind === 'income' ? 'إيراد' : 'مصروف', e.category, e.description, String(e.amount), String(e.vat || ''), e.method ?? '', e.source === 'project' ? 'دفعة مشروع' : 'يدوي'].map(esc).join(','))
    const blob = new Blob(['﻿' + [['التاريخ', 'النوع', 'البند', 'الوصف', 'المبلغ', 'الضريبة', 'طريقة الدفع', 'المصدر'].map(esc).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `makwad-finance-${today()}.csv`; a.click()
  }
  return (
    <div>
      <div className="panel-pad toolbar"><span className="muted" style={{ fontSize: '.86rem' }}>دفعات المشاريع المدفوعة تنضاف تلقائياً كإيرادات. سجّل هنا المصروفات وأي دخل خارج المشاريع.</span><button className="btn ghost small" type="button" onClick={csv} disabled={!entries.length}>تصدير Excel (CSV)</button></div>
      {entries.length === 0 ? <div className="empty"><h3>لا توجد حركات في هذه الفترة</h3></div> : (
        <div className="ledger">
          {entries.slice(0, 300).map((e, k) => (
            <div className="led-row" key={k}>
              <span className="mono led-date">{e.date}</span>
              <span className={`led-kind ${e.kind}`}>{e.kind === 'income' ? 'إيراد' : 'مصروف'}</span>
              <span className="led-desc"><b>{e.description}</b><small className="muted">{e.category}{e.method ? ` · ${e.method}` : ''}{e.source === 'project' ? ' · من دفعات المشاريع' : ''}{e.tx?.recurring ? ` · ${e.tx.recurring === 'monthly' ? 'شهري' : 'سنوي'}` : ''}</small></span>
              <b className={`mono led-amt ${e.kind}`}>{e.kind === 'expense' ? '−' : '+'}{fmtSAR(e.amount)}</b>
              <span className="q-actions">{e.tx && !e.description.endsWith('(متكرر)') && (<>
                <button className="linkish" type="button" onClick={() => onEdit(e.tx!)}>تعديل</button>
                <button className="linkish danger-link" type="button" onClick={() => void remove({ id: e.tx!._id })}>حذف</button>
              </>)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Invoices({ projects }: { projects: Array<Project> }) {
  const update = useMutation(api.app.updateProject)
  const [inv, setInv] = useState<{ p: Project; i: number } | null>(null)
  const [filter, setFilter] = useState<'all' | Pay['status']>('all')
  const [paying, setPaying] = useState<string | null>(null)
  const [method, setMethod] = useState('تحويل بنكي')
  const rows = projects.flatMap((p) => ((p.payments ?? []) as Array<Pay>).map((x, i) => ({ x, i, p }))).filter((r) => filter === 'all' || r.x.status === filter)
  const LBL: Record<Pay['status'], string> = { paid: 'مدفوعة', due: 'مستحقة', pending: 'لاحقة' }
  const markPaid = async (p: Project, i: number) => {
    const payments = ((p.payments ?? []) as Array<Pay>).map((x, k) => (k === i ? { ...x, status: 'paid' as const, paidAt: today(), method } : x))
    await update({ id: p._id, payments })
    setPaying(null)
  }
  return (
    <div>
      <div className="panel-pad toolbar">
        <div className="filters" style={{ margin: 0 }}>
          {(['all', 'due', 'pending', 'paid'] as const).map((k) => <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{k === 'all' ? 'الكل' : LBL[k]}</button>)}
        </div>
      </div>
      {rows.length === 0 ? <div className="empty"><h3>لا توجد دفعات</h3><p>أضف جدول الدفعات من المشروع، أو حوّل عرض سعر مقبول لمشروع ليُنشأ تلقائياً.</p></div> : (
        <div className="ledger">
          {rows.map(({ x, i, p }) => {
            const key = `${p._id}-${i}`
            return (
              <div className="led-row inv-row" key={key}>
                <span className={`badge-s pay-${x.status}`}>{LBL[x.status]}</span>
                <span className="led-desc"><b>{x.title}</b><small className="muted">{p.title} · {p.clientName}{x.paidAt ? ` · دُفعت ${x.paidAt}` : ''}{x.method ? ` · ${x.method}` : ''}</small></span>
                <b className="mono led-amt">{fmtSAR(x.amount)}</b>
                <span className="q-actions">
                  <button className="btn ghost small" type="button" onClick={() => setInv({ p, i })}>الفاتورة</button>
                  {x.status !== 'paid' && (paying === key ? (
                    <>
                      <select className="input" style={{ padding: '4px 8px', fontSize: '.82rem', width: 'auto' }} value={method} onChange={(e) => setMethod(e.target.value)} aria-label="طريقة الدفع">
                        {['تحويل بنكي', ...PAY_PROVIDERS.filter((m) => m.key !== 'bank').map((m) => m.label)].map((m) => <option key={m}>{m}</option>)}
                      </select>
                      <button className="btn small" type="button" onClick={() => void markPaid(p, i)}>تأكيد الاستلام</button>
                    </>
                  ) : <button className="btn small" type="button" onClick={() => setPaying(key)}>تسجيل كمدفوعة</button>)}
                </span>
              </div>
            )
          })}
        </div>
      )}
      {inv && <InvoicePrint p={inv.p} index={inv.i} onClose={() => setInv(null)} />}
    </div>
  )
}

function Profitability({ projects, entries }: { projects: Array<Project>; entries: Array<Entry> }) {
  const rows = projects.map((p) => {
    const paid = ((p.payments ?? []) as Array<Pay>).filter((x) => x.status === 'paid').reduce((n, x) => n + x.amount, 0)
    const total = ((p.payments ?? []) as Array<Pay>).reduce((n, x) => n + x.amount, 0)
    const cost = entries.filter((e) => e.kind === 'expense' && e.projectId === p._id).reduce((n, e) => n + e.amount, 0)
    const extra = entries.filter((e) => e.kind === 'income' && e.source === 'manual' && e.projectId === p._id).reduce((n, e) => n + e.amount, 0)
    return { p, paid: paid + extra, total, cost, profit: paid + extra - cost }
  }).sort((a, b) => b.profit - a.profit)
  return (
    <div>
      <div className="panel-pad"><span className="muted" style={{ fontSize: '.86rem' }}>اربط المصروفات بالمشروع (مثل مستقل أو استضافة خاصة بعميل) لتعرف ربح كل مشروع بدقة.</span></div>
      <div className="ledger">
        <div className="led-row prof-row q-th"><span>المشروع</span><span>قيمة العقد</span><span>المحصّل</span><span>التكاليف</span><span>الربح</span></div>
        {rows.map((r) => (
          <div className="led-row prof-row" key={r.p._id}>
            <span className="led-desc"><b>{r.p.title}</b><small className="muted">{r.p.clientName}</small></span>
            <span className="mono">{fmtSAR(r.total)}</span>
            <span className="mono">{fmtSAR(r.paid)}</span>
            <span className="mono">{fmtSAR(r.cost)}</span>
            <b className={`mono ${r.profit >= 0 ? 'income' : 'expense'}`}>{fmtSAR(r.profit)} <small className="muted">{r.paid ? `${Math.round((r.profit / r.paid) * 100)}%` : ''}</small></b>
          </div>
        ))}
      </div>
    </div>
  )
}

type TxDraft = { id?: Id<'transactions'>; kind: 'income' | 'expense'; date: string; category: string; description: string; amount: number; vatIncluded: boolean; projectId: string; method: string; recurring: '' | 'monthly' | 'yearly' }
const newTx = (kind: TxDraft['kind']): TxDraft => ({ kind, date: today(), category: kind === 'expense' ? EXPENSE_CATS[3] : INCOME_CATS[0], description: '', amount: 0, vatIncluded: false, projectId: '', method: '', recurring: '' })

function TxForm({ draft, projects, onClose }: { draft: TxDraft; projects: Array<Project>; onClose: () => void }) {
  const save = useMutation(api.finance.save)
  const [d, setD] = useState<TxDraft>(draft)
  const [err, setErr] = useState<string | null>(null)
  const set = <K extends keyof TxDraft>(k: K, v: TxDraft[K]) => setD((x) => ({ ...x, [k]: v }))
  const vat = d.vatIncluded ? Math.round((d.amount * VAT_RATE / (1 + VAT_RATE)) * 100) / 100 : 0
  return (
    <div className="panel cp">
      <div className="panel-pad pr-head"><div><h3>{d.id ? 'تعديل' : 'تسجيل'} {d.kind === 'income' ? 'إيراد' : 'مصروف'}</h3></div>
        <div className="filters" style={{ margin: 0 }}>
          <button type="button" aria-pressed={d.kind === 'expense'} onClick={() => setD((x) => ({ ...x, kind: 'expense', category: EXPENSE_CATS[3] }))}>مصروف</button>
          <button type="button" aria-pressed={d.kind === 'income'} onClick={() => setD((x) => ({ ...x, kind: 'income', category: INCOME_CATS[0] }))}>إيراد</button>
        </div>
      </div>
      <div className="cp-form">
        <div className="field cp-note"><label htmlFor="tx-desc">الوصف</label><input id="tx-desc" className="input" value={d.description} onChange={(e) => set('description', e.target.value)} placeholder={d.kind === 'expense' ? 'مثال: اشتراك Figma' : 'مثال: استشارة لمتجر الريان'} /></div>
        <div className="field"><label htmlFor="tx-amt">المبلغ (ريال)</label><input id="tx-amt" className="input mono" type="number" min={0} step="0.01" value={d.amount || ''} onChange={(e) => set('amount', Number(e.target.value) || 0)} /></div>
        <div className="field"><label htmlFor="tx-cat">البند</label><select id="tx-cat" className="input" value={d.category} onChange={(e) => set('category', e.target.value)}>{(d.kind === 'expense' ? EXPENSE_CATS : INCOME_CATS).map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label htmlFor="tx-date">التاريخ</label><input id="tx-date" className="input" type="date" dir="ltr" value={d.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div className="field"><label htmlFor="tx-rec">التكرار</label><select id="tx-rec" className="input" value={d.recurring} onChange={(e) => set('recurring', e.target.value as TxDraft['recurring'])}><option value="">مرة واحدة</option><option value="monthly">شهري</option><option value="yearly">سنوي</option></select></div>
        <div className="field"><label htmlFor="tx-proj">مرتبط بمشروع</label><select id="tx-proj" className="input" value={d.projectId} onChange={(e) => set('projectId', e.target.value)}><option value="">— عام —</option>{projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}</select></div>
        <div className="field"><label htmlFor="tx-m">طريقة الدفع</label><input id="tx-m" className="input" value={d.method} onChange={(e) => set('method', e.target.value)} placeholder="بطاقة، تحويل، نقد…" /></div>
        <label className="field check-line"><input type="checkbox" checked={d.vatIncluded} onChange={(e) => set('vatIncluded', e.target.checked)} /> المبلغ شامل ضريبة 15%{vat ? ` (الضريبة ${fmtSAR(vat)})` : ''}</label>
        <div className="cp-actions">
          <button className="btn small" type="button" onClick={async () => {
            setErr(null)
            const r = await save({
              ...(d.id ? { id: d.id } : {}), kind: d.kind, date: d.date, category: d.category, description: d.description, amount: d.amount,
              ...(vat ? { vat } : {}), ...(d.projectId ? { projectId: d.projectId } : {}), method: d.method, ...(d.recurring ? { recurring: d.recurring } : {}),
            })
            if (r.ok) onClose(); else setErr(r.error)
          }}>حفظ</button>
          <button className="btn ghost small" type="button" onClick={onClose}>إلغاء</button>
          {err && <span className="sent err">{err}</span>}
        </div>
      </div>
    </div>
  )
}

/* =================== PAYMENT CHANNELS =================== */

export function PaymentChannelsPanel() {
  const s = useQuery(api.settings.get) as SiteSettings | undefined
  const save = useMutation(api.settings.updatePayMethods)
  const [list, setList] = useState<Array<PayMethod> | null>(null)
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null)
  if (s && list === null) {
    const saved = (s.payMethods ?? []) as Array<PayMethod>
    setList(defaultMethods().map((d) => saved.find((x) => x.key === d.key) ?? d))
  }
  if (!s || !list) return <p className="muted">جارٍ التحميل…</p>
  const patch = (k: string, p: Partial<PayMethod>) => setList((l) => l && l.map((m) => (m.key === k ? { ...m, ...p } : m)))
  const on = list.filter((m) => m.enabled).length
  return (
    <div className="stack">
      <div className="panel panel-pad pr-head">
        <div>
          <h3>قنوات ومنصات الدفع</h3>
          <p className="muted">فعّل الطرق اللي تستقبل بها المدفوعات. تظهر للعميل في الفواتير وعروض الأسعار وفي بوابة العملاء بجانب كل دفعة مستحقة، مع زر «أبلغنا بالسداد». مفعّل الآن: {on}.</p>
        </div>
        <button className="btn small" type="button" onClick={async () => {
          setState(null)
          const r = await save({ methods: list })
          setState(r.ok ? { ok: true, text: 'تم حفظ قنوات الدفع.' } : { ok: false, text: r.error })
        }}>حفظ قنوات الدفع</button>
      </div>
      {state && <div className={state.ok ? 'sent' : 'sent err'} role="status">{state.text}</div>}
      <div className="pay-grid">
        {PAY_PROVIDERS.map((p) => {
          const m = list.find((x) => x.key === p.key)!
          return (
            <div key={p.key} className={m.enabled ? 'panel pay-card on' : 'panel pay-card'}>
              <div className="pay-card-head">
                <b>{p.label}</b>
                <label className="switch"><input type="checkbox" checked={m.enabled} onChange={(e) => patch(p.key, { enabled: e.target.checked })} /><span>{m.enabled ? 'مفعّل' : 'متوقف'}</span></label>
              </div>
              <p className="muted">{p.about}</p>
              {p.kind === 'bank' && <p className={s.iban ? 'pay-ok' : 'pay-warn'}>{s.iban ? `الآيبان: ${s.iban.slice(0, 6)}…${s.iban.slice(-4)}` : 'أضف الآيبان من الإعدادات أولاً'}</p>}
              {p.kind === 'link' && <input className="input" dir="ltr" value={m.link ?? ''} onChange={(e) => patch(p.key, { link: e.target.value })} placeholder="https://… رابط الدفع" aria-label={`رابط ${p.label}`} />}
              {p.kind === 'account' && <input className="input" dir="ltr" value={m.account ?? ''} onChange={(e) => patch(p.key, { account: e.target.value })} placeholder="05XXXXXXXX" aria-label={`رقم ${p.label}`} />}
              <input className="input" value={m.note ?? ''} onChange={(e) => patch(p.key, { note: e.target.value })} placeholder="ملاحظة للعميل (اختياري)" aria-label="ملاحظة" />
              <small className="muted">{p.how}</small>
            </div>
          )
        })}
      </div>
      <div className="panel panel-pad pay-api">
        <b>الربط التلقائي الكامل (API)</b>
        <p className="muted">حالياً يدفع العميل عبر رابط البوابة أو التحويل، ويبلغك من البوابة، وأنت تؤكد الاستلام بضغطة من «المالية ← الفواتير». إذا فتحت حساب تاجر لدى ميسّر أو Tap أو HyperPay، أقدر أربطها بحيث تتأكد الدفعة وتتحدث الفاتورة تلقائياً بدون تدخل. مفاتيح الربط السرية تُحفظ في الخادم فقط، ولا تُكتب هنا.</p>
      </div>
    </div>
  )
}
