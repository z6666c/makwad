import { useMemo, useState } from 'react'
import { FEATURES, PLATFORMS, estimate, estimateSummary, fmtSAR } from '@/estimate'
import type { EstimateInput, FeatureKey, Platform } from '@/estimate'

export function Estimator({ onUse }: { onUse: (summary: string, plan: string, types: Array<string>) => void }) {
  const [input, setInput] = useState<EstimateInput>({
    platform: 'mobile',
    screens: 12,
    features: ['login', 'payments', 'notifications'],
    customDesign: false,
    urgent: false,
  })
  const e = useMemo(() => estimate(input), [input])
  const toggle = (k: FeatureKey) =>
    setInput((s) => ({ ...s, features: s.features.includes(k) ? s.features.filter((f) => f !== k) : [...s.features, k] }))

  return (
    <div className="est">
      <div className="est-form">
        <fieldset className="est-group">
          <legend>المنصة</legend>
          <div className="est-seg">
            {PLATFORMS.map((p) => (
              <label key={p.key} className={input.platform === p.key ? 'on' : ''}>
                <input type="radio" name="est-platform" value={p.key} checked={input.platform === p.key}
                  onChange={() => setInput((s) => ({ ...s, platform: p.key as Platform }))} />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="est-group">
          <label htmlFor="est-screens" className="est-label">عدد الشاشات التقريبي <b className="mono">{input.screens}</b></label>
          <input id="est-screens" type="range" min={4} max={50} step={1} value={input.screens}
            onChange={(ev) => setInput((s) => ({ ...s, screens: Number(ev.target.value) }))} />
          <div className="est-scale"><span>بسيط · 4</span><span>متوسط · 20</span><span>كبير · 50</span></div>
        </div>

        <fieldset className="est-group">
          <legend>الخصائص المطلوبة</legend>
          <div className="est-feats">
            {FEATURES.map((f) => (
              <label key={f.key} className={input.features.includes(f.key) ? 'on' : ''}>
                <input type="checkbox" checked={input.features.includes(f.key)} onChange={() => toggle(f.key)} />
                <span><b>{f.label}</b><small>{f.hint}</small></span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="est-group est-toggles">
          <label><input type="checkbox" checked={input.customDesign} onChange={(ev) => setInput((s) => ({ ...s, customDesign: ev.target.checked }))} /> هوية وتصميم مخصص بالكامل</label>
          <label><input type="checkbox" checked={input.urgent} onChange={(ev) => setInput((s) => ({ ...s, urgent: ev.target.checked }))} /> أحتاجه بشكل مستعجل</label>
        </div>
      </div>

      <aside className="est-result" aria-live="polite">
        <span className="kicker">التقدير المبدئي</span>
        <div className="est-price"><b className="mono">{fmtSAR(e.low)} – {fmtSAR(e.high)}</b><span>ريال سعودي</span></div>
        <div className="est-row"><span>المدة المتوقعة</span><b>{e.weeksLow}–{e.weeksHigh} أسبوعاً</b></div>
        <div className="est-row"><span>الباقة المقترحة</span><b>{e.plan}</b></div>
        <div className="est-row"><span>الخصائص المختارة</span><b>{input.features.length}</b></div>
        <button className="btn" type="button" onClick={() => {
          const types = input.platform === 'web' ? ['تطبيق ويب'] : input.platform === 'all' ? ['تطبيق جوال', 'تطبيق ويب'] : ['تطبيق جوال']
          onUse(estimateSummary(input, e), e.plan, types)
        }}>اطلب عرضاً بهذه التفاصيل</button>
        <p className="est-note">تقدير تقريبي غير ملزم. السعر النهائي يتحدد بعد جلسة الاكتشاف المجانية ودراسة التفاصيل.</p>
      </aside>
    </div>
  )
}
