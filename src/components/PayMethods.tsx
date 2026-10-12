// Payment channels: the list the admin configures, and how clients see it on invoices and in the portal.
import { COMPANY } from '@/site-config'
import type { SiteSettings } from '@/site-config'

export type PayMethod = { key: string; label: string; enabled: boolean; link?: string; account?: string; note?: string }

export const PAY_PROVIDERS: Array<{ key: string; label: string; kind: 'bank' | 'link' | 'account' | 'cash'; about: string; how: string }> = [
  { key: 'bank', label: 'تحويل بنكي', kind: 'bank', about: 'يظهر للعميل اسم البنك والآيبان من «بيانات المنشأة».', how: 'أضف البنك والآيبان من الإعدادات ← بيانات المنشأة.' },
  { key: 'stcpay', label: 'STC Pay', kind: 'account', about: 'تحويل فوري لرقم جوالك في STC Pay.', how: 'اكتب رقم الجوال المسجل في STC Pay.' },
  { key: 'moyasar', label: 'ميسّر Moyasar', kind: 'link', about: 'مدى وفيزا وماستركارد وApple Pay وSTC Pay. بوابة سعودية.', how: 'من لوحة ميسّر أنشئ «رابط دفع» وانسخه هنا.' },
  { key: 'tap', label: 'تاب Tap', kind: 'link', about: 'مدى والبطاقات وApple Pay، منتشرة خليجياً.', how: 'من لوحة Tap أنشئ Payment Link وانسخه هنا.' },
  { key: 'hyperpay', label: 'هايبر باي HyperPay', kind: 'link', about: 'مدى والبطاقات وApple Pay وSTC Pay.', how: 'من لوحة HyperPay أنشئ رابط دفع (Pay by Link).' },
  { key: 'paylink', label: 'باي لينك Paylink', kind: 'link', about: 'روابط دفع وفواتير سريعة لمدى والبطاقات.', how: 'من Paylink أنشئ رابط دفع وانسخه هنا.' },
  { key: 'tabby', label: 'تابي Tabby', kind: 'link', about: 'قسّمها على 4 دفعات بدون فوائد.', how: 'يتطلب حساب تاجر في تابي، ثم انسخ رابط الدفع.' },
  { key: 'tamara', label: 'تمارا Tamara', kind: 'link', about: 'تقسيط بدون فوائد للعملاء.', how: 'يتطلب حساب تاجر في تمارا، ثم انسخ رابط الدفع.' },
  { key: 'paypal', label: 'PayPal', kind: 'link', about: 'للعملاء من خارج المملكة.', how: 'انسخ رابط PayPal.me أو رابط فاتورة PayPal.' },
  { key: 'cash', label: 'نقداً أو شبكة في المكتب', kind: 'cash', about: 'للعملاء اللي يزورونك.', how: 'فعّله فقط إذا تستقبل الدفع حضورياً.' },
]

export function defaultMethods(): Array<PayMethod> {
  return PAY_PROVIDERS.map((p) => ({ key: p.key, label: p.label, enabled: p.key === 'bank' }))
}

export function activeMethods(s: SiteSettings): Array<PayMethod> {
  const list = (s.payMethods && s.payMethods.length ? s.payMethods : defaultMethods()) as Array<PayMethod>
  return list.filter((m) => m.enabled && (m.key !== 'bank' || !!s.iban))
}

const ibanFmt = (x?: string) => (x ?? '').replace(/(.{4})/g, '$1 ').trim()

// Printed on invoices/quotes and shown in the client portal.
export function PayMethodsBox({ s, compact = false }: { s: SiteSettings; compact?: boolean }) {
  const methods = activeMethods(s)
  if (!methods.length) return null
  return (
    <div className={compact ? 'paybox compact' : 'paybox'}>
      <small>طرق الدفع</small>
      <ul>
        {methods.map((m) => (
          <li key={m.key}>
            <b>{m.label}</b>
            {m.key === 'bank' ? (
              <span>{s.bankName || 'الحساب البنكي'} · باسم {COMPANY.name} · <span className="mono">{ibanFmt(s.iban)}</span></span>
            ) : m.link ? (
              <a href={m.link} target="_blank" rel="noopener noreferrer">ادفع الآن ↗</a>
            ) : m.account ? (
              <span className="mono">{m.account}</span>
            ) : null}
            {m.note && <small className="muted">{m.note}</small>}
          </li>
        ))}
      </ul>
    </div>
  )
}
