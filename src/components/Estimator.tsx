import { useEffect, useMemo, useState } from 'react'
import { DEPOSIT_RATE, DURATIONS, SERVICE_PRICING, defaultInput, estimate, estimateSummary, fmtDays, fmtSAR, getService } from '@/estimate'
import type { EstimateInput, ServiceKey } from '@/estimate'

type Props = {
  service: ServiceKey
  onService: (k: ServiceKey) => void
  onUse: (summary: string, plan: string, types: Array<string>) => void
}

export function Estimator({ service, onService, onUse }: Props) {
  const [input, setInput] = useState<EstimateInput>(() => defaultInput(service))
  useEffect(() => {
    setInput((cur) => (cur.service === service ? cur : defaultInput(service)))
  }, [service])
  const s = getService(input.service)
  const e = useMemo(() => estimate(input), [input])
  const toggle = (k: string) =>
    setInput((v) => ({ ...v, addons: v.addons.includes(k) ? v.addons.filter((a) => a !== k) : [...v.addons, k] }))

  return (
    <div className="est">
      <div className="est-form">
        <fieldset className="est-group">
          <legend>الخدمة</legend>
          <div className="est-seg">
            {SERVICE_PRICING.map((x) => (
              <label key={x.key} className={input.service === x.key ? 'on' : ''}>
                <input type="radio" name="est-service" value={x.key} checked={input.service === x.key}
                  onChange={() => { onService(x.key); setInput(defaultInput(x.key)) }} />
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
                  onChange={() => setInput((v) => ({ ...v, tier: t.key }))} />
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
                    onChange={() => setInput((v) => ({ ...v, months: d.months }))} />
                  {d.label}{d.discount ? ` · خصم ${Math.round(d.discount * 100)}%` : ''}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="est-group est-toggles">
            <label><input type="checkbox" checked={input.urgent} onChange={(ev) => setInput((v) => ({ ...v, urgent: ev.target.checked }))} /> تسليم مستعجل (+25%، مدة أقصر بنحو 30%)</label>
          </div>
        )}
      </div>

      <aside className="est-result" aria-live="polite">
        <span className="kicker">عرض السعر المبدئي</span>
        <ul className="est-lines">
          {e.lines.map((l) => (
            <li key={l.label}><span>{l.label}</span><b className="mono">{l.amount < 0 ? '−' : ''}{fmtSAR(Math.abs(l.amount))}</b></li>
          ))}
        </ul>
        <div className="est-price"><span>الإجمالي</span><b className="mono">{fmtSAR(e.total)} <small>ريال</small></b></div>
        {s.monthly ? (
          <div className="est-row"><span>يعادل شهرياً</span><b className="mono">{fmtSAR(e.monthly ?? 0)} ريال</b></div>
        ) : (
          <>
            <div className="est-row"><span>المدة المتوقعة</span><b>{fmtDays(e.daysLow, e.daysHigh)}</b></div>
            <div className="est-row"><span>الدفعة الأولى ({DEPOSIT_RATE * 100}%)</span><b className="mono">{fmtSAR(e.deposit)} ريال</b></div>
          </>
        )}
        <div className="est-row"><span>الباقة المناسبة</span><b>{e.plan}</b></div>
        <button className="btn" type="button" onClick={() => onUse(estimateSummary(input, e), e.plan, [s.type])}>اطلب عرضاً بهذه التفاصيل</button>
        <p className="est-note">الأسعار بالريال السعودي ولا تشمل ضريبة القيمة المضافة إن وُجدت. {s.note ?? ''} السعر النهائي يُعتمد بعد جلسة الاكتشاف المجانية.</p>
      </aside>
    </div>
  )
}
