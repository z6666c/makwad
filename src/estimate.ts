// Itemised, non-binding price calculator. All figures are in SAR, excluding VAT.

// Built-in keys are 'web' | 'mobile' | 'software' | 'ai' | 'analysis' | 'design' | 'integration' | 'maintenance';
// services added from the dashboard get their own keys.
export type ServiceKey = string

export type Option = { key: string; label: string; hint?: string; price: number; days: number }

export type Service = {
  key: ServiceKey
  label: string
  type: string // label used in the contact form
  from: number
  monthly?: boolean
  tierLabel: string
  tiers: Array<Option>
  addons: Array<Option>
  note?: string
  hidden?: boolean
  text?: string // card description for services added from the dashboard
  tags?: Array<string>
}

export const SERVICE_PRICING: Array<Service> = [
  {
    key: 'web', label: 'مواقع وتطبيقات الويب', type: 'موقع أو تطبيق ويب', from: 1500, tierLabel: 'نوع الموقع',
    tiers: [
      { key: 'landing', label: 'صفحة تعريفية واحدة', hint: 'صفحة هبوط لنشاطك أو حملة', price: 1500, days: 4 },
      { key: 'basic', label: 'موقع تعريفي', hint: 'حتى 5 صفحات', price: 3500, days: 8 },
      { key: 'company', label: 'موقع شركة متكامل', hint: 'حتى 12 صفحة', price: 6500, days: 14 },
      { key: 'store', label: 'متجر إلكتروني', hint: 'منتجات وسلة وطلبات', price: 9500, days: 20 },
      { key: 'platform', label: 'منصة ويب مخصصة', hint: 'حسابات وأدوار وعمليات خاصة', price: 18000, days: 35 },
    ],
    addons: [
      { key: 'cms', label: 'لوحة تحكم بالمحتوى', hint: 'تعدّل النصوص والصور بنفسك', price: 2500, days: 4 },
      { key: 'auth', label: 'تسجيل دخول وحسابات', hint: 'عملاء أو أعضاء', price: 1500, days: 3 },
      { key: 'pay', label: 'الدفع الإلكتروني', hint: 'مدى، Apple Pay، STC Pay', price: 2500, days: 4 },
      { key: 'booking', label: 'حجوزات ومواعيد', hint: 'تقويم وأوقات متاحة', price: 2000, days: 4 },
      { key: 'i18n', label: 'لغتان', hint: 'العربية والإنجليزية', price: 1200, days: 2 },
      { key: 'blog', label: 'مدونة وأخبار', hint: 'تصنيفات ومشاركة', price: 900, days: 2 },
      { key: 'seo', label: 'تهيئة محركات البحث', hint: 'SEO أساسي وربط Google', price: 800, days: 2 },
      { key: 'host', label: 'استضافة ونطاق لسنة', hint: 'مع شهادة أمان SSL', price: 600, days: 1 },
    ],
  },
  {
    key: 'mobile', label: 'تطبيقات الجوال', type: 'تطبيق جوال', from: 9000, tierLabel: 'حجم التطبيق',
    tiers: [
      { key: 'mvp', label: 'نسخة أولية لمنصة واحدة', hint: 'iOS أو أندرويد، حتى 6 شاشات', price: 9000, days: 20 },
      { key: 'dual', label: 'iOS وأندرويد', hint: 'حتى 12 شاشة', price: 16000, days: 30 },
      { key: 'mid', label: 'تطبيق متوسط', hint: 'iOS وأندرويد، حتى 25 شاشة', price: 28000, days: 45 },
      { key: 'full', label: 'منظومة متكاملة', hint: 'تطبيق عميل + مندوب + إدارة', price: 48000, days: 70 },
    ],
    addons: [
      { key: 'auth', label: 'تسجيل دخول وحسابات', hint: 'جوال أو بريد أو Apple/Google', price: 1500, days: 3 },
      { key: 'pay', label: 'الدفع الإلكتروني', hint: 'مدى، Apple Pay، STC Pay', price: 3000, days: 5 },
      { key: 'maps', label: 'خرائط وتتبع مباشر', hint: 'مواقع، مندوبين، مسارات', price: 4000, days: 7 },
      { key: 'push', label: 'إشعارات فورية', hint: 'تنبيهات وتذكيرات', price: 1000, days: 2 },
      { key: 'admin', label: 'لوحة تحكم للإدارة', hint: 'الطلبات والمحتوى والتقارير', price: 5000, days: 10 },
      { key: 'chat', label: 'محادثة داخل التطبيق', hint: 'بين العملاء أو مع الدعم', price: 4500, days: 7 },
      { key: 'booking', label: 'حجوزات ومواعيد', hint: 'تقويم وأوقات متاحة', price: 3000, days: 5 },
      { key: 'i18n', label: 'لغتان', hint: 'العربية والإنجليزية', price: 1500, days: 2 },
      { key: 'stores', label: 'النشر في المتاجر', hint: 'App Store وGoogle Play', price: 800, days: 2 },
    ],
  },
  {
    key: 'software', label: 'تطوير البرامج والأنظمة', type: 'برنامج أو نظام', from: 2500, tierLabel: 'حجم النظام',
    tiers: [
      { key: 'script', label: 'أداة أو أتمتة مخصصة', hint: 'برنامج صغير يختصر عملاً متكرراً', price: 2500, days: 6 },
      { key: 'small', label: 'نظام صغير', hint: 'وحدة واحدة: عملاء أو مخزون أو موظفين', price: 6000, days: 15 },
      { key: 'medium', label: 'نظام متوسط', hint: 'من 3 إلى 5 وحدات مترابطة', price: 14000, days: 30 },
      { key: 'erp', label: 'نظام متكامل', hint: 'ERP أو CRM حسب عمليات منشأتك', price: 30000, days: 60 },
    ],
    addons: [
      { key: 'roles', label: 'صلاحيات وأدوار', hint: 'مدير، موظف، محاسب…', price: 1500, days: 3 },
      { key: 'reports', label: 'تقارير ولوحة مؤشرات', hint: 'رسوم بيانية وتصدير Excel وPDF', price: 2500, days: 5 },
      { key: 'api', label: 'ربط مع نظام قائم', hint: 'API أو قاعدة بيانات حالية', price: 3000, days: 6 },
      { key: 'zatca', label: 'الفوترة الإلكترونية', hint: 'متوافقة مع متطلبات هيئة الزكاة', price: 3500, days: 7 },
      { key: 'migrate', label: 'نقل البيانات القديمة', hint: 'من Excel أو نظام سابق', price: 2000, days: 4 },
      { key: 'app', label: 'تطبيق جوال مرافق', hint: 'للموظفين أو العملاء', price: 8000, days: 15 },
      { key: 'backup', label: 'نسخ احتياطي تلقائي', hint: 'يومي مع استرجاع', price: 800, days: 1 },
    ],
  },
  {
    key: 'ai', label: 'أدوات الذكاء الاصطناعي', type: 'أداة ذكاء اصطناعي', from: 3500, tierLabel: 'نوع الأداة',
    tiers: [
      { key: 'webbot', label: 'مساعد محادثة للموقع', hint: 'يجيب عملاءك من معلوماتك', price: 3500, days: 7 },
      { key: 'wabot', label: 'روبوت واتساب ذكي', hint: 'ردود وطلبات وحجوزات آلياً', price: 5000, days: 10 },
      { key: 'docs', label: 'تحليل المستندات والتلخيص', hint: 'عقود، فواتير، تقارير', price: 6000, days: 12 },
      { key: 'automation', label: 'أتمتة سير العمل', hint: 'مهام تتنفذ بالذكاء الاصطناعي', price: 7500, days: 14 },
      { key: 'custom', label: 'نظام ذكاء مخصص', hint: 'توصيات أو تنبؤ أو تصنيف', price: 15000, days: 30 },
    ],
    addons: [
      { key: 'kb', label: 'تدريب على بيانات شركتك', hint: 'ملفات، أسئلة شائعة، كتالوج', price: 2000, days: 4 },
      { key: 'crm', label: 'ربط مع نظامك', hint: 'CRM أو متجر أو قاعدة بيانات', price: 2500, days: 5 },
      { key: 'dialect', label: 'فهم اللهجات المحلية', hint: 'السعودية والخليجية', price: 1000, days: 2 },
      { key: 'dash', label: 'لوحة متابعة', hint: 'المحادثات والنتائج والتقييم', price: 2000, days: 4 },
      { key: 'handoff', label: 'تحويل للموظف', hint: 'عند الحاجة لتدخل بشري', price: 800, days: 2 },
      { key: 'voice', label: 'الصوت', hint: 'تحويل الكلام إلى نص والعكس', price: 2500, days: 5 },
    ],
    note: 'رسوم استهلاك نماذج الذكاء الاصطناعي الشهرية تُدفع حسب الاستخدام الفعلي.',
  },
  {
    key: 'analysis', label: 'تحليل البرامج والمشاريع', type: 'تحليل مشروع', from: 1500, tierLabel: 'نوع التحليل',
    tiers: [
      { key: 'idea', label: 'تحليل فكرة واستشارة', hint: 'جلستان وتقرير بالتوصيات', price: 1500, days: 3 },
      { key: 'srs', label: 'وثيقة المتطلبات الكاملة', hint: 'SRS جاهزة لأي فريق تطوير', price: 3500, days: 7 },
      { key: 'audit', label: 'تدقيق نظام أو تطبيق قائم', hint: 'الكود والأداء والأمان', price: 4500, days: 8 },
      { key: 'feasibility', label: 'دراسة جدوى تقنية', hint: 'تقنيات وتكلفة وخطة تنفيذ', price: 6000, days: 12 },
    ],
    addons: [
      { key: 'wire', label: 'مخططات أولية للشاشات', hint: 'Wireframes قابلة للنقر', price: 1500, days: 4 },
      { key: 'competitors', label: 'تحليل المنافسين', hint: 'مقارنة الخصائص والأسعار', price: 1200, days: 3 },
      { key: 'plan', label: 'جدول تنفيذ وتكلفة تفصيلية', hint: 'مراحل ومخرجات وميزانية', price: 800, days: 2 },
      { key: 'security', label: 'اختبار أمان أساسي', hint: 'فحص الثغرات الشائعة', price: 2500, days: 4 },
      { key: 'perf', label: 'تقرير الأداء والسرعة', hint: 'مع خطة تحسين', price: 1000, days: 2 },
    ],
  },
  {
    key: 'design', label: 'تصميم تجربة المستخدم', type: 'تصميم', from: 1500, tierLabel: 'نطاق التصميم',
    tiers: [
      { key: 'page', label: 'تصميم صفحة واحدة', hint: 'واجهة جاهزة للتنفيذ', price: 1500, days: 3 },
      { key: 'site', label: 'تصميم موقع', hint: 'حتى 8 صفحات', price: 3500, days: 8 },
      { key: 'app', label: 'تصميم تطبيق', hint: 'حتى 15 شاشة', price: 6000, days: 12 },
      { key: 'system', label: 'نظام تصميم كامل', hint: 'مكونات وألوان وخطوط موحدة', price: 9000, days: 18 },
    ],
    addons: [
      { key: 'brand', label: 'شعار وهوية بصرية', hint: 'شعار وألوان ودليل استخدام', price: 2000, days: 6 },
      { key: 'proto', label: 'نموذج تفاعلي', hint: 'تجربه على جوالك قبل البرمجة', price: 1000, days: 2 },
      { key: 'test', label: 'اختبار مع مستخدمين', hint: '5 مستخدمين وتقرير', price: 2000, days: 4 },
      { key: 'dark', label: 'الوضع الداكن', hint: 'نسخة كاملة للواجهات', price: 800, days: 2 },
    ],
  },
  {
    key: 'integration', label: 'الدفع والربط', type: 'ربط وتكامل', from: 2000, tierLabel: 'نوع الربط',
    tiers: [
      { key: 'gateway', label: 'ربط بوابة دفع', hint: 'مدى، Apple Pay، STC Pay، تابي', price: 2000, days: 4 },
      { key: 'api', label: 'ربط مع خدمة خارجية', hint: 'شحن، رسائل SMS، خرائط…', price: 3000, days: 5 },
      { key: 'zatca', label: 'ربط الفوترة الإلكترونية', hint: 'مع هيئة الزكاة والضريبة', price: 4000, days: 7 },
      { key: 'multi', label: 'تكامل عدة أنظمة', hint: 'مزامنة بين المتجر والمحاسبة والمخزون', price: 9000, days: 15 },
    ],
    addons: [
      { key: 'sync', label: 'مزامنة مجدولة تلقائية', hint: 'كل ساعة أو يومياً', price: 1000, days: 2 },
      { key: 'logs', label: 'سجل عمليات وتنبيهات', hint: 'عند فشل أي عملية', price: 800, days: 2 },
      { key: 'docs', label: 'توثيق تقني', hint: 'لفريقك أو لمطورين آخرين', price: 700, days: 2 },
    ],
  },
  {
    key: 'maintenance', label: 'الصيانة والتطوير المستمر', type: 'صيانة', from: 1500, monthly: true, tierLabel: 'الباقة الشهرية',
    tiers: [
      { key: 'basic', label: 'أساسية', hint: 'متابعة الأعطال ونسخ احتياطي وتحديثات أمان', price: 1500, days: 0 },
      { key: 'plus', label: 'متقدمة', hint: '+ 10 ساعات تطوير شهرياً واستجابة خلال يوم', price: 3000, days: 0 },
      { key: 'pro', label: 'شاملة', hint: '+ 25 ساعة تطوير واستجابة خلال 4 ساعات', price: 5500, days: 0 },
    ],
    addons: [
      { key: 'hosting', label: 'إدارة الاستضافة والخوادم', hint: 'مراقبة وتوسعة عند الحاجة', price: 500, days: 0 },
      { key: 'reports', label: 'تقرير أداء شهري', hint: 'الزيارات والأعطال والتحسينات', price: 300, days: 0 },
      { key: 'store', label: 'تحديثات المتاجر', hint: 'توافق مع إصدارات iOS وأندرويد', price: 400, days: 0 },
    ],
  },
]

