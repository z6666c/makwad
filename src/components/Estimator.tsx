import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { DEPOSIT_RATE, DURATIONS, defaultInput, estimate, estimateSummary, fmtDays, fmtSAR, getService } from '@/estimate'
import type { Coupon, EstimateInput, ServiceKey } from '@/estimate'
import { usePricing } from '@/site-config'

type Props = {
  service: ServiceKey
  onService: (k: ServiceKey) => void
  onUse: (summary: string, plan: string, types: Array<string>, amount: number, coupon?: string) => void
  /** Set by the plan cards; `n` changes on every pick so the same plan can be re-applied. */
  preset?: { service: ServiceKey; tier: string; n: number } | null
  /** Called with the fitting plan whenever the visitor changes the calculator. */
  onPlan?: (plan: string) => void
}

export function Estimator({ service, onService, onUse, preset, onPlan }: Props) {
  const catalog = usePricing()
  const [input, setInput] = useState<EstimateInput>(() => defaultInput(service, catalog))
  useEffect(() => {
    setInput((cur) => (cur.service === service ? cur : defaultInput(service, catalog)))
  }, [service, catalog])
  const touched = useRef(false)
  const edit: typeof setInput = (v) => { touched.current = true; setInput(v) }
  useEffect(() => {
    if (!preset) return
    touched.current = false
    setInput({ ...defaultInput(preset.service, catalog), tier: preset.tier })
    onService(preset.service)
  }, [preset?.n])
  const s = getService(input.service, catalog)
  const [codeText, setCodeText] = useState('')
  const [code, setCode] = useState('')
  const base = useMemo(() => estimate(input, catalog), [input, catalog])
  const check = useQuery(api.coupons.check, code ? { code, total: base.total } : 'skip') as
    | { ok: true; code: string; kind: 'percent' | 'fixed'; value: number }
    | { ok: false; error: string }
    | undefined
  const coupon: Coupon | null = check && check.ok ? { code: check.code, kind: check.kind, value: check.value } : null
  const e = useMemo(() => estimate(input, catalog, coupon), [input, catalog, coupon?.code, coupon?.value, coupon?.kind])
  useEffect(() => { if (touched.current) onPlan?.(e.plan) }, [e.plan])
  const toggle = (k: string) =>
    edit((v) => ({ ...v, addons: v.addons.includes(k) ? v.addons.filter((a) => a !== k) : [...v.addons, k] }))

  return (
    <div className="est">
      <div className="est-form">
        <fieldset className="est-group">
          <legend>الخدمة</legend>
          <div className="est-seg">
            {catalog.map((x) => (
              <label key={x.key} className={input.service === x.key ? 'on' : ''}>
                <input type="radio" name="est-service" value={x.key} checked={input.service === x.key}
                  onChange={() => { onService(x.key); edit(defaultInput(x.key, catalog)) }} />
                {x.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="est-group">
          <legend>{s.tierLabel}</legend>
          <div className="est-tiers">
            {s.tiers.map((t) => (
              <label key={t.key} className={input.tier === t.key ? 'on' : ''}>
                <input type="radio" name="est-tier" value={t.key} checked={input.tier === t.key}
                  onChange={() => edit((v) => ({ ...v, tier: t.key }))} />
                <span><b>{t.label}</b>{t.hint && <small>{t.hint}</small>}</span>
                <em className="mono">{fmtSAR(t.price)}{s.monthly ? ' / شهر' : ''}</em>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="est-group">
          <legend>إضافات <small className="muted">اختياري</small></legend>
          <div className="est-feats">
            {s.addons.map((a) => (
              <label key={a.key} className={input.addons.includes(a.key) ? 'on' : ''}>
                <input type="checkbox" checked={input.addons.includes(a.key)} onChange={() => toggle(a.key)} />
                <span><b>{a.label}</b>{a.hint && <small>{a.hint}</small>}</span>
                <em className="mono">+{fmtSAR(a.price)}</em>
              </label>
            ))}
          </div>
        </fieldset>

        {s.monthly ? (
          <fieldset className="est-group">
            <legend>مدة الاشتراك</legend>
            <div className="est-seg">
              {DURATIONS.map((d) => (
                <label key={d.months} className={input.months === d.months ? 'on' : ''}>
                  <input type="radio" name="est-months" checked={input.months === d.months}
                    onChange={() => edit((v) => ({ ...v, months: d.months }))} />
                  {d.label}{d.discount ? ` · خصم ${Math.round(d.discount * 100)}%` : ''}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="est-group est-toggles">
            <label><input type="checkbox" checked={input.urgent} onChange={(ev) => edit((v) => ({ ...v, urgent: ev.target.checked }))} /> تسليم مستعجل (+25%، مدة أقصر بنحو 30%)</label>
          </div>
        )}
      </div>

      <aside className="est-result" aria-live="polite">
        <form className="est-coupon" onSubmit={(ev) => { ev.preventDefault(); setCode(codeText.trim()) }}>
          <input value={codeText} onChange={(ev) => { setCodeText(ev.target.value); if (!ev.target.value) setCode('') }} placeholder="عندك كود خصم؟" aria-label="كود الخصم" dir="ltr" />
          <button type="submit" disabled={!codeText.trim()}>تطبيق</button>
        </form>
        {code && check && !check.ok && <small className="est-coupon-err">{check.error}</small>}
        {coupon && <small className="est-coupon-ok">تم تطبيق الكود {coupon.code} ✓</small>}
        <span className="kicker">عرض السعر المبدئي</span>
        <ul className="est-lines">
          {e.lines.map((l) => (
            <li key={l.label}><span>{l.label}</span><b className="mono">{l.amount < 0 ? '−' : ''}{fmtSAR(Math.abs(l.amount))}</b></li>
          ))}
        </ul>
        <div className="est-price"><span>الإجمالي</span><b className="mono">{fmtSAR(e.total)} <small>ريال</small></b></div>
        {s.monthly ? (
          <div className="est-row"><span>يعادل شهرياً</span><b><span className="mono">{fmtSAR(e.monthly ?? 0)}</span> ريال</b></div>
        ) : (
          <>
            <div className="est-row"><span>المدة المتوقعة</span><b>{fmtDays(e.daysLow, e.daysHigh)}</b></div>
            <div className="est-row"><span>الدفعة الأولى ({DEPOSIT_RATE * 100}%)</span><b><span className="mono">{fmtSAR(e.deposit)}</span> ريال</b></div>
          </>
        )}
        <div className="est-row"><span>الباقة المناسبة</span><b>{e.plan}</b></div>
        <button className="btn" type="button" onClick={() => onUse(estimateSummary(input, e, catalog), e.plan, [s.type], e.total, coupon?.code)}>اطلب عرضاً بهذه التفاصيل</button>
        <p className="est-note">الأسعار بالريال السعودي ولا تشمل ضريبة القيمة المضافة إن وُجدت. {s.note ?? ''} السعر النهائي يُعتمد بعد جلسة الاكتشاف المجانية.</p>
      </aside>
    </div>
  )
}
