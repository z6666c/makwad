import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { DEPOSIT_RATE, DURATIONS, defaultInput, withPlans, PLANS_KEY, estimate, estimateSummary, fmtDays, fmtSAR, getService } from '@/estimate'
import type { Coupon, EstimateInput, ServiceKey } from '@/estimate'
import { usePricing } from '@/site-config'
import { PLANS } from '@/site-content'
import { PLANS_EN, localizeCatalog, planName } from '@/content-en'
import { useLang } from '@/i18n'

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
  const pricing = usePricing()
  const { lang, t } = useLang()
  const catalog = useMemo(() => localizeCatalog(withPlans(pricing, lang === 'en' ? PLANS_EN : PLANS, lang), lang), [pricing, lang])
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
  const base = useMemo(() => estimate(input, catalog, null, lang), [input, catalog, lang])
  const check = useQuery(api.coupons.check, code ? { code, total: base.total } : 'skip') as
    | { ok: true; code: string; kind: 'percent' | 'fixed'; value: number }
    | { ok: false; error: string }
    | undefined
  const coupon: Coupon | null = check && check.ok ? { code: check.code, kind: check.kind, value: check.value } : null
  const e = useMemo(() => estimate(input, catalog, coupon, lang), [input, catalog, coupon?.code, coupon?.value, coupon?.kind, lang])
  // on the plans service the chosen plan decides, whatever add-ons push the total to
  const fitPlan = input.service === PLANS_KEY ? (PLANS[s.tiers.findIndex((x) => x.key === input.tier)]?.name ?? e.plan) : e.plan
  const tx = t
  useEffect(() => { if (touched.current) onPlan?.(fitPlan) }, [fitPlan])
  const toggle = (k: string) =>
    edit((v) => ({ ...v, addons: v.addons.includes(k) ? v.addons.filter((a) => a !== k) : [...v.addons, k] }))

  return (
    <div className="est">
      <div className="est-form">
        <fieldset className="est-group">
          <legend>{t('الخدمة', 'Service')}</legend>
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
            {s.tiers.map((tr) => (
              <label key={tr.key} className={input.tier === tr.key ? 'on' : ''}>
                <input type="radio" name="est-tier" value={tr.key} checked={input.tier === tr.key}
                  onChange={() => edit((v) => ({ ...v, tier: tr.key }))} />
                <span><b>{tr.label}</b>{tr.hint && <small>{tr.hint}</small>}</span>
                <em className="mono">{fmtSAR(tr.price)}{s.monthly ? tx(' / شهر', ' / month') : ''}</em>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="est-group">
          <legend>{t('إضافات', 'Add-ons')} <small className="muted">{t('اختياري', 'optional')}</small></legend>
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
            <legend>{t('مدة الاشتراك', 'Subscription length')}</legend>
            <div className="est-seg">
              {DURATIONS.map((d) => (
                <label key={d.months} className={input.months === d.months ? 'on' : ''}>
                  <input type="radio" name="est-months" checked={input.months === d.months}
                    onChange={() => edit((v) => ({ ...v, months: d.months }))} />
                  {lang === 'en' ? d.en : d.label}{d.discount ? ` · ${t('خصم', 'save')} ${Math.round(d.discount * 100)}%` : ''}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="est-group est-toggles">
            <label><input type="checkbox" checked={input.urgent} onChange={(ev) => edit((v) => ({ ...v, urgent: ev.target.checked }))} /> {t('تسليم مستعجل (+25%، مدة أقصر بنحو 30%)', 'Rush delivery (+25%, about 30% faster)')}</label>
          </div>
        )}
      </div>

      <aside className="est-result" aria-live="polite">
        <form className="est-coupon" onSubmit={(ev) => { ev.preventDefault(); setCode(codeText.trim()) }}>
          <input value={codeText} onChange={(ev) => { setCodeText(ev.target.value); if (!ev.target.value) setCode('') }} placeholder={t('عندك كود خصم؟', 'Have a discount code?')} aria-label={t('كود الخصم', 'Discount code')} dir="ltr" />
          <button type="submit" disabled={!codeText.trim()}>{t('تطبيق', 'Apply')}</button>
        </form>
        {code && check && !check.ok && <small className="est-coupon-err">{check.error}</small>}
        {coupon && <small className="est-coupon-ok">{t('تم تطبيق الكود', 'Code applied:')} {coupon.code} ✓</small>}
        <span className="kicker">{t('عرض السعر المبدئي', 'Initial estimate')}</span>
        <ul className="est-lines">
          {e.lines.map((l) => (
            <li key={l.label}><span>{l.label}</span><b className="mono">{l.amount < 0 ? '−' : ''}{fmtSAR(Math.abs(l.amount))}</b></li>
          ))}
        </ul>
        <div className="est-price"><span>{t('الإجمالي', 'Total')}</span><b className="mono">{fmtSAR(e.total)} <small>{t('ريال', 'SAR')}</small></b></div>
        {s.monthly ? (
          <div className="est-row"><span>{t('يعادل شهرياً', 'Per month')}</span><b><span className="mono">{fmtSAR(e.monthly ?? 0)}</span> {t('ريال', 'SAR')}</b></div>
        ) : (
          <>
            <div className="est-row"><span>{t('المدة المتوقعة', 'Expected timeline')}</span><b>{fmtDays(e.daysLow, e.daysHigh, lang)}</b></div>
            <div className="est-row"><span>{t('الدفعة الأولى', 'First payment')} ({DEPOSIT_RATE * 100}%)</span><b><span className="mono">{fmtSAR(e.deposit)}</span> {t('ريال', 'SAR')}</b></div>
          </>
        )}
        <div className="est-row"><span>{t('الباقة المناسبة', 'Matching plan')}</span><b>{planName(fitPlan, lang)}</b></div>
        <button className="btn" type="button" onClick={() => onUse(estimateSummary(input, e, catalog, lang), fitPlan, [s.type], e.total, coupon?.code)}>{t('اطلب عرضاً بهذه التفاصيل', 'Request a quote with these details')}</button>
        <p className="est-note">{t('الأسعار بالريال السعودي ولا تشمل ضريبة القيمة المضافة إن وُجدت.', 'Prices are in Saudi riyals and exclude VAT where it applies.')} {s.note ?? ''} {t('السعر النهائي يُعتمد بعد جلسة الاكتشاف المجانية.', 'The final price is confirmed after the free discovery session.')}</p>
      </aside>
    </div>
  )
}