export const DURATIONS = [
  { months: 1, label: 'شهر', discount: 0 },
  { months: 3, label: '3 أشهر', discount: 0.05 },
  { months: 6, label: '6 أشهر', discount: 0.1 },
  { months: 12, label: 'سنة', discount: 0.15 },
]

export const MIN_PRICE = 1500
export const URGENT_RATE = 0.25
export const DEPOSIT_RATE = 0.4

export type EstimateInput = {
  service: ServiceKey
  tier: string
  addons: Array<string>
  urgent: boolean
  months: number
}

export type Coupon = { code: string; kind: 'percent' | 'fixed'; value: number }

export const couponOff = (c: Coupon, total: number) =>
  Math.min(total, c.kind === 'percent' ? Math.round((total * c.value) / 100) : Math.round(c.value))

const withCoupon = (e: Estimate, c: Coupon | null | undefined, monthly: boolean): Estimate => {
  if (!c) return e
  const off = couponOff(c, e.total)
  if (!off) return e
  const total = e.total - off
  return {
    ...e,
    lines: [...e.lines, { label: `كود الخصم ${c.code}${c.kind === 'percent' ? ` (${c.value}%)` : ''}`, amount: -off }],
    total,
    deposit: monthly ? Math.round(total / e.months) : Math.round(total * DEPOSIT_RATE),
    monthly: e.monthly === null ? null : Math.round(total / e.months),
    plan: planFor(total),
  }
}

export type Line = { label: string; amount: number }

export type Estimate = {
  lines: Array<Line>
  subtotal: number
  total: number
  deposit: number
  daysLow: number
  daysHigh: number
  monthly: number | null
  months: number
  plan: string
}

export type Catalog = Array<Service>

export const getService = (k: ServiceKey, catalog: Catalog = SERVICE_PRICING) =>
  catalog.find((s) => s.key === k) ?? catalog[0] ?? SERVICE_PRICING[0]

export function defaultInput(k: ServiceKey, catalog: Catalog = SERVICE_PRICING): EstimateInput {
  const s = getService(k, catalog)
  return { service: k, tier: s.tiers[0].key, addons: [], urgent: false, months: 1 }
}

export function planFor(total: number): string {
  if (total <= 6000) return 'الانطلاقة'
  if (total <= 30000) return 'النمو'
  return 'المنشآت'
}

export function estimate(input: EstimateInput, catalog: Catalog = SERVICE_PRICING, coupon?: Coupon | null): Estimate {
  const s = getService(input.service, catalog)
  return withCoupon(baseEstimate(input, s), coupon, !!s.monthly)
}

function baseEstimate(input: EstimateInput, s: Service): Estimate {
  const tier = s.tiers.find((t) => t.key === input.tier) ?? s.tiers[0]
  const addons = s.addons.filter((a) => input.addons.includes(a.key))
  const lines: Array<Line> = [{ label: tier.label, amount: tier.price }, ...addons.map((a) => ({ label: a.label, amount: a.price }))]
  let days = tier.days + addons.reduce((n, a) => n + a.days, 0)

  if (s.monthly) {
    const d = DURATIONS.find((x) => x.months === input.months) ?? DURATIONS[0]
    const monthly = lines.reduce((n, l) => n + l.amount, 0)
    const gross = monthly * d.months
    if (d.months > 1) lines.push({ label: `× ${d.months} أشهر`, amount: gross - monthly })
    if (d.discount) lines.push({ label: `خصم الاشتراك ${Math.round(d.discount * 100)}%`, amount: -Math.round(gross * d.discount) })
    const total = Math.max(MIN_PRICE, gross - Math.round(gross * d.discount))
    return { lines, subtotal: gross, total, deposit: Math.round(total / d.months), daysLow: 0, daysHigh: 0, monthly: Math.round(total / d.months), months: d.months, plan: planFor(total) }
  }

  const subtotal = lines.reduce((n, l) => n + l.amount, 0)
  if (input.urgent) {
    lines.push({ label: `تسليم مستعجل +${URGENT_RATE * 100}%`, amount: Math.round(subtotal * URGENT_RATE) })
    days = Math.ceil(days * 0.7)
  }
  const total = Math.max(MIN_PRICE, lines.reduce((n, l) => n + l.amount, 0))
  const daysLow = Math.max(3, days)
  const daysHigh = Math.max(daysLow + 2, Math.round(days * 1.3))
  return { lines, subtotal, total, deposit: Math.round(total * DEPOSIT_RATE), daysLow, daysHigh, monthly: null, months: 1, plan: planFor(total) }
}

export const fmtSAR = (n: number) => n.toLocaleString('en-US')

export function fmtDays(a: number, b: number): string {
  if (b <= 14) return `${a}–${b} يوم عمل`
  return `${Math.max(1, Math.round(a / 5))}–${Math.max(2, Math.round(b / 5))} أسابيع`
}

export function estimateSummary(input: EstimateInput, e: Estimate, catalog: Catalog = SERVICE_PRICING): string {
  const s = getService(input.service, catalog)
  const out = ['من حاسبة الأسعار في الموقع:', `• الخدمة: ${s.label}`]
  for (const l of e.lines) out.push(`• ${l.label}: ${l.amount < 0 ? '−' : ''}${fmtSAR(Math.abs(l.amount))} ريال`)
  out.push(`• الإجمالي: ${fmtSAR(e.total)} ريال${s.monthly ? '' : `، المدة ${fmtDays(e.daysLow, e.daysHigh)}`}`, '', 'نبذة عن الفكرة: ')
  return out.join('\n')
}
